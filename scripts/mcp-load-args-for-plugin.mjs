#!/usr/bin/env node
/**
 * Load execute_sql args for batch or chunk (stdout = JSON, UTF-8 safe).
 * Agent: CallMcpTool execute_sql with JSON.parse(readFileSync via this script output avoided - use readFileSync in agent).
 * Usage:
 *   node scripts/mcp-load-args-for-plugin.mjs batch 04
 *   node scripts/mcp-load-args-for-plugin.mjs chunk 02
 */
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const DIR = path.join(ROOT, 'output/mcp-current')
const [kind, idRaw] = process.argv.slice(2)
const id = String(idRaw ?? '').padStart(2, '0')

if (kind === 'batch') {
  const file = path.join(DIR, `_mcp_call_batch_${id}.json`)
  if (!existsSync(file)) {
    console.error(`Missing ${file}`)
    process.exit(1)
  }
  const p = JSON.parse(readFileSync(file, 'utf8'))
  process.stdout.write(JSON.stringify({ project_id: p.project_id, query: p.query, batch: `batch_${id}.sql` }))
} else if (kind === 'chunk') {
  const file = path.join(DIR, `_CALL_MCP_CHUNK_${id}.json`)
  if (!existsSync(file)) {
    console.error(`Missing ${file}`)
    process.exit(1)
  }
  const p = JSON.parse(readFileSync(file, 'utf8'))
  const meta = JSON.parse(readFileSync(path.join(DIR, `_chunk_invoke_${id}.json`), 'utf8'))
  process.stdout.write(JSON.stringify({ project_id: p.project_id, query: p.query, chunk: id, batches: meta.batches }))
} else {
  console.error('Usage: batch <01-70> | chunk <01-24>')
  process.exit(1)
}
