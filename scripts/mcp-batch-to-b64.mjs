#!/usr/bin/env node
/** Encode _mcp_call_batch_XX.json args as base64 for agent MCP invoke. */
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const n = String(process.argv[2] ?? '').padStart(2, '0')
const kind = process.argv[3] ?? 'batch'

let file
if (kind === 'chunk') {
  file = path.join(ROOT, 'output/mcp-current', `_chunk_invoke_${n}.json`)
} else {
  file = path.join(ROOT, 'output/mcp-current', `_mcp_call_batch_${n}.json`)
}

const payload = JSON.parse(readFileSync(file, 'utf8'))
const args = { project_id: payload.project_id, query: payload.query }
const out = path.join(ROOT, 'output/mcp-current', `_${kind}_b64_${n}.txt`)
writeFileSync(out, Buffer.from(JSON.stringify(args), 'utf8').toString('base64'), 'utf8')
console.log(JSON.stringify({ out, project_id: args.project_id, query_len: args.query.length }))
