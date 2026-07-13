#!/usr/bin/env node
/** Print MCP execute_sql args from a prepared invoke JSON file (stdout). */
import { readFileSync } from 'node:fs'

const file = process.argv[2]
if (!file) {
  console.error('Usage: node scripts/mcp-exec-invoke-json.mjs <invoke.json>')
  process.exit(1)
}
const payload = JSON.parse(readFileSync(file, 'utf8'))
process.stdout.write(JSON.stringify({ project_id: payload.project_id, query: payload.query }))
