/**
 * Execute all mat_templates seed batches via Supabase MCP execute_sql.
 * Reads SQL from output/mat-templates-seed-batches and logs per-batch results.
 *
 * This script is intended to be driven by an agent calling Supabase MCP
 * for each batch payload in output/mcp-exec-args/*.args.json
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const argsDir = path.join(__dirname, "../output/mcp-exec-args")
const logFile = path.join(__dirname, "../output/mcp-mat-batch-results.json")

const batches = fs
  .readdirSync(argsDir)
  .filter((file) => /^batch_\d+\.args\.json$/.test(file))
  .sort()

const existing = fs.existsSync(logFile) ? JSON.parse(fs.readFileSync(logFile, "utf8")) : { results: [] }
const completed = new Set(existing.results.filter((r) => r.success).map((r) => r.batch))

const pending = batches.filter((file) => !completed.has(file.replace(".args.json", ".sql")))

if (!pending.length) {
  console.log(JSON.stringify({ done: true, ...existing }, null, 2))
  process.exit(0)
}

const next = pending[0]
const payload = JSON.parse(fs.readFileSync(path.join(argsDir, next), "utf8"))
console.log(
  JSON.stringify(
    {
      action: "execute_sql",
      batch: next.replace(".args.json", ".sql"),
      remaining: pending.length,
      payload,
    },
    null,
    2,
  ),
)
