/**
 * Reads mat_templates seed batch files and prints JSON lines for MCP execute_sql.
 * Usage: node scripts/run-mat-batches-mcp-runner.mjs [from] [to]
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const batchDir = path.join(__dirname, "../output/mat-templates-seed-batches")
const projectId = "kmepxyervpeujwvgdqtm"

const from = Number(process.argv[2] || 1)
const to = Number(process.argv[3] || 70)

const files = fs
  .readdirSync(batchDir)
  .filter((f) => /^batch_\d+\.sql$/.test(f))
  .sort()

for (const file of files) {
  const num = Number(file.match(/batch_(\d+)\.sql/)[1])
  if (num < from || num > to) continue

  const query = fs.readFileSync(path.join(batchDir, file), "utf8")
  console.log(JSON.stringify({ batch: file, projectId, query }))
}
