#!/usr/bin/env node
/**
 * Prepare per-batch MCP invoke JSON files for CallMcpTool execution.
 * Usage: node scripts/mcp-prepare-batch-invokes.mjs [from] [to]
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const SQL_DIR = path.join(ROOT, 'output/mat-templates-seed-batches')
const OUT_DIR = path.join(ROOT, 'output/mcp-temp/invokes')
const PROJECT_ID = 'kmepxyervpeujwvgdqtm'
const FROM = Number(process.argv[2] ?? 1)
const TO = Number(process.argv[3] ?? 70)

fs.mkdirSync(OUT_DIR, { recursive: true })

for (let i = FROM; i <= TO; i++) {
  const id = String(i).padStart(2, '0')
  const batch = `batch_${id}.sql`
  const query = fs.readFileSync(path.join(SQL_DIR, batch), 'utf8')
  const out = path.join(OUT_DIR, `invoke_${id}.json`)
  fs.writeFileSync(
    out,
    JSON.stringify({ project_id: PROJECT_ID, query, batch }),
  )
  console.log(`prepared ${batch} (${query.length} chars)`)
}
