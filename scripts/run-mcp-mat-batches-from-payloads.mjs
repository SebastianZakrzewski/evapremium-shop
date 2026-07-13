/**
 * Reads payload files and prepares batch execution manifest.
 * Agent executes via CallMcpTool execute_sql using args from output/mcp-temp/.
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const PAYLOAD_DIR = path.join(ROOT, 'output', 'mcp-current')
const ARGS_DIR = path.join(ROOT, 'output', 'mcp-temp')
const RESULTS_PATH = path.join(ROOT, 'output', 'mcp-mat-batch-results.json')

const projectId = 'kmepxyervpeujwvgdqtm'
const from = Number(process.argv[2] || 1)
const to = Number(process.argv[3] || 70)

fs.mkdirSync(ARGS_DIR, { recursive: true })

const results = {
  projectId,
  results: [],
  finalCount: null,
}

for (let i = from; i <= to; i++) {
  const id = String(i).padStart(2, '0')
  const payloadPath = path.join(PAYLOAD_DIR, `payload_${id}.json`)
  const argsPath = path.join(ARGS_DIR, `args_${id}.json`)

  if (!fs.existsSync(payloadPath)) {
    results.results.push({
      batch: `batch_${id}.sql`,
      success: false,
      error: 'payload missing',
    })
    continue
  }

  const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf8'))
  fs.writeFileSync(
    argsPath,
    JSON.stringify({
      project_id: payload.project_id ?? projectId,
      query: payload.query,
      batch: payload.batch ?? `batch_${id}.sql`,
    }),
  )

  results.results.push({
    batch: payload.batch ?? `batch_${id}.sql`,
    argsFile: `args_${id}.json`,
    ready: true,
  })
}

fs.writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2))
console.log(`Prepared ${results.results.length} batches (${from}-${to})`)
console.log(RESULTS_PATH)
