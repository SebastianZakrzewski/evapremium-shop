#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const ROOT = path.resolve(import.meta.dirname, '..')
const FROM = Number(process.argv[2] ?? 1)
const TO = Number(process.argv[3] ?? 23)

const recordBatches = (range) => {
  const [start, end] = range.split('-').map(Number)
  for (let i = start; i <= end; i++) {
    const batch = `batch_${String(i).padStart(2, '0')}.sql`
    spawnSync('node', ['scripts/mcp-mat-batch-record.mjs', 'record', batch, 'success'], {
      cwd: ROOT,
      stdio: 'pipe',
      shell: true,
    })
  }
}

for (let i = FROM; i <= TO; i++) {
  const id = String(i).padStart(2, '0')
  const invokePath = path.join(ROOT, 'output/mcp-current', `_chunk_invoke_${id}.json`)
  const outPath = path.join(ROOT, 'output/mcp-current', `_out_chunk_${id}.json`)
  const chunk = JSON.parse(fs.readFileSync(invokePath, 'utf8'))
  fs.writeFileSync(outPath, JSON.stringify({ project_id: chunk.project_id, query: chunk.query }))
  console.log(`prepared chunk ${id} batches ${chunk.batches}`)
}
