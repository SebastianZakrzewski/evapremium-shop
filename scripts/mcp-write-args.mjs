#!/usr/bin/env node
/** Write MCP execute_sql args from chunk/batch file. */
import fs from 'node:fs'
import path from 'node:path'

const [kind, num] = process.argv.slice(2)
const id = String(num).padStart(2, '0')
const root = path.resolve(import.meta.dirname, '..')
const dir = path.join(root, 'output/mcp-current')

const src =
  kind === 'chunk'
    ? path.join(dir, `_out_chunk_${id}.json`)
    : path.join(dir, `_mcp_invoke_${id}.json`)

const data = JSON.parse(fs.readFileSync(src, 'utf8'))
const out = path.join(dir, `_mcp_args_${kind}_${id}.json`)
fs.writeFileSync(out, JSON.stringify({ project_id: data.project_id, query: data.query }))
console.log(out, data.query.length)
