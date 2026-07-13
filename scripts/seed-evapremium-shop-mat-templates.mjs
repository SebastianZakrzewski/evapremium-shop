/**
 * Generates SQL seed batches for evapremium_shop.mat_templates.
 *
 * Usage:
 *   node scripts/seed-evapremium-shop-mat-templates.mjs
 *   node scripts/run-mat-templates-seed-pg.mjs
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")

const payload = JSON.parse(
  fs.readFileSync(path.join(root, "src/data/evamats-templates.normalized.json"), "utf8"),
)

const EXCLUDED_CATEGORY_KEYS = new Set([
  "unknown",
  "page",
  "strona",
  "corsa",
  "test_1",
])

const esc = (value) => {
  if (value === null || value === undefined) return "NULL"
  return `'${String(value).replace(/'/g, "''")}'`
}

const escArray = (values) => {
  if (!values?.length) return "ARRAY[]::text[]"
  return `ARRAY[${values.map((value) => esc(value)).join(", ")}]::text[]`
}

const escBool = (value) => (value ? "true" : "false")

const toInsertRow = (record, meta) => {
  const variants = record.body_type_variants.map((item) => item.label).filter(Boolean)

  return `(
  ${esc(record.dealer_pricing_category)},
  ${esc(record.dealer_pricing_category_key)},
  ${esc(record.dealer_pricing_category_source)},
  ${esc(record.brand_name)},
  ${esc(record.brand_key)},
  ${esc(record.model_name)},
  ${esc(record.model_key)},
  ${esc(record.generation.label)},
  ${record.generation.year_from ?? "NULL"},
  ${record.generation.year_to ?? "NULL"},
  ${escBool(record.generation.is_open_ended)},
  ${esc(record.body_types.body_type_1.label)},
  ${esc(record.body_types.body_type_2.label)},
  ${esc(record.body_types.body_type_3.label)},
  ${esc(record.body_types.body_type_1.key)},
  ${esc(record.body_types.body_type_2.key)},
  ${esc(record.body_types.body_type_3.key)},
  ${esc(record.body_type)},
  ${esc(record.body_type_key)},
  ${escArray(variants)},
  ${esc(record.record_key)},
  ${esc(meta.source_file)},
  ${esc(meta.source_sheet)},
  ${record.id ?? "NULL"},
  ${esc(meta.version)}
)`
}

const columns = [
  "dealer_pricing_category",
  "dealer_pricing_category_key",
  "dealer_pricing_category_source",
  "brand_name",
  "brand_key",
  "model_name",
  "model_key",
  "generation",
  "year_from",
  "year_to",
  "is_open_ended",
  "body_type_1",
  "body_type_2",
  "body_type_3",
  "body_type_1_key",
  "body_type_2_key",
  "body_type_3_key",
  "body_type",
  "body_type_key",
  "body_type_variants",
  "record_key",
  "source_file",
  "source_sheet",
  "source_row_id",
  "json_version",
].join(", ")

const records = payload.records.filter((record) => {
  if (!record.brand_name) return false
  if (EXCLUDED_CATEGORY_KEYS.has(record.dealer_pricing_category_key)) return false
  return true
})

const outDir = path.join(root, "output/mat-templates-seed-batches")
fs.mkdirSync(outDir, { recursive: true })

const ROWS_PER_BATCH = 40
const batches = []

for (let index = 0; index < records.length; index += ROWS_PER_BATCH) {
  const chunk = records.slice(index, index + ROWS_PER_BATCH)
  const values = chunk.map((record) => toInsertRow(record, payload.meta)).join(",\n")

  const sql = `BEGIN;

INSERT INTO evapremium_shop.mat_templates (${columns})
VALUES
${values}
ON CONFLICT (record_key) DO NOTHING;

COMMIT;`

  const name = `batch_${String(batches.length + 1).padStart(2, "0")}.sql`
  fs.writeFileSync(path.join(outDir, name), sql, "utf8")
  batches.push({ name, rows: chunk.length, bytes: sql.length })
}

const summary = {
  total_records: payload.records.length,
  seeded_records: records.length,
  excluded_records: payload.records.length - records.length,
  batches: batches.length,
  batch_files: batches,
}

fs.writeFileSync(
  path.join(root, "output/mat-templates-seed-summary.json"),
  JSON.stringify(summary, null, 2),
  "utf8",
)

console.log("Generated mat_templates seed batches")
console.log(JSON.stringify(summary, null, 2))
