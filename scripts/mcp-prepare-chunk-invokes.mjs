#!/usr/bin/env node
/** Prepare .invoke_chunk_XX.json files for chunks 02-23 (UTF-8). */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const DIR = path.join(ROOT, 'output/mcp-current')
const PROJECT_ID = 'kmepxyervpeujwvgdqtm'

const from = Number(process.argv[2] ?? 2)
const to = Number(process.argv[3] ?? 23)

for (let i = from; i <= to; i++) {
  const id = String(i).padStart(2, '0')
  const sql = fs.readFileSync(path.join(DIR, `.chunk_${id}_query.sql`), 'utf8')
  const out = path.join(DIR, `.invoke_chunk_${id}.json`)
  fs.writeFileSync(out, JSON.stringify({ project_id: PROJECT_ID, query: sql }))
  console.log(`prepared chunk ${id} (${sql.length} bytes)`)
}
