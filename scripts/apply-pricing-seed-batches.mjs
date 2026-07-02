/**
 * Apply pricing seed batches via Supabase MCP execute_sql.
 * Run from repo root: node scripts/apply-pricing-seed-batches.mjs
 *
 * Requires: SUPABASE_ACCESS_TOKEN or run batches manually in SQL editor.
 * This script prints batch paths and a verification query for MCP/CI.
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const batchDir = path.join(__dirname, "../output/pricing-seed-batches")
const projectId = "kmepxyervpeujwvgdqtm"

const batches = fs
  .readdirSync(batchDir)
  .filter((f) => /^batch_\d+\.sql$/.test(f))
  .sort()

const verifyQuery = `
SELECT
  (SELECT COUNT(*) FROM evapremium_shop.pricing_catalog_versions) AS catalogs,
  (SELECT COUNT(*) FROM evapremium_shop.pricing_vehicle_categories) AS categories,
  (SELECT COUNT(*) FROM evapremium_shop.pricing_variants) AS variants,
  (SELECT COUNT(*) FROM evapremium_shop.pricing_matrix) AS matrix_rows,
  (SELECT COUNT(*) FROM evapremium_shop.pricing_model_rules) AS model_rules,
  (SELECT COUNT(*) FROM evapremium_shop.pricing_extras) AS extras;
`.trim()

console.log(JSON.stringify({ projectId, batches: batches.map((f) => path.join(batchDir, f)), verifyQuery }, null, 2))
