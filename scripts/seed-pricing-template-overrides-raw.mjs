#!/usr/bin/env node
/**
 * Rebuilds pricing_template_overrides with raw MARKA/MODEL keys from mat_templates.
 * Maps legacy brand_key/model_family_key via evamats-templates.normalized.json + source_row_id.
 */
import fs from "node:fs"
import path from "node:path"
import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"

const root = path.resolve(import.meta.dirname, "..")
dotenv.config({ path: path.join(root, ".env") })

const normalizedPath = path.join(root, "src/data/evamats-templates.normalized.json")
const overridesPath = path.join(root, "src/data/evamats-template-pricing-overrides.json")
const rawUpdatesPath = path.join(root, "output/mat-templates-raw-brand-model-updates.json")
const outputPath = path.join(root, "output/pricing-template-overrides-raw.json")

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
if (!url || !key) throw new Error("Missing Supabase env in .env")

const normalized = JSON.parse(fs.readFileSync(normalizedPath, "utf8"))
const legacyOverrides = JSON.parse(fs.readFileSync(overridesPath, "utf8")).overrides
const rawBySourceId = new Map(
  JSON.parse(fs.readFileSync(rawUpdatesPath, "utf8")).map((row) => [
    row.source_row_id,
    row,
  ]),
)

const legacyIndex = new Map()
for (const record of normalized.records) {
  const legacyKey = `${record.brand_key}|${record.model_family_key}`
  const bucket = legacyIndex.get(legacyKey) ?? []
  bucket.push(record.id)
  legacyIndex.set(legacyKey, bucket)
}

const buildExpandedOverrides = () => {
  const expanded = []
  const warnings = []

  for (const override of legacyOverrides) {
    const legacyKey = `${override.brand_key}|${override.model_family_key}`
    const sourceIds = legacyIndex.get(legacyKey) ?? []
    if (!sourceIds.length) {
      warnings.push({ legacyKey, reason: "no normalized templates match" })
      continue
    }

    const pairs = new Map()
    for (const sourceId of sourceIds) {
      const raw = rawBySourceId.get(sourceId)
      if (!raw) continue
      const pairKey = `${raw.brand_key}|${raw.model_family_key}`
      pairs.set(pairKey, {
        brand_key: raw.brand_key,
        model_family_key: raw.model_family_key,
      })
    }

    if (!pairs.size) {
      warnings.push({ legacyKey, reason: "no raw labels for matched source rows" })
      continue
    }

    for (const pair of pairs.values()) {
      expanded.push({
        brand_key: pair.brand_key,
        model_family_key: pair.model_family_key,
        variant_key: override.variant_key,
        override_category_slug: override.override_category_slug ?? null,
        fixed_base_price_pln: override.fixed_base_price_pln ?? null,
        surcharge_pln: override.surcharge_pln ?? 0,
        notes: override.notes ?? null,
        legacy_brand_key: override.brand_key,
        legacy_model_family_key: override.model_family_key,
      })
    }
  }

  return { expanded, warnings }
}

const { expanded, warnings } = buildExpandedOverrides()
fs.mkdirSync(path.dirname(outputPath), { recursive: true })
fs.writeFileSync(
  outputPath,
  JSON.stringify(
    {
      meta: {
        generated_at: new Date().toISOString(),
        source: "scripts/seed-pricing-template-overrides-raw.mjs",
        legacy_override_count: legacyOverrides.length,
        expanded_override_count: expanded.length,
        warnings,
      },
      overrides: expanded,
    },
    null,
    2,
  ),
  "utf8",
)

console.log(`Legacy overrides: ${legacyOverrides.length}`)
console.log(`Expanded raw overrides: ${expanded.length}`)
if (warnings.length) {
  console.log("Warnings:", JSON.stringify(warnings, null, 2))
}

const isDryRun = process.argv.includes("--dry-run")
if (isDryRun) {
  console.log(`Wrote ${outputPath}`)
  process.exit(0)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })

const { data: catalog, error: catalogError } = await supabase
  .schema("evapremium_shop")
  .from("pricing_catalog_versions")
  .select("id")
  .eq("is_active", true)
  .single()

if (catalogError || !catalog) {
  throw new Error(catalogError?.message ?? "Active pricing catalog not found")
}

const deleteSql = `DELETE FROM evapremium_shop.pricing_template_overrides WHERE catalog_version_id = '${catalog.id}';`

const valuesSql = expanded
  .map((row) => {
    const esc = (value) =>
      value == null ? "NULL" : `'${String(value).replace(/'/g, "''")}'`
    return `(
      '${catalog.id}',
      ${esc(row.brand_key)},
      ${esc(row.model_family_key)},
      ${esc(row.variant_key)},
      ${esc(row.override_category_slug)},
      ${row.fixed_base_price_pln == null ? "NULL" : row.fixed_base_price_pln},
      ${row.surcharge_pln ?? 0},
      ${esc(row.notes)}
    )`
  })
  .join(",\n")

const insertSql = `
INSERT INTO evapremium_shop.pricing_template_overrides (
  catalog_version_id,
  brand_key,
  model_family_key,
  variant_key,
  override_category_slug,
  fixed_base_price_pln,
  surcharge_pln,
  notes
)
VALUES
${valuesSql};
`

const query = `BEGIN;\n${deleteSql}\n${insertSql}\nCOMMIT;`

const { error: rpcError } = await supabase.rpc("exec_mat_seed_sql", {
  q: query.replace(/^\s*BEGIN;\s*/i, "").replace(/\s*COMMIT;\s*$/i, "").trim(),
})

if (rpcError) throw new Error(rpcError.message)

const { count, error: countError } = await supabase
  .schema("evapremium_shop")
  .from("pricing_template_overrides")
  .select("id", { count: "exact", head: true })
  .eq("catalog_version_id", catalog.id)

if (countError) throw new Error(countError.message)

console.log(
  JSON.stringify(
    {
      catalogId: catalog.id,
      insertedRows: count,
      expectedRows: expanded.length,
      outputPath,
    },
    null,
    2,
  ),
)

if (count !== expanded.length) {
  throw new Error(`Expected ${expanded.length} overrides, found ${count}`)
}
