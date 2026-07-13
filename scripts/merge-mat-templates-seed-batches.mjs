/**
 * Merge mat-templates seed batches for fewer remote SQL executions.
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const batchDir = path.join(__dirname, "../output/mat-templates-seed-batches")
const outDir = path.join(__dirname, "../output/mcp-mat-templates-seed")
const projectId = "kmepxyervpeujwvgdqtm"
const GROUP_SIZE = 10

fs.mkdirSync(outDir, { recursive: true })

const files = fs
  .readdirSync(batchDir)
  .filter((file) => /^batch_\d+\.sql$/.test(file))
  .sort()

const groups = []
for (let index = 0; index < files.length; index += GROUP_SIZE) {
  groups.push(files.slice(index, index + GROUP_SIZE))
}

for (const [groupIndex, groupFiles] of groups.entries()) {
  const sql = groupFiles
    .map((file) => fs.readFileSync(path.join(batchDir, file), "utf8").trim())
    .join("\n\n")

  const name = `group_${String(groupIndex + 1).padStart(2, "0")}.sql`
  fs.writeFileSync(path.join(outDir, name), sql, "utf8")
  fs.writeFileSync(
    path.join(outDir, `${name}.json`),
    JSON.stringify({ project_id: projectId, query: sql }),
    "utf8",
  )
  console.log(name, groupFiles.length, "batches,", sql.length, "bytes")
}

console.log("Groups:", groups.length)
