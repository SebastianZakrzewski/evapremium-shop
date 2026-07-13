#!/usr/bin/env node
/** Print MCP execute_sql payload JSON for chunk N (stdout). */
import { readFileSync } from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const n = String(process.argv[2] ?? '').padStart(2, '0')
if (!/^\d{2}$/.test(n)) {
  console.error('Usage: node scripts/mcp-load-chunk-payload.mjs <chunk_number>')
  process.exit(1)
}
const invoke = path.join(ROOT, 'output/mcp-current', `_chunk_invoke_${n}.json`)
const payload = JSON.parse(readFileSync(invoke, 'utf8'))
process.stdout.write(JSON.stringify({ project_id: payload.project_id, query: payload.query }))
