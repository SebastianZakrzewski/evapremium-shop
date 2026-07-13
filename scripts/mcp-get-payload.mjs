#!/usr/bin/env node
/**
 * Load MCP execute_sql payload from UTF-8 safe source files.
 * Usage:
 *   node scripts/mcp-get-payload.mjs batch 01
 *   node scripts/mcp-get-payload.mjs chunk 02
 * Writes JSON to output/mcp-current/.current_mcp_payload.json (UTF-8)
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const DIR = path.join(ROOT, 'output/mcp-current')
const OUT = path.join(DIR, '.current_mcp_payload.json')
const PROJECT_ID = 'kmepxyervpeujwvgdqtm'

const [kind, numRaw] = process.argv.slice(2)
const num = String(numRaw ?? '').padStart(2, '0')

if (!kind || !num) {
  console.error('Usage: node scripts/mcp-get-payload.mjs <batch|chunk> <num>')
  process.exit(1)
}

let payload
if (kind === 'batch') {
  const file = path.join(DIR, `CALL_MCP_${num}.args.json`)
  payload = JSON.parse(fs.readFileSync(file, 'utf8'))
} else if (kind === 'chunk') {
  const sql = fs.readFileSync(path.join(DIR, `.chunk_${num}_query.sql`), 'utf8')
  payload = { project_id: PROJECT_ID, query: sql }
} else {
  console.error('kind must be batch or chunk')
  process.exit(1)
}

fs.writeFileSync(OUT, JSON.stringify(payload))
const meta = kind === 'chunk'
  ? JSON.parse(fs.readFileSync(path.join(DIR, `_chunk_invoke_${num}.json`), 'utf8'))
  : null
console.log(JSON.stringify({
  kind,
  num,
  out: OUT,
  project_id: payload.project_id,
  queryLength: payload.query.length,
  batches: meta?.batches ?? `batch_${num}.sql`,
}))
