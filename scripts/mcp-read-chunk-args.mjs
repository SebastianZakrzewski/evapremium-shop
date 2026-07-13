#!/usr/bin/env node
/** Print execute_sql args JSON for chunk N to stdout (UTF-8). */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const chunk = String(process.argv[2] ?? '').padStart(2, '0')
if (!/^\d{2}$/.test(chunk)) {
  console.error('usage: node mcp-read-chunk-args.mjs <chunk_num>')
  process.exit(1)
}

const file = path.join(ROOT, 'output/mcp-current', `.invoke_chunk_${chunk}.json`)
const payload = JSON.parse(fs.readFileSync(file, 'utf8'))
process.stdout.write(JSON.stringify({ project_id: payload.project_id, query: payload.query }))
