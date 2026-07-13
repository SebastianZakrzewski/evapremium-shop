#!/usr/bin/env node
/**
 * Load batch payload from _mcp_call_batch_XX.json and print MCP args path + metadata.
 * Agent uses CallMcpTool with JSON.parse(readFileSync(path)).
 * Usage: node scripts/mcp-plugin-exec-batch.mjs 04
 */
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const n = String(process.argv[2] ?? '').padStart(2, '0')
if (!/^\d{2}$/.test(n)) {
  console.error('Usage: node scripts/mcp-plugin-exec-batch.mjs <01-70>')
  process.exit(1)
}
const file = path.join(ROOT, 'output/mcp-current', `_mcp_call_batch_${n}.json`)
if (!existsSync(file)) {
  console.error(`Missing ${file}`)
  process.exit(1)
}
const payload = JSON.parse(readFileSync(file, 'utf8'))
console.log(JSON.stringify({
  batch: `batch_${n}.sql`,
  file,
  project_id: payload.project_id,
  queryLength: payload.query.length,
}))
