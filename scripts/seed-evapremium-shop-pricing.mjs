/**
 * Generates SQL seed for evapremium_shop pricing tables from normalized JSON.
 * Usage: node scripts/seed-evapremium-shop-pricing.mjs > output/pricing-seed.sql
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")

const cennik = JSON.parse(
  fs.readFileSync(path.join(root, "src/data/evamats-cennik.normalized.json"), "utf8")
)
const mapping = JSON.parse(
  fs.readFileSync(
    path.join(root, "src/data/evamats-vehicle-category-mapping.normalized.json"),
    "utf8"
  )
)

const esc = (v) => (v == null ? "NULL" : `'${String(v).replace(/'/g, "''")}'`)

const SKIP_VARIANT_KEYS = new Set(["rodziajkompletu"])

const VEHICLE_CATEGORY_MAP = {
  minivan: "minivany",
  auto_osobowe: "auta_osobowe",
  bus: "busy",
  pickup: "pickup",
}

const CATEGORY_VARIANTS = {
  auta_osobowe: ["front", "basic", "premium", "complete"],
  pickup: ["front", "basic", "premium", "complete"],
  minivany: ["front", "row_2", "row_3"],
  busy: ["row_1", "row_2", "row_3"],
  auta_ciezarowe: ["front", "row_1"],
  auto_osobowe_legacy: ["front", "basic", "premium", "complete"],
}

const slugifyExtra = (label) =>
  label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 80)

const extractDiscount = (flag) => {
  if (!flag) return { excluded: false, after: null }
  if (flag.excluded) return { excluded: true, after: null }
  if (flag.priceAfterDiscountPln != null) return { excluded: false, after: flag.priceAfterDiscountPln }
  return { excluded: false, after: null }
}

const variantMap = new Map()

for (const cat of Object.values(cennik.categories)) {
  for (const item of cat.items) {
    if (SKIP_VARIANT_KEYS.has(item.variantKey)) continue
    if (!item.variantKey || !item.variantLabel) continue
    if (!variantMap.has(item.variantKey)) {
      variantMap.set(item.variantKey, {
        variant_key: item.variantKey,
        variant_label: item.variantLabel,
        configurator_slug: item.variantSlug ?? null,
      })
    }
  }
}

const matrixRows = []

for (const [catSlug, cat] of Object.entries(cennik.categories)) {
  for (const item of cat.items) {
    if (SKIP_VARIANT_KEYS.has(item.variantKey)) continue
    if (!item.variantKey) continue

    if (cat.pricingModel === "dual_mat_type") {
      for (const matType of ["classic", "3d-with-rims"]) {
        const block = item[matType === "classic" ? "classic" : "rims3d"]
        if (block?.basePricePln == null) continue
        if (block.basePricePln > 100000) continue
        const d = extractDiscount(block.afterDiscount)
        matrixRows.push({
          category_slug: catSlug,
          variant_key: item.variantKey,
          mat_type: matType,
          base_price_pln: block.basePricePln,
          price_after_discount_pln: d.after,
          discount_excluded: d.excluded,
        })
      }
    } else {
      if (item.pricePln == null || item.pricePln > 100000) continue
      const d20 = extractDiscount(item.afterDiscount20)
      const d30 = extractDiscount(item.afterDiscount30)
      const after = d20.after ?? d30.after
      const excluded = after == null && (d20.excluded || d30.excluded)
      matrixRows.push({
        category_slug: catSlug,
        variant_key: item.variantKey,
        mat_type: "single",
        base_price_pln: item.pricePln,
        price_after_discount_pln: after,
        discount_excluded: excluded,
      })
    }
  }
}

const modelRules = mapping.models.map((m) => ({
  model_key: m.modelKey,
  model_label: m.model,
  vehicle_category:
    m.vehicleCategory === "indywidualna_wycena"
      ? null
      : VEHICLE_CATEGORY_MAP[m.vehicleCategory] ?? null,
  pricing_mode: m.vehicleCategory === "indywidualna_wycena" ? "individual" : "matrix",
}))

const lines = []
lines.push("BEGIN;")
lines.push("")
lines.push("-- Clear existing seed (idempotent re-run)")
lines.push("DELETE FROM evapremium_shop.pricing_category_variants;")
lines.push("DELETE FROM evapremium_shop.pricing_matrix;")
lines.push("DELETE FROM evapremium_shop.pricing_model_rules;")
lines.push("DELETE FROM evapremium_shop.pricing_extras;")
lines.push("DELETE FROM evapremium_shop.pricing_variants;")
lines.push("DELETE FROM evapremium_shop.pricing_vehicle_categories;")
lines.push("DELETE FROM evapremium_shop.pricing_catalog_versions;")
lines.push("")

lines.push(`INSERT INTO evapremium_shop.pricing_catalog_versions (
  code, name, source_file, discount_threshold_pln, discount_rate_below, discount_rate_from,
  deposit_rules, is_active
) VALUES (
  'cennik_default',
  'Cennik EVAMATS',
  'CENNIK EVAMATS (1).xlsx',
  910, 0.2000, 0.3000,
  ${esc(cennik.meta.depositRules)},
  true
);`)
lines.push("")

const categories = [
  ["auta_osobowe", "Auta osobowe", "dual_mat_type", 1],
  ["minivany", "Minivany", "single_price", 2],
  ["busy", "Busy", "single_price", 3],
  ["pickup", "Pickupy", "dual_mat_type", 4],
  ["auta_ciezarowe", "Auta ciężarowe", "single_price", 5],
  ["auto_osobowe_legacy", 'Auto osobowe poniżej 2000 / angliki', "dual_mat_type", 6],
]

for (const [slug, label, model, order] of categories) {
  lines.push(
    `INSERT INTO evapremium_shop.pricing_vehicle_categories (slug, label, pricing_model, sort_order)
VALUES (${esc(slug)}, ${esc(label)}, ${esc(model)}, ${order});`
  )
}
lines.push("")

for (const v of variantMap.values()) {
  lines.push(
    `INSERT INTO evapremium_shop.pricing_variants (variant_key, variant_label, configurator_slug)
VALUES (${esc(v.variant_key)}, ${esc(v.variant_label)}, ${esc(v.configurator_slug)});`
  )
}
lines.push("")

for (const [catSlug, slugs] of Object.entries(CATEGORY_VARIANTS)) {
  slugs.forEach((slug, idx) => {
    lines.push(`INSERT INTO evapremium_shop.pricing_category_variants (
  vehicle_category_id, variant_id, is_default, sort_order
)
SELECT vc.id, v.id, ${idx === 0}, ${idx + 1}
FROM evapremium_shop.pricing_vehicle_categories vc
JOIN evapremium_shop.pricing_variants v ON v.configurator_slug = ${esc(slug)}
WHERE vc.slug = ${esc(catSlug)};`)
  })
}
lines.push("")

for (const row of matrixRows) {
  lines.push(`INSERT INTO evapremium_shop.pricing_matrix (
  catalog_version_id, vehicle_category_id, variant_id, mat_type,
  base_price_pln, price_after_discount_pln, discount_excluded
)
SELECT cv.id, vc.id, v.id, ${esc(row.mat_type)},
  ${row.base_price_pln}, ${row.price_after_discount_pln ?? "NULL"}, ${row.discount_excluded}
FROM evapremium_shop.pricing_catalog_versions cv
JOIN evapremium_shop.pricing_vehicle_categories vc ON vc.slug = ${esc(row.category_slug)}
JOIN evapremium_shop.pricing_variants v ON v.variant_key = ${esc(row.variant_key)}
WHERE cv.code = 'cennik_default';`)
}
lines.push("")

for (const rule of modelRules) {
  const catSlug = rule.vehicle_category
  if (rule.pricing_mode === "individual" || !catSlug) {
    lines.push(`INSERT INTO evapremium_shop.pricing_model_rules (
  catalog_version_id, model_key, model_label, vehicle_category_id, pricing_mode
)
SELECT cv.id, ${esc(rule.model_key)}, ${esc(rule.model_label)}, NULL, 'individual'
FROM evapremium_shop.pricing_catalog_versions cv WHERE cv.code = 'cennik_default';`)
  } else {
    lines.push(`INSERT INTO evapremium_shop.pricing_model_rules (
  catalog_version_id, model_key, model_label, vehicle_category_id, pricing_mode
)
SELECT cv.id, ${esc(rule.model_key)}, ${esc(rule.model_label)}, vc.id, 'matrix'
FROM evapremium_shop.pricing_catalog_versions cv
JOIN evapremium_shop.pricing_vehicle_categories vc ON vc.slug = ${esc(catSlug)}
WHERE cv.code = 'cennik_default';`)
  }
}
lines.push("")

let extraOrder = 0
for (const extra of cennik.meta.extras ?? []) {
  if (extra.pricePln == null) continue
  extraOrder++
  lines.push(`INSERT INTO evapremium_shop.pricing_extras (
  catalog_version_id, slug, label, price_pln, discount_excluded, sort_order
)
SELECT cv.id, ${esc(slugifyExtra(extra.label))}, ${esc(extra.label)}, ${extra.pricePln}, true, ${extraOrder}
FROM evapremium_shop.pricing_catalog_versions cv WHERE cv.code = 'cennik_default';`)
}

for (const ship of Object.entries(cennik.meta.shipping ?? {})) {
  if (typeof ship[1] !== "object" || ship[1].pricePln == null) continue
  extraOrder++
  const item = ship[1]
  lines.push(`INSERT INTO evapremium_shop.pricing_extras (
  catalog_version_id, slug, label, price_pln, discount_excluded, sort_order
)
SELECT cv.id, ${esc(ship[0])}, ${esc(item.label)}, ${item.pricePln}, true, ${extraOrder}
FROM evapremium_shop.pricing_catalog_versions cv WHERE cv.code = 'cennik_default';`)
}

lines.push("")
lines.push("COMMIT;")
lines.push("")

const outPath = path.join(root, "output/pricing-seed.sql")
fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, lines.join("\n"), "utf8")
console.log(`Written ${outPath} (${lines.length} lines)`)
