/**
 * Seeds evapremium_shop.mat_templates with raw Excel MARKA/MODEL (1:1, no normalization).
 *
 * Prerequisite:
 *   npx xlsx-cli "<path>/NEW Baza szablonów Evamats (2).xlsx" --sheet "Nowa baza szablonów" -J -o output/evamats-templates-raw.json
 *   node scripts/extract-marka-model-raw.mjs
 *
 * Usage:
 *   node scripts/seed-mat-templates-raw-brand-model.mjs
 *   node scripts/seed-mat-templates-raw-brand-model.mjs --dry-run
 *   node scripts/seed-mat-templates-raw-brand-model.mjs --sql-only
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { loadCatalogDatabaseClient } from "./lib/catalog-database.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")
const outputDir = path.join(root, "output")

const MARKA_MODEL_FILE = path.join(outputDir, "evamats-marka-model-all.json")
const SOURCE_FILE = "NEW Baza szablonów Evamats (2).xlsx"
const SOURCE_SHEET = "Nowa baza szablonów"

const args = new Set(process.argv.slice(2))
const isDryRun = args.has("--dry-run")
const sqlOnly = args.has("--sql-only")
const writeBatches = args.has("--write-batches") || sqlOnly
const BATCH_SIZE = 100

const buildUpdates = () => {
  if (!fs.existsSync(MARKA_MODEL_FILE)) {
    throw new Error(
      `Missing ${MARKA_MODEL_FILE}. Run: node scripts/extract-marka-model-raw.mjs`,
    )
  }

  const rows = JSON.parse(fs.readFileSync(MARKA_MODEL_FILE, "utf8"))
  return rows.map((row, index) => {
    const marka = String(row.MARKA ?? "")
    const model = row.MODEL == null ? "" : String(row.MODEL)

    return {
      source_row_id: index + 1,
      brand_name: marka,
      brand_key: marka,
      model_name: model,
      model_key: model,
      model_family_name: model,
      model_family_key: model,
    }
  })
}

const updateSql = `
  UPDATE evapremium_shop.mat_templates AS mt
  SET
    brand_name = src.brand_name,
    brand_key = src.brand_key,
    model_name = src.model_name,
    model_key = src.model_key,
    model_family_name = src.model_family_name,
    model_family_key = src.model_family_key,
    source_file = $2,
    source_sheet = $3,
    json_version = 'raw-marka-model-1.0',
    updated_at = now()
  FROM jsonb_to_recordset($1::jsonb) AS src(
    source_row_id integer,
    brand_name text,
    brand_key text,
    model_name text,
    model_key text,
    model_family_name text,
    model_family_key text
  )
  WHERE mt.source_row_id = src.source_row_id
    AND mt.is_active = true;
`

const verifySql = `
  SELECT
    count(*)::int AS matched_rows,
    count(*) FILTER (
      WHERE mt.brand_name = src.brand_name
        AND mt.model_name = src.model_name
    )::int AS exact_label_rows
  FROM evapremium_shop.mat_templates AS mt
  INNER JOIN jsonb_to_recordset($1::jsonb) AS src(
    source_row_id integer,
    brand_name text,
    brand_key text,
    model_name text,
    model_key text,
    model_family_name text,
    model_family_key text
  ) ON mt.source_row_id = src.source_row_id
  WHERE mt.is_active = true;
`

const writeBatchFiles = (updates) => {
  const batchDir = path.join(outputDir, "mat-templates-raw-brand-model-batches")
  fs.mkdirSync(batchDir, { recursive: true })

  const batches = []
  for (let offset = 0; offset < updates.length; offset += BATCH_SIZE) {
    batches.push(updates.slice(offset, offset + BATCH_SIZE))
  }

  batches.forEach((batch, index) => {
    const fileName = `batch_${String(index + 1).padStart(2, "0")}.sql`
    const payload = JSON.stringify(batch).replace(/'/g, "''")
    const sql = `-- batch ${index + 1}/${batches.length}\nBEGIN;\n\n${updateSql
      .replace(/\$1::jsonb/g, `'${payload}'::jsonb`)
      .replace(/\$1/g, `'${payload}'`)
      .replace(/\$2/g, `'${SOURCE_FILE}'`)
      .replace(/\$3/g, `'${SOURCE_SHEET}'`)};\n\nCOMMIT;\n`
    fs.writeFileSync(path.join(batchDir, fileName), sql, "utf8")
  })

  fs.writeFileSync(
    path.join(batchDir, "manifest.json"),
    JSON.stringify(
      {
        totalRows: updates.length,
        batchSize: BATCH_SIZE,
        batchCount: batches.length,
        files: batches.map((_, index) => `batch_${String(index + 1).padStart(2, "0")}.sql`),
      },
      null,
      2,
    ),
    "utf8",
  )

  console.log(`Wrote ${batches.length} SQL batches to ${batchDir}`)
  return batchDir
}

const main = async () => {
  const updates = buildUpdates()
  const payloadPath = path.join(outputDir, "mat-templates-raw-brand-model-updates.json")
  fs.mkdirSync(outputDir, { recursive: true })
  fs.writeFileSync(payloadPath, JSON.stringify(updates, null, 2), "utf8")

  console.log(`Prepared ${updates.length} raw MARKA/MODEL updates`)
  console.log(`Payload: ${payloadPath}`)
  console.log("Sample:", JSON.stringify(updates.slice(0, 3), null, 2))

  if (sqlOnly || writeBatches) {
    const sqlPath = path.join(outputDir, "mat-templates-raw-brand-model-update.sql")
    const escaped = JSON.stringify(updates).replace(/'/g, "''")
    fs.writeFileSync(
      sqlPath,
      `-- Generated by scripts/seed-mat-templates-raw-brand-model.mjs --sql-only\nBEGIN;\n\n${updateSql.replace(/\$1/g, `'${escaped}'::jsonb`).replace(/\$2/g, `'${SOURCE_FILE}'`).replace(/\$3/g, `'${SOURCE_SHEET}'`)};\n\nCOMMIT;\n`,
      "utf8",
    )
    console.log(`Wrote ${sqlPath}`)
    writeBatchFiles(updates)
    if (sqlOnly) return
  }

  if (isDryRun) {
    console.log("Dry run — no database changes applied.")
    writeBatchFiles(updates)
    return
  }

  const client = await loadCatalogDatabaseClient(root)
  try {
    await client.query("BEGIN")
    const updateResult = await client.query(updateSql, [
      JSON.stringify(updates),
      SOURCE_FILE,
      SOURCE_SHEET,
    ])
    const verifyResult = await client.query(verifySql, [JSON.stringify(updates)])
    const activeCount = await client.query(
      "SELECT count(*)::int AS total FROM evapremium_shop.mat_templates WHERE is_active = true",
    )

    const matched = verifyResult.rows[0]?.matched_rows ?? 0
    const exact = verifyResult.rows[0]?.exact_label_rows ?? 0

    if (matched !== updates.length) {
      throw new Error(
        `Expected to match ${updates.length} rows by source_row_id, matched ${matched}`,
      )
    }

    if (exact !== updates.length) {
      throw new Error(
        `Expected ${updates.length} rows with exact raw labels after update, got ${exact}`,
      )
    }

    await client.query("COMMIT")

    console.log(
      JSON.stringify(
        {
          updatedRows: updateResult.rowCount,
          matchedRows: matched,
          exactLabelRows: exact,
          activeRows: activeCount.rows[0]?.total,
        },
        null,
        2,
      ),
    )
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
