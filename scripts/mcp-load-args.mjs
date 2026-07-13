#!/usr/bin/env node
/**
 * Load MCP args JSON and invoke via stdin for agent tooling.
 * Prints project_id and query length; writes query to separate .sql file.
 */
import fs from 'node:fs'
import path from 'node:path'

const file = process.argv[2]
if (!file) {
  console.error('Usage: node scripts/mcp-load-args.mjs <args.json>')
  process.exit(1)
}

const data = JSON.parse(fs.readFileSync(file, 'utf8'))
const sqlOut = file.replace(/\.json$/, '.sql')
fs.writeFileSync(sqlOut, data.query)
console.log(JSON.stringify({ project_id: data.project_id, queryFile: sqlOut, queryLength: data.query.length }))
