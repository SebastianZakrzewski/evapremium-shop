#!/usr/bin/env node
/**
 * Outputs MCP execute_sql arguments for a chunk or batch invoke file.
 * Usage: node scripts/emit-mcp-args.mjs chunk 01
 *        node scripts/emit-mcp-args.mjs batch 01
 */
import fs from 'node:fs'
import path from 'node:path'

const [kind, num] = process.argv.slice(2)
const id = String(num).padStart(2, '0')
const root = path.resolve(import.meta.dirname, '..')
const dir = path.join(root, 'output', 'mcp-current')

const file =
  kind === 'chunk'
    ? path.join(dir, `_chunk_invoke_${id}.json`)
    : path.join(dir, `_mcp_invoke_${id}.json`)

const data = JSON.parse(fs.readFileSync(file, 'utf8'))
process.stdout.write(JSON.stringify({ project_id: data.project_id, query: data.query }))
