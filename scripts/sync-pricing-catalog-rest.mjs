import fs from "node:fs"
import path from "node:path"
import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"
import { resolveBitrixVariantEnumId, resolveBitrixPolishLabel } from "./lib/bitrix-variant-enum-map.mjs"

const root = path.resolve(import.meta.dirname, "..")
dotenv.config({ path: path.join(root, ".env.local") })
dotenv.config({ path: path.join(root, ".env") })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) throw new Error("Missing Supabase URL or service role key in .env")

const supabase = createClient(url, key, { auth: { persistSession: false } })
const table = (name) => supabase.schema("evapremium_shop").from(name)
const pricing = JSON.parse(
  fs.readFileSync(path.join(root, "src/data/evamats-cennik.normalized.json"), "utf8"),
)
const bitrix = JSON.parse(
  fs.readFileSync(
    path.join(root, "src/data/evamats-bitrix-variant-mapping.normalized.json"),
    "utf8",
  ),
)
const templateOverrides = JSON.parse(
  fs.readFileSync(
    path.join(root, "src/data/evamats-template-pricing-overrides.json"),
    "utf8",
  ),
)

const categoryOrder = [
  "passenger_car",
  "minivan",
  "bus",
  "pickup",
  "heavy_truck",
  "passenger_car_legacy",
]
const variants = new Map()
const matrixSource = []
const categoryVariantSource = []

const addPrice = (category, item, matType, block) => {
  const basePrice = block?.base_price_pln ?? block?.price_pln
  if (basePrice == null || basePrice > 99999.99) return
  const candidates = [
    block.after_discount,
    block.after_discount_20,
    block.after_discount_30,
  ].filter(Boolean)
  const after = candidates.find((candidate) => candidate.price_after_discount_pln != null)
  const discountedPrice =
    after?.price_after_discount_pln <= 99999.99
      ? after.price_after_discount_pln
      : null
  matrixSource.push({
    category_slug: category.id,
    variant_key: item.variant_key,
    mat_type: matType,
    base_price_pln: basePrice,
    price_after_discount_pln: discountedPrice,
    discount_excluded:
      !after && candidates.some((candidate) => candidate.excluded === true),
  })
}

for (const category of Object.values(pricing.categories)) {
  if (!categoryOrder.includes(category.id)) continue
  category.items.forEach((item, index) => {
    if (!item.variant_key || !item.variant_label) return
    variants.set(item.variant_key, {
      variant_key: item.variant_key,
      variant_label: item.variant_label,
      configurator_slug: item.variant_slug,
      sort_order: index + 1,
    })
    categoryVariantSource.push({
      category_slug: category.id,
      variant_key: item.variant_key,
      sort_order: index + 1,
    })
    if (category.pricing_model === "single_price") {
      addPrice(category, item, "single", item)
    } else {
      addPrice(category, item, "classic", item.classic)
      addPrice(category, item, "3d-with-rims", item.rims_3d)
    }
  })
}

const failOnError = (result, action) => {
  if (result.error) throw new Error(`${action}: ${result.error.message}`)
  return result.data ?? []
}

const deleteAll = async (name, column = "id") => {
  failOnError(
    await table(name).delete().not(column, "is", null),
    `clear ${name}`,
  )
}

const insertPackages = async (name, rows, size = 500) => {
  for (let index = 0; index < rows.length; index += size) {
    failOnError(
      await table(name).insert(rows.slice(index, index + size)),
      `insert ${name} ${index + 1}-${Math.min(index + size, rows.length)}`,
    )
  }
}

