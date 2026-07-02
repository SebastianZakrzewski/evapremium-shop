/**
 * Split pricing-seed.sql into statement batches for Supabase MCP execute_sql.
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")
const sql = fs.readFileSync(path.join(root, "output/pricing-seed.sql"), "utf8")

const statements = []
let buf = []
for (const line of sql.split("\n")) {
  if (line.trim() === "BEGIN;" || line.trim() === "COMMIT;") continue
  if (line.startsWith("--")) continue
  buf.push(line)
  if (line.trim().endsWith(";")) {
    statements.push(buf.join("\n"))
    buf = []
  }
}

const outDir = path.join(root, "output/pricing-seed-batches")
fs.mkdirSync(outDir, { recursive: true })

const MAX_BYTES = 15000
const batches = []
let current = ["BEGIN;"]
let size = 6

const pushBatch = () => {
  if (current.length <= 1) return
  current.push("COMMIT;")
  const name = `batch_${String(batches.length + 1).padStart(2, "0")}.sql`
  const content = current.join("\n\n")
  batches.push({ name, content })
  fs.writeFileSync(path.join(outDir, name), content, "utf8")
  current = ["BEGIN;"]
  size = 6
}

for (const stmt of statements) {
  const add = stmt.length + 2
  if (size + add > MAX_BYTES && current.length > 1) pushBatch()
  current.push(stmt)
  size += add
}
pushBatch()

console.log("Statements:", statements.length)
console.log("Batches:", batches.length)
for (const b of batches) console.log(b.name, b.content.length, "bytes")
