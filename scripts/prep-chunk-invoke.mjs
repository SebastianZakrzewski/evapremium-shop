#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const id = String(process.argv[2] ?? '').padStart(2, '0')
const root = path.resolve(import.meta.dirname, '..')
const chunk = JSON.parse(fs.readFileSync(path.join(root, 'output/mcp-current/chunks3', `chunk_${id}.json`), 'utf8'))
const out = path.join(root, 'output/mcp-current', `_chunk_invoke_${id}.json`)
fs.writeFileSync(out, JSON.stringify({ project_id: chunk.project_id, query: chunk.query, batches: chunk.batches }))
console.log(JSON.stringify({ chunk: id, batches: chunk.batches, out, queryLen: chunk.query.length }))
