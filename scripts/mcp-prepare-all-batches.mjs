#!/usr/bin/env node
/**
 * Prepare all pending batch SQL + MCP args files for agent CallMcpTool loop.
 * Usage: node scripts/mcp-prepare-all-batches.mjs [start] [end]
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const DIR = path.join(ROOT, 'output/mcp-current')
const RESULTS = path.join(ROOT, 'output/mcp-mat-batch-results.json')
const PROJECT_ID = 'kmepxyervpeujwvgdqtm'
const start = Number(process.argv[2] ?? 5)
const end = Number(process.argv[3] ?? 69)

const pad = (n) => String(n).padStart(2, '0')
const isDone = (n) => {
  if (!fs.existsSync(RESULTS)) return false
  const data = JSON.parse(fs.readFileSync(RESULTS, 'utf8'))
  return data.results.some((r) => r.batch === `batch_${pad(n)}.sql` && r.success)
}

const pending = []
for (let i = start; i <= end; i++) {
  if (isDone(i)) continue
  const id = pad(i)
  const jsonFile = path.join(DIR, `CALL_MCP_${id}.args.json`)
  if (!fs.existsSync(jsonFile)) {
    console.error(`Missing ${jsonFile}`)
    continue
  }
  const payload = JSON.parse(fs.readFileSync(jsonFile, 'utf8'))
  const sqlOut = path.join(DIR, `.run_batch_${id}.sql`)
  const argsOut = path.join(DIR, `.mcp_args_batch_${id}.json`)
  fs.writeFileSync(sqlOut, payload.query, 'utf8')
  fs.writeFileSync(
    argsOut,
    JSON.stringify({ project_id: payload.project_id ?? PROJECT_ID, query: payload.query }),
    'utf8'
  )
  pending.push({ batch: id, sqlOut, argsOut, queryLength: payload.query.length })
}

fs.writeFileSync(path.join(DIR, '.pending_batches.json'), JSON.stringify({ pending, count: pending.length }, null, 2))
console.log(JSON.stringify({ prepared: pending.length, first: pending[0]?.batch, last: pending.at(-1)?.batch }))
