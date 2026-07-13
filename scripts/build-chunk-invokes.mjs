#!/usr/bin/env node
/** Build combined MCP invoke files from mcp-exec-chunks (5 batches each). */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const CHUNK_DIR = path.join(ROOT, 'output/mcp-exec-chunks')
const OUT_DIR = path.join(ROOT, 'output/mcp-temp')
const PROJECT_ID = 'kmepxyervpeujwvgdqtm'

const stripTxn = (sql) =>
  sql
    .replace(/^\s*BEGIN;\s*/i, '')
    .replace(/\s*COMMIT;\s*$/i, '')
    .trim()

fs.mkdirSync(OUT_DIR, { recursive: true })

for (let i = 1; i <= 14; i++) {
  const id = String(i).padStart(2, '0')
  const items = JSON.parse(fs.readFileSync(path.join(CHUNK_DIR, `chunk_${id}.json`), 'utf8'))
  const batches = items.map((x) => x.file)
  const parts = items.map((x) => stripTxn(x.query))
  const query = `BEGIN;\n\n${parts.join('\n\n')}\n\nCOMMIT;`
  const out = { project_id: PROJECT_ID, chunk: id, batches, query }
  fs.writeFileSync(path.join(OUT_DIR, `chunk_invoke_${id}.json`), JSON.stringify(out), 'utf8')
  console.log(`chunk_invoke_${id}: ${batches.join(', ')} (${query.length} chars)`)
}
