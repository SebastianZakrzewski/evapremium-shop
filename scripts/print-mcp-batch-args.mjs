#!/usr/bin/env node
/**
 * Prints MCP execute_sql arguments for a batch range.
 * Usage: node scripts/print-mcp-batch-args.mjs 1 70
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const BATCH_DIR = path.join(ROOT, 'output', 'mat-templates-seed-batches')
const PROJECT_ID = 'kmepxyervpeujwvgdqtm'

const start = Number(process.argv[2] ?? 1)
const end = Number(process.argv[3] ?? start)

for (let i = start; i <= end; i++) {
  const id = String(i).padStart(2, '0')
  const file = `batch_${id}.sql`
  const sqlPath = path.join(BATCH_DIR, file)
  const query = fs.readFileSync(sqlPath, 'utf8')
  const payload = { project_id: PROJECT_ID, query, batch: file }
  const outPath = path.join(ROOT, 'output', 'mcp-current', `mcp_call_${id}.json`)
  fs.writeFileSync(outPath, JSON.stringify(payload))
  console.log(`${file}: ${Buffer.byteLength(query)} bytes -> ${outPath}`)
}
