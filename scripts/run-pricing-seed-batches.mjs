/**
 * Prints batch file paths for manual/CI seed execution.
 * Supabase seed is applied via MCP execute_sql or SQL editor.
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dir = path.join(__dirname, "../output/pricing-seed-batches")
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()

for (const file of files) {
  const full = path.join(dir, file)
  console.log(`${file}\t${fs.statSync(full).size}`)
}
