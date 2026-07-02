/**
 * Writes MCP-ready JSON payloads for each pricing seed batch.
 * Agent reads output/mcp-pricing-seed/*.json and calls execute_sql.
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const batchDir = path.join(__dirname, "../output/pricing-seed-batches")
const outDir = path.join(__dirname, "../output/mcp-pricing-seed")
const projectId = "kmepxyervpeujwvgdqtm"

fs.mkdirSync(outDir, { recursive: true })

const batches = fs
  .readdirSync(batchDir)
  .filter((f) => /^batch_\d+\.sql$/.test(f))
  .sort()

for (const file of batches) {
  const query = fs.readFileSync(path.join(batchDir, file), "utf8")
  const payload = { project_id: projectId, query }
  fs.writeFileSync(path.join(outDir, `${file}.json`), JSON.stringify(payload))
  console.log(`Wrote ${file}.json (${query.length} bytes)`)
}
