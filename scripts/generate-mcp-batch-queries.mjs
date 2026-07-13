/**
 * Writes per-batch SQL queries for Supabase MCP execute_sql into output/mcp-current/.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")
const batchDir = path.join(root, "output", "mat-templates-raw-brand-model-batches")
const outDir = path.join(root, "output", "mcp-current")

const manifest = JSON.parse(
  fs.readFileSync(path.join(batchDir, "manifest.json"), "utf8"),
)

fs.mkdirSync(outDir, { recursive: true })

const payloads = manifest.files.map((file, index) => {
  const sql = fs.readFileSync(path.join(batchDir, file), "utf8")
  const outFile = path.join(outDir, `raw_brand_model_batch_${String(index + 1).padStart(2, "0")}.json`)
  const payload = {
    project_id: "kmepxyervpeujwvgdqtm",
    query: sql,
  }
  fs.writeFileSync(outFile, JSON.stringify(payload))
  return { batch: index + 1, file: outFile, queryLength: sql.length }
})

fs.writeFileSync(
  path.join(outDir, "raw_brand_model_batches_index.json"),
  JSON.stringify(payloads, null, 2),
)

console.log(`Wrote ${payloads.length} MCP payload files to ${outDir}`)
