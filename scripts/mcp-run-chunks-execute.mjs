#!/usr/bin/env node
/**
 * Execute mat_templates seed chunks 02-23 via Supabase MCP execute_sql.
 * Reads UTF-8 safe .exec_args_XX.json payloads and calls MCP per chunk.
 * Records results via mcp-chunk-record.mjs.
 *
 * Requires Cursor agent to invoke CallMcpTool — this script emits payloads
 * and records; use with agent loop OR set SUPABASE_ACCESS_TOKEN for stdio MCP.
 *
 * Usage:
 *   node scripts/mcp-run-chunks-execute.mjs prepare 02 03 04
 *   node scripts/mcp-run-chunks-execute.mjs list-pending
 *   node scripts/mcp-run-chunks-execute.mjs record 02 success
 */
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const ROOT = path.resolve(import.meta.dirname, '..')
const DIR = path.join(ROOT, 'output/mcp-current')
const RESULTS = path.join(ROOT, 'output/mcp-mat-batch-results.json')
const PROJECT_ID = 'kmepxyervpeujwvgdqtm'

const pad = (n) => String(n).padStart(2, '0')

const loadExecArgs = (chunkNum) => {
  const id = pad(chunkNum)
  const file = path.join(DIR, `.exec_args_${id}.json`)
  if (!fs.existsSync(file)) {
    throw new Error(`Missing ${file}`)
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

const chunkMeta = (chunkNum) => {
  const id = pad(chunkNum)
  return JSON.parse(fs.readFileSync(path.join(DIR, `_chunk_invoke_${id}.json`), 'utf8'))
}

const isChunkDone = (chunkNum) => {
  if (!fs.existsSync(RESULTS)) return false
  const data = JSON.parse(fs.readFileSync(RESULTS, 'utf8'))
  const ok = new Set(data.results.filter((r) => r.success).map((r) => r.batch))
  const { batches } = chunkMeta(chunkNum)
  const [start, end] = batches.split('-').map(Number)
  for (let i = start; i <= end; i++) {
    if (!ok.has(`batch_${pad(i)}.sql`)) return false
  }
  return true
}

const cmd = process.argv[2]

if (cmd === 'list-pending') {
  const pending = []
  for (let c = 2; c <= 23; c++) {
    if (!isChunkDone(c)) {
      pending.push({ chunk: pad(c), batches: chunkMeta(c).batches })
    }
  }
  console.log(JSON.stringify({ pending, count: pending.length }, null, 2))
  process.exit(0)
}

if (cmd === 'prepare') {
  const chunks = process.argv.slice(3)
  for (const c of chunks) {
    const id = pad(c)
    const args = loadExecArgs(c)
    const out = path.join(DIR, `MCP_CALL_NOW_${id}.json`)
    fs.writeFileSync(out, JSON.stringify({ project_id: args.project_id, query: args.query }))
    console.log(JSON.stringify({ chunk: id, batches: chunkMeta(c).batches, out, queryLength: args.query.length }))
  }
  process.exit(0)
}

if (cmd === 'record') {
  const chunkNum = process.argv[3]
  const status = process.argv[4]
  const error = process.argv[5]
  spawnSync('node', ['scripts/mcp-chunk-record.mjs', chunkNum, status, ...(error ? [error] : [])], {
    cwd: ROOT,
    stdio: 'inherit',
    shell: true,
  })
  process.exit(0)
}

if (cmd === 'payload') {
  const chunkNum = process.argv[3]
  const args = loadExecArgs(chunkNum)
  process.stdout.write(JSON.stringify({ project_id: args.project_id, query: args.query }))
  process.exit(0)
}

console.log(`Usage:
  node scripts/mcp-run-chunks-execute.mjs list-pending
  node scripts/mcp-run-chunks-execute.mjs prepare <chunk> [...]
  node scripts/mcp-run-chunks-execute.mjs payload <chunk>
  node scripts/mcp-run-chunks-execute.mjs record <chunk> success|failed [error]`)
process.exit(1)
