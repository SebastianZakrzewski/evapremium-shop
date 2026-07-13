#!/usr/bin/env node
/**
 * Emit MCP execute_sql args as JSON lines for agent CallMcpTool invocations.
 * Usage: node scripts/mcp-emit-batch-lines.mjs 1 70
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const FROM = Number(process.argv[2] ?? 1)
const TO = Number(process.argv[3] ?? 70)
const PROJECT_ID = 'kmepxyervpeujwvgdqtm'

for (let i = FROM; i <= TO; i++) {
  const id = String(i).padStart(2, '0')
  const sqlPath = path.join(ROOT, 'output/mat-templates-seed-batches', `batch_${id}.sql`)
  const query = fs.readFileSync(sqlPath, 'utf8')
  const line = JSON.stringify({
    batch: `batch_${id}.sql`,
    project_id: PROJECT_ID,
    query,
  })
  process.stdout.write(line + '\n')
}
