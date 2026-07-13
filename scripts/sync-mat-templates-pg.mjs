import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { loadCatalogDatabaseClient } from "./lib/catalog-database.mjs"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const excludedCategories = new Set(["unknown", "page", "strona", "corsa", "test_1"])

const payload = JSON.parse(
  fs.readFileSync(path.join(root, "src/data/evamats-templates.normalized.json"), "utf8"),
)

const rows = payload.records
  .filter((record) => record.brand_key && record.dealer_pricing_category_key)
  .filter((record) => !excludedCategories.has(record.dealer_pricing_category_key))
  .map((record) => ({
    dealer_pricing_category: record.dealer_pricing_category,
    dealer_pricing_category_key: record.dealer_pricing_category_key,
    dealer_pricing_category_source: record.dealer_pricing_category_source,
    brand_name: record.brand_name,
    brand_key: record.brand_key,
    model_name: record.model_name,
    model_key: record.model_key,
    model_family_name: record.model_family_name,
    model_family_key: record.model_family_key,
    generation: record.generation.label,
    year_from: record.generation.year_from,
    year_to: record.generation.year_to,
    is_open_ended: record.generation.is_open_ended,
    body_type: record.body_type,
    body_type_key: record.body_type_key,
    body_type_variants: record.body_type_variants.map((item) => item.label),
    record_key: record.record_key,
    source_file: payload.meta.source_file,
    source_sheet: payload.meta.source_sheet,
    source_row_id: record.id,
    json_version: payload.meta.version,
  }))

const syncSql = `
  UPDATE evapremium_shop.mat_templates SET is_active = false;
  INSERT INTO evapremium_shop.mat_templates (
    dealer_pricing_category, dealer_pricing_category_key,
    dealer_pricing_category_source, brand_name, brand_key, model_name, model_key,
    model_family_name, model_family_key, generation, year_from, year_to,
    is_open_ended, body_type, body_type_key, body_type_variants, record_key,
    source_file, source_sheet, source_row_id, json_version, is_active
  )
  SELECT
    x.dealer_pricing_category, x.dealer_pricing_category_key,
    x.dealer_pricing_category_source, x.brand_name, x.brand_key, x.model_name,
    x.model_key, x.model_family_name, x.model_family_key, x.generation,
    x.year_from, x.year_to, x.is_open_ended, x.body_type, x.body_type_key,
    x.body_type_variants, x.record_key, x.source_file, x.source_sheet,
    x.source_row_id, x.json_version, true
  FROM jsonb_to_recordset($1::jsonb) AS x(
    dealer_pricing_category text, dealer_pricing_category_key text,
    dealer_pricing_category_source text, brand_name text, brand_key text,
    model_name text, model_key text, model_family_name text, model_family_key text,
    generation text, year_from smallint, year_to smallint, is_open_ended boolean,
    body_type text, body_type_key text, body_type_variants text[], record_key text,
    source_file text, source_sheet text, source_row_id integer, json_version text
  )
  ON CONFLICT (record_key) DO UPDATE SET
    dealer_pricing_category = EXCLUDED.dealer_pricing_category,
    dealer_pricing_category_key = EXCLUDED.dealer_pricing_category_key,
    model_family_name = EXCLUDED.model_family_name,
    model_family_key = EXCLUDED.model_family_key,
    generation = EXCLUDED.generation,
    year_from = EXCLUDED.year_from,
    year_to = EXCLUDED.year_to,
    body_type = EXCLUDED.body_type,
    body_type_key = EXCLUDED.body_type_key,
    body_type_variants = EXCLUDED.body_type_variants,
    json_version = EXCLUDED.json_version,
    is_active = true,
    updated_at = now();
`

const main = async () => {
  const client = await loadCatalogDatabaseClient(root)
  try {
    await client.query("BEGIN")
    await client.query(syncSql, [JSON.stringify(rows)])
    const result = await client.query(
      "SELECT count(*)::int AS total FROM evapremium_shop.mat_templates WHERE is_active",
    )
    if (result.rows[0].total !== rows.length) {
      throw new Error(`Expected ${rows.length} active rows, got ${result.rows[0].total}`)
    }
    await client.query("COMMIT")
    console.log(`Synchronized ${rows.length} mat templates in one transaction`)
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
