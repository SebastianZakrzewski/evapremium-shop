#!/usr/bin/env node
/**
 * Extract SQL from chunk/batch invoke file for MCP execute_sql.
 * Usage: node scripts/mcp-read-query.mjs chunk 01
 *        node scripts/mcp-read-query.mjs batch 01
 */
import fs from 'node:fs'
import path from 'node:path'

const [kind, num] = process.argv.slice(2)
const id = String(num).padStart(2, '0')
const root = path.resolve(import.meta.dirname, '..')
const dir = path.join(root, 'output/mcp-current')

let file
if (kind === 'chunk') {
  file = path.join(dir, `_out_chunk_${id}.json`)
} else if (kind === 'batch') {
  file = path.join(dir, `_mcp_invoke_${id}.json`)
} else {
  console.error('Usage: node scripts/mcp-read-query.mjs <chunk|batch> <01-70>')
  process.exit(1)
}

const data = JSON.parse(fs.readFileSync(file, 'utf8'))
process.stdout.write(JSON.stringify({ project_id: data.project_id, query: data.query }))
