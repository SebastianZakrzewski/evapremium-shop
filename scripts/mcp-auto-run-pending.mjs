#!/usr/bin/env node
/**
 * Prepare all pending batch/chunk MCP payloads and print execution plan.
 * Agent loop: for each item, load payload via mcp-get-payload.mjs then CallMcpTool execute_sql.
 *
 * Usage:
 *   node scripts/mcp-auto-run-pending.mjs plan
 *   node scripts/mcp-auto-run-pending.mjs prepare-all
 *   node scripts/mcp-auto-run-pending.mjs load batch 04
 *   node scripts/mcp-auto-run-pending.mjs load chunk 02
 */
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const ROOT = path.resolve(import.meta.dirname, '..')
const DIR = path.join(ROOT, 'output/mcp-current')
const RESULTS = path.join(ROOT, 'output/mcp-mat-batch-results.json')
const PROJECT_ID = 'kmepxyervpeujwvgdqtm'

const pad = (n) => String(n).padStart(2, '0')

const loadResults = () => {
  if (!fs.existsSync(RESULTS)) return { results: [] }
  return JSON.parse(fs.readFileSync(RESULTS, 'utf8'))
}

const succeededBatches = () => {
  const data = loadResults()
  return new Set((data.results ?? []).filter((r) => r.success).map((r) => r.batch))
}

const pendingBatches = () => {
  const ok = succeededBatches()
  const pending = []
  for (let i = 1; i <= 70; i++) {
    const batch = `batch_${pad(i)}.sql`
    if (!ok.has(batch)) pending.push(i)
  }
  return pending
}

const pendingChunks = () => {
  const ok = succeededBatches()
  const chunks = []
  for (let c = 2; c <= 23; c++) {
    const meta = JSON.parse(fs.readFileSync(path.join(DIR, `_chunk_invoke_${pad(c)}.json`), 'utf8'))
    const [start, end] = meta.batches.split('-').map(Number)
    let done = true
    for (let i = start; i <= end; i++) {
      if (!ok.has(`batch_${pad(i)}.sql`)) {
        done = false
        break
      }
    }
    if (!done) chunks.push({ chunk: pad(c), batches: meta.batches })
  }
  return chunks
}

const prepareExecArgs = (from, to) => {
  for (let i = from; i <= to; i++) {
    const id = pad(i)
    const invoke = path.join(DIR, `.invoke_chunk_${id}.json`)
    if (!fs.existsSync(invoke)) continue
    const payload = JSON.parse(fs.readFileSync(invoke, 'utf8'))
    fs.writeFileSync(
      path.join(DIR, `.exec_args_${id}.json`),
      JSON.stringify({ project_id: payload.project_id, query: payload.query }),
    )
  }
}

const cmd = process.argv[2]

if (cmd === 'plan') {
  const pb = pendingBatches()
  const pc = pendingChunks()
  console.log(JSON.stringify({
    projectId: PROJECT_ID,
    currentCountHint: 117,
    targetCount: 2763,
    succeeded: 70 - pb.length,
    pendingBatches: pb.length,
    pendingBatchNums: pb,
    pendingChunks: pc,
    strategy: 'Execute chunks 02-23 via CallMcpTool (preferred) or individual batches 04-69',
  }, null, 2))
  process.exit(0)
}

if (cmd === 'prepare-all') {
  prepareExecArgs(2, 23)
  for (const n of pendingBatches()) {
    const src = path.join(DIR, `CALL_MCP_${pad(n)}.args.json`)
    if (fs.existsSync(src)) {
      const payload = JSON.parse(fs.readFileSync(src, 'utf8'))
      fs.writeFileSync(
        path.join(DIR, `.exec_args_batch_${pad(n)}.json`),
        JSON.stringify({ project_id: payload.project_id, query: payload.query }),
      )
    }
  }
  console.log('Prepared .exec_args_02..23.json and batch exec args')
  process.exit(0)
}

if (cmd === 'load') {
  const kind = process.argv[3]
  const num = process.argv[4]
  spawnSync('node', ['scripts/mcp-get-payload.mjs', kind, num], { cwd: ROOT, stdio: 'inherit', shell: true })
  const payload = JSON.parse(fs.readFileSync(path.join(DIR, '.current_mcp_payload.json'), 'utf8'))
  fs.writeFileSync(path.join(DIR, '.mcp_tool_args.json'), JSON.stringify(payload))
  console.log(JSON.stringify({
    ready: true,
    kind,
    num: pad(num),
    project_id: payload.project_id,
    queryLength: payload.query.length,
    mcpArgsFile: path.join(DIR, '.mcp_tool_args.json'),
    instruction: 'CallMcpTool execute_sql with JSON.parse(fs.readFileSync(.mcp_tool_args.json))',
  }))
  process.exit(0)
}

console.log('Usage: plan | prepare-all | load <batch|chunk> <num>')
process.exit(1)
