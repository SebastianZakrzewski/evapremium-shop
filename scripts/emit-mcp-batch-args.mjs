#!/usr/bin/env node
/**
 * Outputs MCP execute_sql arguments as JSON lines for batches in range.
 * Usage: node scripts/emit-mcp-batch-args.mjs 1 5
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const PAYLOAD_DIR = path.join(ROOT, 'output', 'mcp-current')
const start = Number(process.argv[2] ?? 1)
const end = Number(process.argv[3] ?? 70)

for (let i = start; i <= end; i++) {
  const id = String(i).padStart(2, '0')
  const payload = JSON.parse(fs.readFileSync(path.join(PAYLOAD_DIR, `payload_${id}.json`), 'utf8'))
  console.log(JSON.stringify({
    batch: payload.batch ?? `batch_${id}.sql`,
    project_id: payload.project_id,
    query: payload.query,
  }))
}
