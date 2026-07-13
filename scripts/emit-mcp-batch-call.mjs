#!/usr/bin/env node
/** Emit one-line JSON for MCP execute_sql from payload batch number. */
import fs from 'node:fs'
import path from 'node:path'

const n = String(process.argv[2] ?? '').padStart(2, '0')
const p = JSON.parse(
  fs.readFileSync(path.join(import.meta.dirname, '..', 'output', 'mcp-current', `payload_${n}.json`), 'utf8')
)
process.stdout.write(JSON.stringify({ project_id: p.project_id, query: p.query, batch: p.batch }))
