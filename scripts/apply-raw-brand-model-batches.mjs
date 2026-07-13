/**
 * Applies raw brand/model SQL batches via Supabase execute_sql (reads batch files).
 * Usage: node scripts/apply-raw-brand-model-batches.mjs
 *
 * Requires batches from:
 *   node scripts/seed-mat-templates-raw-brand-model.mjs --sql-only
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")
const batchDir = path.join(root, "output", "mat-templates-raw-brand-model-batches")
const PROJECT_ID = "kmepxyervpeujwvgdqtm"

const manifest = JSON.parse(
  fs.readFileSync(path.join(batchDir, "manifest.json"), "utf8"),
)

console.log(
  JSON.stringify(
    {
      projectId: PROJECT_ID,
      batchCount: manifest.batchCount,
      totalRows: manifest.totalRows,
      instruction:
        "Run each batch file through Supabase execute_sql MCP or psql against remote DB.",
      files: manifest.files.map((file) => path.join(batchDir, file)),
    },
    null,
    2,
  ),
)
