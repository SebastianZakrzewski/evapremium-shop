#!/usr/bin/env node
/**
 * Execute mat_templates seed chunks via Supabase MCP execute_sql.
 * Reads chunk JSON from output/mcp-current/chunks3/chunk_XX.json
 * Outputs progress to stdout for agent logging.
 *
 * NOTE: This script cannot call MCP directly. It prints chunk metadata.
 * The agent must call MCP execute_sql for each chunk using the query from the JSON file.
 *
 * Usage: node scripts/run-chunk-batches.mjs [start] [end]
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const CHUNK_DIR = path.join(ROOT, 'output', 'mcp-current', 'chunks3')
const BATCH_DIR = path.join(ROOT, 'output', 'mat-templates-seed-batches')
const RESULTS_PATH = path.join(ROOT, 'output', 'mcp-mat-batch-results.json')

const start = Number(process.argv[2] ?? 1)
const end = Number(process.argv[3] ?? 24)

const results = {
  projectId: 'kmepxyervpeujwvgdqtm',
  startedAt: new Date().toISOString(),
  method: 'mcp-chunks3',
  chunks: [],
  batchResults: [],
  succeeded: 0,
  failed: 0,
  finalCount: null,
}

for (let c = start; c <= end; c++) {
  const id = String(c).padStart(2, '0')
  const chunkFile = path.join(CHUNK_DIR, `chunk_${id}.json`)
  if (!fs.existsSync(chunkFile)) {
    results.chunks.push({ chunk: id, success: false, error: 'file missing' })
    results.failed++
    continue
  }
  const payload = JSON.parse(fs.readFileSync(chunkFile, 'utf8'))
  results.chunks.push({
    chunk: id,
    batches: payload.batches,
    queryBytes: Buffer.byteLength(payload.query),
    pending: true,
  })
}

fs.writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2))
console.log(JSON.stringify({ start, end, chunks: results.chunks.length, resultsPath: RESULTS_PATH }))
