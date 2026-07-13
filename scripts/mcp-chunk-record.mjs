#!/usr/bin/env node
/**
 * Execute chunk SQL files via Supabase Management API using MCP-style payloads.
 * Run by agent: reads chunk invoke JSON, agent calls execute_sql per chunk.
 * Also supports recording batch results for chunk ranges.
 */
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const ROOT = path.resolve(import.meta.dirname, '..')
const CHUNK_DIR = path.join(ROOT, 'output/mcp-current')

const recordRange = (range, status, error) => {
  const [start, end] = range.split('-').map(Number)
  for (let i = start; i <= end; i++) {
    const batch = `batch_${String(i).padStart(2, '0')}.sql`
    const args = ['scripts/mcp-mat-batch-record.mjs', 'record', batch, status]
    if (error) args.push(error.slice(0, 500))
    spawnSync('node', args, { cwd: ROOT, stdio: 'pipe', shell: true })
  }
}

const chunkNum = process.argv[2]
const status = process.argv[3]
const error = process.argv[4]

if (chunkNum && status) {
  const id = String(chunkNum).padStart(2, '0')
  const meta = JSON.parse(fs.readFileSync(path.join(CHUNK_DIR, `_chunk_invoke_${id}.json`), 'utf8'))
  recordRange(meta.batches, status, error)
  console.log(`recorded chunk ${id} batches ${meta.batches}: ${status}`)
  process.exit(0)
}

// List pending chunks
for (let i = 1; i <= 24; i++) {
  const id = String(i).padStart(2, '0')
  const meta = JSON.parse(fs.readFileSync(path.join(CHUNK_DIR, `_chunk_invoke_${id}.json`), 'utf8'))
  console.log(JSON.stringify({ chunk: id, batches: meta.batches, out: path.join(CHUNK_DIR, `_out_chunk_${id}.json`) }))
}
