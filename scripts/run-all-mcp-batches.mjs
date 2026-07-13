#!/usr/bin/env node
/**
 * Reads batch SQL from payload files and prints progress.
 * Actual MCP execution must be done by the agent via CallMcpTool.
 * This script prepares a manifest for sequential execution.
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const PAYLOAD_DIR = path.join(ROOT, 'output', 'mcp-current')
const RESULTS_PATH = path.join(ROOT, 'output', 'mcp-mat-batch-results.json')

const results = {
  projectId: 'kmepxyervpeujwvgdqtm',
  startedAt: new Date().toISOString(),
  results: [],
  finalCount: null,
}

for (let i = 1; i <= 70; i++) {
  const id = String(i).padStart(2, '0')
  const payloadPath = path.join(PAYLOAD_DIR, `payload_${id}.json`)
  if (!fs.existsSync(payloadPath)) {
    results.results.push({ batch: `batch_${id}.sql`, success: false, error: 'payload missing' })
    continue
  }
  const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf8'))
  results.results.push({
    batch: payload.batch ?? `batch_${id}.sql`,
    queryBytes: Buffer.byteLength(payload.query, 'utf8'),
    pending: true,
  })
}

fs.writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2))
console.log(`Prepared manifest: ${results.results.length} batches`)
console.log(`Results: ${RESULTS_PATH}`)
