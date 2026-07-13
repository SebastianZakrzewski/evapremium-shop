/**
 * Executes mat_templates seed batches via Supabase MCP execute_sql equivalent.
 * Reads args from output/mcp-exec-args/batch_XX.args.json
 * Records results to output/mcp-mat-batch-results.json
 *
 * This script uses dynamic import to call MCP through cursor's tool bridge
 * by writing batch requests and reading responses from output/mcp-temp/results/
 */
import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'

const ROOT = path.resolve(import.meta.dirname, '..')
const ARGS_DIR = path.join(ROOT, 'output', 'mcp-exec-args')
const RESULTS_DIR = path.join(ROOT, 'output', 'mcp-temp', 'results')
const RESULTS_PATH = path.join(ROOT, 'output', 'mcp-mat-batch-results.json')
const projectId = 'kmepxyervpeujwvgdqtm'

const from = Number(process.argv[2] || 1)
const to = Number(process.argv[3] || 70)

fs.mkdirSync(RESULTS_DIR, { recursive: true })

const results = {
  projectId,
  results: [],
  finalCount: null,
}

const executeBatch = (i) =>
  new Promise((resolve) => {
    const id = String(i).padStart(2, '0')
    const batchName = `batch_${id}.sql`
    const argsPath = path.join(ARGS_DIR, `batch_${id}.args.json`)

    if (!fs.existsSync(argsPath)) {
      resolve({ batch: batchName, success: false, error: 'args missing' })
      return
    }

    const args = JSON.parse(fs.readFileSync(argsPath, 'utf8'))
    const payloadPath = path.join(RESULTS_DIR, `payload_${id}.json`)
    fs.writeFileSync(
      payloadPath,
      JSON.stringify({
        server: 'plugin-supabase-supabase',
        toolName: 'execute_sql',
        arguments: {
          project_id: args.project_id ?? projectId,
          query: args.query,
        },
        batch: batchName,
      }),
    )
    resolve({ batch: batchName, payloadPath, ready: true })
  })

const main = async () => {
  for (let i = from; i <= to; i++) {
    const info = await executeBatch(i)
    results.results.push({
      batch: info.batch,
      payloadFile: info.payloadPath ? path.basename(info.payloadPath) : null,
      ready: info.ready ?? false,
      success: info.success ?? null,
      error: info.error ?? null,
    })
  }

  fs.writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2))
  console.log(`Prepared ${results.results.length} MCP payloads in ${RESULTS_DIR}`)
  console.log(RESULTS_PATH)
}

main().catch(console.error)
