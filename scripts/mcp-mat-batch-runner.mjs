/**
 * Execute mat_templates seed batches sequentially via MCP execute_sql helper.
 * Writes one batch payload at a time for agent/MCP consumption.
 *
 * Usage:
 *   node scripts/mcp-mat-batch-runner.mjs next
 *   node scripts/mcp-mat-batch-runner.mjs mark-success batch_01.sql
 *   node scripts/mcp-mat-batch-runner.mjs status
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const batchDir = path.join(__dirname, "../output/mat-templates-seed-batches")
const stateFile = path.join(__dirname, "../output/mcp-mat-batch-state.json")
const projectId = "kmepxyervpeujwvgdqtm"

const loadState = () => {
  if (!fs.existsSync(stateFile)) {
    return { projectId, completed: [], failed: [] }
  }
  return JSON.parse(fs.readFileSync(stateFile, "utf8"))
}

const saveState = (state) => {
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2))
}

const allBatches = fs
  .readdirSync(batchDir)
  .filter((file) => /^batch_\d+\.sql$/.test(file))
  .sort()

const command = process.argv[2]
const arg = process.argv[3]
const state = loadState()

if (command === "status") {
  console.log(
    JSON.stringify(
      {
        total: allBatches.length,
        completed: state.completed.length,
        failed: state.failed.length,
        failures: state.failed,
      },
      null,
      2,
    ),
  )
  process.exit(0)
}

if (command === "mark-success" && arg) {
  if (!state.completed.includes(arg)) state.completed.push(arg)
  state.failed = state.failed.filter((item) => item.batch !== arg)
  saveState(state)
  console.log(`marked success: ${arg}`)
  process.exit(0)
}

if (command === "mark-failed" && arg) {
  const error = process.argv[4] || "unknown error"
  state.failed = state.failed.filter((item) => item.batch !== arg)
  state.failed.push({ batch: arg, error })
  saveState(state)
  console.log(`marked failed: ${arg}`)
  process.exit(0)
}

if (command === "next") {
  const next = allBatches.find((file) => !state.completed.includes(file) && !state.failed.some((f) => f.batch === file))
  if (!next) {
    console.log(JSON.stringify({ done: true, state }, null, 2))
    process.exit(0)
  }

  const query = fs.readFileSync(path.join(batchDir, next), "utf8")
  console.log(JSON.stringify({ projectId, batch: next, query }, null, 2))
  process.exit(0)
}

console.error("Usage: next | mark-success <batch> | mark-failed <batch> <error> | status")
process.exit(1)