const main = async () => {
  const clearTargets = [
    ["pricing_bitrix_mappings", "id"],
    ["pricing_template_overrides", "id"],
    ["pricing_matrix", "id"],
    ["pricing_category_variants", "vehicle_category_id"],
    ["pricing_category_aliases", "alias_slug"],
    ["pricing_extras", "id"],
    ["pricing_catalog_versions", "id"],
    ["pricing_variants", "id"],
    ["pricing_vehicle_categories", "id"],
  ]
  for (const [name, column] of clearTargets) {
    await deleteAll(name, column)
  }

  const [catalog] = failOnError(
    await table("pricing_catalog_versions")
      .insert({
        code: "evamats_v2",
        name: "Cennik EVAMATS v2",
        source_file: "CENNIK EVAMATS (3).xlsx",
        is_active: true,
      })
      .select("id"),
    "insert catalog",
  )
  const categoryRows = categoryOrder
    .filter((slug) => pricing.categories[slug])
    .map((slug, index) => ({
      slug,
      label: pricing.categories[slug].label,
      pricing_model: pricing.categories[slug].pricing_model,
      sort_order: index + 1,
    }))
  const savedCategories = failOnError(
    await table("pricing_vehicle_categories").insert(categoryRows).select("id,slug"),
    "insert categories",
  )
  const savedVariants = failOnError(
    await table("pricing_variants").insert([...variants.values()]).select("id,variant_key"),
    "insert variants",
  )
  const categoryIds = new Map(savedCategories.map((row) => [row.slug, row.id]))
  const variantIds = new Map(savedVariants.map((row) => [row.variant_key, row.id]))

  await insertPackages("pricing_category_aliases", [{
    alias_slug: "premium_passenger_car",
    vehicle_category_id: categoryIds.get("passenger_car"),
  }])
  await insertPackages(
    "pricing_category_variants",
    categoryVariantSource.map((row) => ({
      vehicle_category_id: categoryIds.get(row.category_slug),
      variant_id: variantIds.get(row.variant_key),
      sort_order: row.sort_order,
    })),
  )
  await insertPackages(
    "pricing_matrix",
    matrixSource.map((row) => ({
      catalog_version_id: catalog.id,
      vehicle_category_id: categoryIds.get(row.category_slug),
      variant_id: variantIds.get(row.variant_key),
      mat_type: row.mat_type,
      base_price_pln: row.base_price_pln,
      price_after_discount_pln: row.price_after_discount_pln,
      discount_excluded: row.discount_excluded,
    })),
  )

  const mappingRows = Object.values(bitrix.segments).flatMap((segment) =>
    segment.variants
      .filter(
        (variant) =>
          categoryIds.has(segment.pricing_table) &&
          variantIds.has(variant.pricing_variant_key),
      )
      .map((variant) => ({
        vehicle_category_id: categoryIds.get(segment.pricing_table),
        variant_id: variantIds.get(variant.pricing_variant_key),
        bitrix_field: segment.bitrix_field,
        bitrix_label:
          resolveBitrixPolishLabel(variant.pricing_variant_key) ??
          variant.variant_label,
        bitrix_enum_id:
          resolveBitrixVariantEnumId(
            segment.pricing_table,
            variant.pricing_variant_key,
          ) ?? null,
      })),
  )
  await insertPackages("pricing_bitrix_mappings", mappingRows)

  const overridesSource = fs.existsSync(
    path.join(root, "output/pricing-template-overrides-raw.json"),
  )
    ? JSON.parse(
        fs.readFileSync(
          path.join(root, "output/pricing-template-overrides-raw.json"),
          "utf8",
        ),
      ).overrides
    : templateOverrides.overrides

  const overrides = overridesSource.map((override) => ({
    catalog_version_id: catalog.id,
    brand_key: override.brand_key,
    model_family_key: override.model_family_key,
    variant_key: override.variant_key,
    override_category_slug: override.override_category_slug ?? null,
    fixed_base_price_pln: override.fixed_base_price_pln ?? null,
    surcharge_pln: override.surcharge_pln ?? 0,
    notes: override.notes ?? null,
  }))
  await insertPackages("pricing_template_overrides", overrides)

  console.log(
    `Synchronized pricing package: ${categoryRows.length} categories, ` +
      `${variants.size} variants, ${matrixSource.length} prices`,
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
