/**
 * Applies raw brand/model seed batches to remote Postgres (Supabase).
 * Reads batch SQL from output/mat-templates-raw-brand-model-batches/.
 *
 * Usage:
 *   SUPABASE_DB_URL="postgresql://..." node scripts/apply-raw-brand-model-batches-remote.mjs
 *   node scripts/apply-raw-brand-model-batches-remote.mjs --dry-run
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { loadCatalogDatabaseClient } from "./lib/catalog-database.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")
const batchDir = path.join(root, "output", "mat-templates-raw-brand-model-batches")

const args = new Set(process.argv.slice(2))
const isDryRun = args.has("--dry-run")

const manifest = JSON.parse(
  fs.readFileSync(path.join(batchDir, "manifest.json"), "utf8"),
)

const run = async () => {
  const files = manifest.files.map((file) => path.join(batchDir, file))
  console.log(`Batches: ${files.length}, rows: ${manifest.totalRows}`)

  if (isDryRun) {
    for (const file of files) {
      const sql = fs.readFileSync(file, "utf8")
      console.log(`[dry-run] ${path.basename(file)} (${sql.length} chars)`)
    }
    return
  }

  const client = await loadCatalogDatabaseClient(root)
  let applied = 0

  try {
    for (const file of files) {
      const sql = fs.readFileSync(file, "utf8")
      const result = await client.query(sql)
      applied += 1
      console.log(`Applied ${path.basename(file)} (rowCount=${result.rowCount ?? "n/a"})`)
    }
  } finally {
    await client.end()
  }

  const verify = await loadCatalogDatabaseClient(root)
  try {
    const { rows } = await verify.query(`
      SELECT count(*)::int AS cnt
      FROM evapremium_shop.mat_templates
      WHERE is_active = true
        AND json_version = 'raw-marka-model-1.0'
    `)
    console.log(`Verified raw-marka-model-1.0 rows: ${rows[0]?.cnt ?? 0}`)
  } finally {
    await verify.end()
  }

  console.log(`Done. Applied ${applied} batches.`)
}

run().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
