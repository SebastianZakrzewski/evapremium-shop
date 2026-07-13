#!/usr/bin/env node
/**
 * Build final mcp-mat-batch-results.json from per-batch status in mcp-batch-status.jsonl
 * Usage: node scripts/mcp-build-results.mjs [finalCount]
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const STATUS = path.join(ROOT, 'output/mcp-temp/mcp-batch-status.jsonl')
const OUT = path.join(ROOT, 'output/mcp-mat-batch-results.json')
const PROJECT_ID = 'kmepxyervpeujwvgdqtm'

const byBatch = new Map()
if (fs.existsSync(STATUS)) {
  for (const line of fs.readFileSync(STATUS, 'utf8').split('\n')) {
    if (!line.trim()) continue
    const row = JSON.parse(line)
    byBatch.set(row.batch, row)
  }
}

const results = Array.from({ length: 70 }, (_, i) => {
  const batch = `batch_${String(i + 1).padStart(2, '0')}.sql`
  return byBatch.get(batch) ?? { batch, success: false, error: 'not executed' }
})

const finalCount = process.argv[2] ? Number(process.argv[2]) : null
const output = {
  projectId: PROJECT_ID,
  results: results.map(({ batch, success, error }) =>
    error && !success ? { batch, success, error } : { batch, success },
  ),
  finalCount,
  executedAt: new Date().toISOString(),
}
fs.writeFileSync(OUT, JSON.stringify(output, null, 2))
const succeeded = results.filter((r) => r.success).length
console.log(`Wrote ${OUT}: ${succeeded}/70 succeeded, finalCount=${finalCount}`)
