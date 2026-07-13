#!/usr/bin/env node
/** Print MCP execute_sql payload JSON for batch N (stdout). */
import { readFileSync } from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const n = String(process.argv[2] ?? '').padStart(2, '0')
if (!/^\d{2}$/.test(n)) {
  console.error('Usage: node scripts/mcp-load-batch-payload.mjs <batch_number>')
  process.exit(1)
}
const file = path.join(ROOT, 'output/mcp-current', `_mcp_call_batch_${n}.json`)
const payload = JSON.parse(readFileSync(file, 'utf8'))
process.stdout.write(JSON.stringify(payload))
