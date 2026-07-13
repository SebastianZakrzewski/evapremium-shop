#!/usr/bin/env node
/**
 * Record batch execution result into mcp-mat-batch-results.json
 * Usage: node scripts/mcp-mat-batch-record.mjs record batch_01.sql success
 *        node scripts/mcp-mat-batch-record.mjs record batch_01.sql failed "error message"
 *        node scripts/mcp-mat-batch-record.mjs finalize 2763
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const RESULTS_PATH = path.join(ROOT, 'output', 'mcp-mat-batch-results.json')

const loadResults = () => {
  if (!fs.existsSync(RESULTS_PATH)) {
    return {
      projectId: 'kmepxyervpeujwvgdqtm',
      startedAt: new Date().toISOString(),
      results: [],
      succeeded: 0,
      failed: 0,
      finalCount: null,
    }
  }
  return JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'))
}

const saveResults = (data) => {
  data.succeeded = data.results.filter((r) => r.success).length
  data.failed = data.results.filter((r) => r.success === false).length
  data.updatedAt = new Date().toISOString()
  fs.writeFileSync(RESULTS_PATH, JSON.stringify(data, null, 2))
}

const [cmd, ...rest] = process.argv.slice(2)

if (cmd === 'record') {
  const [batch, status, ...errorParts] = rest
  const data = loadResults()
  const existing = data.results.findIndex((r) => r.batch === batch)
  const entry = {
    batch,
    success: status === 'success',
    ...(status === 'failed' ? { error: errorParts.join(' ') } : {}),
  }
  if (existing >= 0) data.results[existing] = entry
  else data.results.push(entry)
  saveResults(data)
  console.log(`${batch}: ${status}`)
} else if (cmd === 'finalize') {
  const [count] = rest
  const data = loadResults()
  data.finalCount = Number(count)
  data.executedAt = new Date().toISOString()
  saveResults(data)
  console.log(`Final count: ${count}`)
} else if (cmd === 'init') {
  const data = {
    projectId: 'kmepxyervpeujwvgdqtm',
    startedAt: new Date().toISOString(),
    results: [],
    succeeded: 0,
    failed: 0,
    finalCount: null,
  }
  saveResults(data)
  console.log('Initialized results file')
} else {
  console.error('Usage: record|finalize|init')
  process.exit(1)
}
