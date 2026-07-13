#!/usr/bin/env node
/**
 * Agent loop helper: print next pending batch args for MCP execute_sql.
 * Usage:
 *   node scripts/run-mcp-batch-loop.mjs next          # print next batch number
 *   node scripts/run-mcp-batch-loop.mjs args 01       # print MCP args JSON for batch
 *   node scripts/run-mcp-batch-loop.mjs record 01 ok  # record success
 *   node scripts/run-mcp-batch-loop.mjs record 01 fail "msg"
 *   node scripts/run-mcp-batch-loop.mjs status          # summary
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const PAYLOAD_DIR = path.join(ROOT, 'output', 'mcp-current')
const RESULTS_PATH = path.join(ROOT, 'output', 'mcp-mat-batch-results.json')
const PROJECT_ID = 'kmepxyervpeujwvgdqtm'

const loadResults = () => {
  if (!fs.existsSync(RESULTS_PATH)) {
    return { projectId: PROJECT_ID, results: [], finalCount: null }
  }
  return JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'))
}

const saveResults = (data) => {
  data.succeeded = data.results.filter((r) => r.success).length
  data.failed = data.results.filter((r) => r.success === false).length
  data.updatedAt = new Date().toISOString()
  fs.writeFileSync(RESULTS_PATH, JSON.stringify(data, null, 2))
}

const batchName = (n) => `batch_${String(n).padStart(2, '0')}.sql`

const loadPayload = (n) => {
  const id = String(n).padStart(2, '0')
  return JSON.parse(fs.readFileSync(path.join(PAYLOAD_DIR, `payload_${id}.json`), 'utf8'))
}

const [cmd, ...rest] = process.argv.slice(2)

if (cmd === 'args') {
  const n = rest[0]
  const p = loadPayload(n)
  process.stdout.write(JSON.stringify({ project_id: p.project_id, query: p.query, batch: p.batch }))
} else if (cmd === 'next') {
  const data = loadResults()
  const done = new Set(data.results.filter((r) => r.success).map((r) => r.batch))
  for (let i = 1; i <= 70; i++) {
    if (!done.has(batchName(i))) {
      console.log(String(i).padStart(2, '0'))
      process.exit(0)
    }
  }
  console.log('done')
} else if (cmd === 'record') {
  const [n, status, ...errParts] = rest
  const batch = batchName(n)
  const data = loadResults()
  const idx = data.results.findIndex((r) => r.batch === batch)
  const entry = {
    batch,
    success: status === 'ok' || status === 'success',
    ...(status === 'fail' || status === 'failed' ? { error: errParts.join(' ') } : {}),
  }
  if (idx >= 0) data.results[idx] = entry
  else data.results.push(entry)
  data.results.sort((a, b) => a.batch.localeCompare(b.batch))
  saveResults(data)
  console.log(`${batch}: ${entry.success ? 'OK' : 'FAIL'}`)
} else if (cmd === 'finalize') {
  const data = loadResults()
  data.finalCount = Number(rest[0])
  data.executedAt = new Date().toISOString()
  saveResults(data)
  console.log(`finalCount=${data.finalCount}`)
} else if (cmd === 'status') {
  const data = loadResults()
  const ok = data.results.filter((r) => r.success).length
  const fail = data.results.filter((r) => r.success === false)
  console.log(`succeeded=${ok}/70 failed=${fail.length} finalCount=${data.finalCount ?? 'null'}`)
  for (const f of fail) console.log(`  ${f.batch}: ${f.error ?? 'unknown'}`)
} else {
  console.error('Usage: next|args <nn>|record <nn> ok|fail [msg]|finalize <count>|status')
  process.exit(1)
}
