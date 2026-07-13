#!/usr/bin/env node
/**
 * Prepare for_mcp_XX.json files from payload_XX.json for MCP execute_sql calls.
 * Usage: node scripts/prepare-all-mcp-payloads.mjs [start] [end]
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const PAYLOAD_DIR = path.join(ROOT, 'output', 'mcp-current')
const OUT_DIR = path.join(ROOT, 'output', 'mcp-temp')
const start = Number(process.argv[2] ?? 1)
const end = Number(process.argv[3] ?? 70)

fs.mkdirSync(OUT_DIR, { recursive: true })

for (let i = start; i <= end; i++) {
  const id = String(i).padStart(2, '0')
  const payload = JSON.parse(fs.readFileSync(path.join(PAYLOAD_DIR, `payload_${id}.json`), 'utf8'))
  fs.writeFileSync(
    path.join(OUT_DIR, `for_mcp_${id}.json`),
    JSON.stringify({ project_id: payload.project_id, query: payload.query, batch: payload.batch ?? `batch_${id}.sql` }),
    'utf8',
  )
}
console.log(`Prepared for_mcp_${String(start).padStart(2, '0')}.json .. for_mcp_${String(end).padStart(2, '0')}.json`)
