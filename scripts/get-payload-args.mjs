#!/usr/bin/env node
/** Output MCP execute_sql args for a payload batch number (01-70). */
import fs from 'node:fs'
import path from 'node:path'

const n = String(process.argv[2] ?? '').padStart(2, '0')
const file = path.join(import.meta.dirname, '..', 'output', 'mcp-current', `payload_${n}.json`)
const p = JSON.parse(fs.readFileSync(file, 'utf8'))
process.stdout.write(JSON.stringify({ project_id: p.project_id, query: p.query, batch: p.batch }))
