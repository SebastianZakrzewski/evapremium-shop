import path from "node:path"
import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"
import { resolveBitrixVariantEnumId } from "./lib/bitrix-variant-enum-map.mjs"

const root = path.resolve(import.meta.dirname, "..")
dotenv.config({ path: path.join(root, ".env.local") })
dotenv.config({ path: path.join(root, ".env") })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) throw new Error("Missing Supabase URL or service role key in .env")

const supabase = createClient(url, key, { auth: { persistSession: false } })
const table = (name) => supabase.schema("evapremium_shop").from(name)

const failOnError = (result, action) => {
  if (result.error) throw new Error(`${action}: ${result.error.message}`)
  return result.data ?? []
}

const main = async () => {
  const categories = failOnError(
    await table("pricing_vehicle_categories").select("id,slug"),
    "load categories",
  )
  const variants = failOnError(
    await table("pricing_variants").select("id,variant_key"),
    "load variants",
  )
  const mappings = failOnError(
    await table("pricing_bitrix_mappings").select(
      "id,vehicle_category_id,variant_id,bitrix_enum_id",
    ),
    "load mappings",
  )

  const categoryById = new Map(categories.map((row) => [row.id, row.slug]))
  const variantById = new Map(variants.map((row) => [row.id, row.variant_key]))

  let updated = 0
  for (const mapping of mappings) {
    const categorySlug = categoryById.get(mapping.vehicle_category_id)
    const variantKey = variantById.get(mapping.variant_id)
    if (!categorySlug || !variantKey) continue

    const enumId = resolveBitrixVariantEnumId(categorySlug, variantKey)
    if (enumId == null || mapping.bitrix_enum_id === enumId) continue

    failOnError(
      await table("pricing_bitrix_mappings")
        .update({ bitrix_enum_id: enumId })
        .eq("id", mapping.id),
      `update mapping ${mapping.id}`,
    )
    updated += 1
  }

  console.log(`Updated bitrix_enum_id on ${updated} pricing_bitrix_mappings rows`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
