#!/usr/bin/env node
/**
 * Reads batch SQL from payload files and prints one JSON line per batch for MCP execute_sql.
 * Agent should call MCP with each line's project_id + query, then record results.
 * Usage: node scripts/mcp-exec-all-batches.mjs [from] [to]
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const PAYLOAD_DIR = path.join(ROOT, 'output', 'mcp-current')
const from = Number(process.argv[2] ?? 1)
const to = Number(process.argv[3] ?? 70)

for (let i = from; i <= to; i++) {
  const id = String(i).padStart(2, '0')
  const p = JSON.parse(fs.readFileSync(path.join(PAYLOAD_DIR, `payload_${id}.json`), 'utf8'))
  process.stdout.write(
    JSON.stringify({ batch: p.batch, project_id: p.project_id, query: p.query }) + '\n'
  )
}
