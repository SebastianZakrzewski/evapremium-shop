#!/usr/bin/env node
/** Output MCP execute_sql args for a chunk invoke file (stdout). */
import fs from 'node:fs'
import path from 'node:path'

const n = String(process.argv[2] ?? '14').padStart(2, '0')
const file = path.join(import.meta.dirname, '..', 'output/mcp-temp', `chunk_invoke_${n}.json`)
const c = JSON.parse(fs.readFileSync(file, 'utf8'))
const args = { project_id: c.project_id, query: c.query }
const out = process.argv[3]
if (out) {
  fs.writeFileSync(out, JSON.stringify(args), 'utf8')
  console.log(`wrote ${out} (${args.query.length} chars)`)
} else {
  process.stdout.write(JSON.stringify(args))
}
