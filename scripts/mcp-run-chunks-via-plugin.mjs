#!/usr/bin/env node
/**
 * Emit chunk MCP invoke files for agent CallMcpTool loop.
 * Usage: node scripts/mcp-run-chunks-via-plugin.mjs list
 *        node scripts/mcp-run-chunks-via-plugin.mjs emit 02
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const DIR = path.join(ROOT, 'output/mcp-current')
const RESULTS = path.join(ROOT, 'output/mcp-mat-batch-results.json')

const pad = (n) => String(n).padStart(2, '0')

const chunkMeta = (n) => {
  const id = pad(n)
  return JSON.parse(fs.readFileSync(path.join(DIR, `_chunk_invoke_${id}.json`), 'utf8'))
}

const loadCall = (n) => {
  const id = pad(n)
  const file = path.join(DIR, `_CALL_MCP_CHUNK_${id}.json`)
  if (!fs.existsSync(file)) {
    const p = chunkMeta(n)
    fs.writeFileSync(file, JSON.stringify({ project_id: p.project_id, query: p.query }))
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

const isChunkDone = (n) => {
  if (!fs.existsSync(RESULTS)) return false
  const data = JSON.parse(fs.readFileSync(RESULTS, 'utf8'))
  const ok = new Set(data.results.filter((r) => r.success).map((r) => r.batch))
  const { batches } = chunkMeta(n)
  const [start, end] = batches.split('-').map(Number)
  for (let i = start; i <= end; i++) {
    if (!ok.has(`batch_${pad(i)}.sql`)) return false
  }
  return true
}

const cmd = process.argv[2]

if (cmd === 'list') {
  const pending = []
  for (let c = 1; c <= 24; c++) {
    if (!isChunkDone(c)) pending.push({ chunk: pad(c), batches: chunkMeta(c).batches })
  }
  console.log(JSON.stringify({ pending, count: pending.length }, null, 2))
  process.exit(0)
}

if (cmd === 'emit') {
  const n = Number(process.argv[3])
  const args = loadCall(n)
  const out = path.join(DIR, `_EMIT_CHUNK_${pad(n)}.json`)
  fs.writeFileSync(out, JSON.stringify(args))
  console.log(JSON.stringify({ chunk: pad(n), batches: chunkMeta(n).batches, out, queryLength: args.query.length }))
  process.exit(0)
}

console.log('Usage: list | emit <chunk_num>')
process.exit(1)
