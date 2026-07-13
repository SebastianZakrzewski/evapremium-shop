#!/usr/bin/env node
/**
 * Build combined SQL chunks (5 batches each) for fewer MCP execute_sql calls.
 * Usage: node scripts/build-mcp-chunks.mjs [chunkSize]
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const BATCH_DIR = path.join(ROOT, 'output', 'mat-templates-seed-batches')
const OUT_DIR = path.join(ROOT, 'output', 'mcp-chunks')
const chunkSize = Number(process.argv[2] ?? 5)

fs.mkdirSync(OUT_DIR, { recursive: true })

const stripTxn = (sql) =>
  sql
    .replace(/^\s*BEGIN;\s*/i, '')
    .replace(/\s*COMMIT;\s*$/i, '')
    .trim()

const batches = Array.from({ length: 70 }, (_, i) => `batch_${String(i + 1).padStart(2, '0')}.sql`)
const chunks = []

for (let i = 0; i < batches.length; i += chunkSize) {
  const group = batches.slice(i, i + chunkSize)
  const parts = group.map((f) => stripTxn(fs.readFileSync(path.join(BATCH_DIR, f), 'utf8')))
  const query = `BEGIN;\n\n${parts.join('\n\n')}\n\nCOMMIT;`
  const chunkNum = String(Math.floor(i / chunkSize) + 1).padStart(2, '0')
  const meta = { chunk: chunkNum, batches: group, query }
  fs.writeFileSync(path.join(OUT_DIR, `chunk_${chunkNum}.json`), JSON.stringify(meta), 'utf8')
  chunks.push(meta)
  console.log(`chunk_${chunkNum}: ${group.join(', ')} (${query.length} chars)`)
}

console.log(`Wrote ${chunks.length} chunks to ${OUT_DIR}`)
