#!/usr/bin/env node
/**
 * Get next pending batch, write invoke to current_invoke.json for CallMcpTool.
 * Usage: node scripts/mcp-next-batch.mjs
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const RESULTS = path.join(ROOT, 'output/mcp-mat-batch-results.json')
const INVOKE_DIR = path.join(ROOT, 'output/mcp-temp/invokes')
const CURRENT = path.join(ROOT, 'output/mcp-temp/current_invoke.json')

const results = fs.existsSync(RESULTS)
  ? JSON.parse(fs.readFileSync(RESULTS, 'utf8'))
  : { results: [] }

const done = new Set((results.results ?? []).filter((r) => r.success).map((r) => r.batch))

for (let i = 1; i <= 70; i++) {
  const batch = `batch_${String(i).padStart(2, '0')}.sql`
  if (done.has(batch)) continue
  const id = String(i).padStart(2, '0')
  const invoke = JSON.parse(fs.readFileSync(path.join(INVOKE_DIR, `invoke_${id}.json`), 'utf8'))
  fs.writeFileSync(CURRENT, JSON.stringify({ project_id: invoke.project_id, query: invoke.query, batch }))
  console.log(JSON.stringify({ batch, chars: invoke.query.length }))
  process.exit(0)
}

console.log('ALL_DONE')
