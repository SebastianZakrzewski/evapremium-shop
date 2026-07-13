import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { loadCatalogDatabaseClient } from "./lib/catalog-database.mjs"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const migrationPath = path.join(
  root,
  "supabase/migrations/20260712234000_mat_templates_catalog_pricing.sql",
)

const main = async () => {
  const client = await loadCatalogDatabaseClient(root)
  const sql = fs.readFileSync(migrationPath, "utf8")

  try {
    await client.query("BEGIN")
    await client.query(sql)
    await client.query("COMMIT")
    console.log(`Applied ${path.basename(migrationPath)} as one transaction`)
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
