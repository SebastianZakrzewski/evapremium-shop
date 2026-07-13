#!/usr/bin/env node
/**
 * List pending batches/chunks and emit invoke paths for agent MCP loop.
 * Usage:
 *   node scripts/mcp-run-pending-batches.mjs status
 *   node scripts/mcp-run-pending-batches.mjs next [limit]
 *   node scripts/mcp-run-pending-batches.mjs chunk-next [limit]
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const DIR = path.join(ROOT, 'output/mcp-current')
const RESULTS = path.join(ROOT, 'output/mcp-mat-batch-results.json')

const loadResults = () => {
  if (!fs.existsSync(RESULTS)) {
    return { results: [] }
  }
  return JSON.parse(fs.readFileSync(RESULTS, 'utf8'))
}

const succeededBatches = () => {
  const data = loadResults()
  return new Set(data.results.filter((r) => r.success).map((r) => r.batch))
}

const pendingBatches = () => {
  const done = succeededBatches()
  const pending = []
  for (let i = 1; i <= 70; i++) {
    const batch = `batch_${String(i).padStart(2, '0')}.sql`
    if (!done.has(batch)) pending.push(batch)
  }
  return pending
}

const pendingChunks = () => {
  const done = succeededBatches()
  const pending = []
  for (let i = 1; i <= 24; i++) {
    const id = String(i).padStart(2, '0')
    const meta = JSON.parse(fs.readFileSync(path.join(DIR, `_chunk_invoke_${id}.json`), 'utf8'))
    const [start, end] = meta.batches.split('-').map(Number)
    const allDone = Array.from({ length: end - start + 1 }, (_, j) => start + j).every(
      (n) => done.has(`batch_${String(n).padStart(2, '0')}.sql`)
    )
    if (!allDone) pending.push({ chunk: id, batches: meta.batches })
  }
  return pending
}

const [cmd, limitArg] = process.argv.slice(2)
const limit = Number(limitArg ?? 5)

if (cmd === 'status') {
  const done = succeededBatches()
  const pending = pendingBatches()
  console.log(
    JSON.stringify(
      {
        succeeded: done.size,
        pending: pending.length,
        pendingBatches: pending.slice(0, 20),
        pendingChunks: pendingChunks().slice(0, 10),
      },
      null,
      2
    )
  )
} else if (cmd === 'next') {
  const pending = pendingBatches().slice(0, limit)
  const items = pending.map((batch) => {
    const id = batch.match(/batch_(\d+)/)[1]
    return {
      batch,
      invoke: path.join(DIR, `_invoke_${id}.json`),
      payload: path.join(DIR, `exec_payload_${id}.json`),
    }
  })
  console.log(JSON.stringify(items, null, 2))
} else if (cmd === 'chunk-next') {
  const pending = pendingChunks().slice(0, limit)
  const items = pending.map(({ chunk, batches }) => ({
    chunk,
    batches,
    invoke: path.join(DIR, `_mcp_args_chunk_${chunk}.json`),
  }))
  console.log(JSON.stringify(items, null, 2))
} else {
  console.error('Usage: status | next [limit] | chunk-next [limit]')
  process.exit(1)
}
