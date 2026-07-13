#!/usr/bin/env node
/**
 * Execute pending mat_templates seed chunks/batches via Supabase Management API.
 * Requires SUPABASE_ACCESS_TOKEN (sbp_...) OR pass --use-mcp-hint to emit payloads for CallMcpTool.
 *
 * Usage:
 *   node scripts/mcp-run-all-chunks-api.mjs chunks 02 03 04
 *   node scripts/mcp-run-all-chunks-api.mjs batches 04 05 06
 *   node scripts/mcp-run-all-chunks-api.mjs pending-chunks
 *   node scripts/mcp-run-all-chunks-api.mjs pending-chunks --concurrency 3
 */
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const ROOT = path.resolve(import.meta.dirname, '..')
const DIR = path.join(ROOT, 'output/mcp-current')
const PROJECT_ID = 'kmepxyervpeujwvgdqtm'
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN

const pad = (n) => String(n).padStart(2, '0')

const loadPayload = (kind, num) => {
  const id = pad(num)
  const file = kind === 'chunk'
    ? path.join(DIR, `.exec_args_${id}.json`)
    : path.join(DIR, `CALL_MCP_${id}.args.json`)
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

const executeSql = async (query) => {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_ID}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`${res.status} ${text.slice(0, 500)}`)
  return text
}

const recordChunk = (num, status, error) => {
  spawnSync('node', ['scripts/mcp-chunk-record.mjs', String(num), status, ...(error ? [error] : [])], {
    cwd: ROOT, stdio: 'inherit', shell: true,
  })
}

const recordBatch = (num, status, error) => {
  spawnSync('node', ['scripts/mcp-mat-batch-record.mjs', 'record', `batch_${pad(num)}.sql`, status, ...(error ? [error] : [])], {
    cwd: ROOT, stdio: 'inherit', shell: true,
  })
}

const runPool = async (items, concurrency, worker) => {
  const results = []
  let idx = 0
  const runners = Array.from({ length: concurrency }, async () => {
    while (idx < items.length) {
      const i = idx++
      results.push(await worker(items[i]))
    }
  })
  await Promise.all(runners)
  return results
}

const cmd = process.argv[2]
const concurrency = Number(process.argv.find((a) => a.startsWith('--concurrency='))?.split('=')[1] ?? 3)

if (!TOKEN?.startsWith('sbp_')) {
  console.error('SUPABASE_ACCESS_TOKEN not set — use CallMcpTool execute_sql with payloads from:')
  console.error('  node scripts/mcp-exec-from-json.mjs chunk 02')
  console.error('  node scripts/mcp-exec-from-json.mjs batch 04')
  process.exit(1)
}

if (cmd === 'pending-chunks') {
  const pending = JSON.parse(spawnSync('node', ['scripts/mcp-run-chunks-execute.mjs', 'list-pending'], { cwd: ROOT, encoding: 'utf8' }).stdout)
  const nums = pending.pending.map((p) => Number(p.chunk))
  const results = await runPool(nums, concurrency, async (num) => {
    try {
      const { query } = loadPayload('chunk', num)
      await executeSql(query)
      recordChunk(num, 'success')
      console.log(`OK chunk ${pad(num)}`)
      return { num, success: true }
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err)
      recordChunk(num, 'failed', error)
      console.error(`FAIL chunk ${pad(num)}: ${error.slice(0, 200)}`)
      return { num, success: false, error }
    }
  })
  console.log(JSON.stringify({ results, ok: results.filter((r) => r.success).length, fail: results.filter((r) => !r.success).length }))
  process.exit(0)
}

if (cmd === 'chunks' || cmd === 'batches') {
  const kind = cmd === 'chunks' ? 'chunk' : 'batch'
  const nums = process.argv.slice(3).map(Number)
  const record = kind === 'chunk' ? recordChunk : recordBatch
  for (const num of nums) {
    try {
      const { query } = loadPayload(kind, num)
      await executeSql(query)
      record(num, 'success')
      console.log(`OK ${kind} ${pad(num)}`)
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err)
      record(num, 'failed', error)
      console.error(`FAIL ${kind} ${pad(num)}: ${error.slice(0, 200)}`)
    }
  }
  process.exit(0)
}

console.log('Usage: pending-chunks | chunks <num>... | batches <num>...')
process.exit(1)
