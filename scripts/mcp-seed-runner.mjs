#!/usr/bin/env node
/**
 * Execute mat_templates seed via Supabase MCP execute_sql payloads.
 * Agent workflow: node scripts/mcp-seed-runner.mjs exec chunk 01
 * Prints payload path + metadata; agent calls CallMcpTool with JSON contents.
 *
 * Also supports: prepare | status | record-chunk
 */
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const ROOT = path.resolve(import.meta.dirname, '..')
const DIR = path.join(ROOT, 'output/mcp-current')
const RESULTS = path.join(ROOT, 'output/mcp-mat-batch-results.json')

const pad = (n) => String(n).padStart(2, '0')

const chunkMeta = (n) => {
  const id = pad(n)
  const meta = JSON.parse(fs.readFileSync(path.join(DIR, `_chunk_invoke_${id}.json`), 'utf8'))
  return { id, batches: meta.batches }
}

const payloadPath = (kind, n) => {
  const id = pad(n)
  if (kind === 'batch') return path.join(DIR, `exec_payload_${id}.json`)
  return path.join(DIR, `_out_chunk_${id}.json`)
}

const loadPayload = (kind, n) => {
  const file = payloadPath(kind, n)
  if (!fs.existsSync(file)) {
    const id = pad(n)
    const alt = path.join(DIR, `_mcp_args_chunk_${id}.json`)
    if (kind === 'chunk' && fs.existsSync(alt)) return JSON.parse(fs.readFileSync(alt, 'utf8'))
    throw new Error(`Missing payload: ${file}`)
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

const recordBatch = (batch, status, error) => {
  const args = ['scripts/mcp-mat-batch-record.mjs', 'record', batch, status]
  if (error) args.push(String(error).slice(0, 500))
  spawnSync('node', args, { cwd: ROOT, stdio: 'pipe', shell: true })
}

const recordChunk = (n, status, error) => {
  const { batches } = chunkMeta(n)
  const [start, end] = batches.split('-').map(Number)
  for (let i = start; i <= end; i++) {
    recordBatch(`batch_${pad(i)}.sql`, status, error)
  }
  console.log(`recorded chunk ${pad(n)} batches ${batches}: ${status}`)
}

const cmd = process.argv[2]
const kind = process.argv[3] ?? 'chunk'
const num = Number(process.argv[4] ?? 1)

if (cmd === 'prepare') {
  for (let i = 1; i <= 23; i++) {
    spawnSync('node', ['scripts/mcp-write-args.mjs', 'chunk', pad(i)], {
      cwd: ROOT,
      stdio: 'inherit',
      shell: true,
    })
  }
  console.log('prepared chunks 01-23')
  process.exit(0)
}

if (cmd === 'status') {
  const data = JSON.parse(fs.readFileSync(RESULTS, 'utf8'))
  const ok = new Set(data.results.filter((r) => r.success).map((r) => r.batch))
  const pending = []
  for (let i = 1; i <= 70; i++) {
    const b = `batch_${pad(i)}.sql`
    if (!ok.has(b)) pending.push(b)
  }
  console.log(
    JSON.stringify(
      {
        succeeded: ok.size,
        failed: data.results.filter((r) => !r.success).length,
        pending: pending.length,
        finalCount: data.finalCount,
        pendingBatches: pending.slice(0, 20),
      },
      null,
      2
    )
  )
  process.exit(0)
}

if (cmd === 'emit') {
  const data = loadPayload(kind, num)
  const out = path.join(DIR, `_emit_${kind}_${pad(num)}.json`)
  fs.writeFileSync(out, JSON.stringify({ project_id: data.project_id, query: data.query }))
  console.log(
    JSON.stringify({
      out,
      project_id: data.project_id,
      queryLength: data.query.length,
      batches: kind === 'chunk' ? chunkMeta(num).batches : `batch_${pad(num)}`,
    })
  )
  process.exit(0)
}

if (cmd === 'record-chunk') {
  const status = process.argv[4]
  const error = process.argv[5]
  recordChunk(Number(process.argv[3]), status, error)
  process.exit(0)
}

console.log(`Usage:
  node scripts/mcp-seed-runner.mjs prepare
  node scripts/mcp-seed-runner.mjs status
  node scripts/mcp-seed-runner.mjs emit chunk 01
  node scripts/mcp-seed-runner.mjs record-chunk 01 success`)
process.exit(1)
