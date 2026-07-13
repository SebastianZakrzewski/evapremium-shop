#!/usr/bin/env node
/** Emit MCP execute_sql args JSON for a chunk/batch to stdout. */
import { readFileSync } from 'node:fs'

const [kind, num] = process.argv.slice(2)
const id = String(num).padStart(2, '0')
const file =
  kind === 'batch'
    ? `output/mcp-current/_mcp_invoke_${id}.json`
    : `output/mcp-current/_mcp_args_chunk_${id}.json`

const data = JSON.parse(readFileSync(file, 'utf8'))
process.stdout.write(JSON.stringify({ project_id: data.project_id, query: data.query }))
