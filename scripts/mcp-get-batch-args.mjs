#!/usr/bin/env node
/**
 * Execute one batch SQL file via Supabase MCP plugin proxy pattern.
 * Reads .run_batch_NN.sql or CALL_MCP_NN.args.json and prints MCP args JSON to stdout.
 * Agent: CallMcpTool execute_sql with parsed output.
 *
 * Usage: node scripts/mcp-get-batch-args.mjs 05
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const DIR = path.join(ROOT, 'output/mcp-current')
const PROJECT_ID = 'kmepxyervpeujwvgdqtm'
const id = String(process.argv[2] ?? '').padStart(2, '0')

const sqlFile = path.join(DIR, `.run_batch_${id}.sql`)
const jsonFile = path.join(DIR, `CALL_MCP_${id}.args.json`)

let query
if (fs.existsSync(sqlFile)) {
  query = fs.readFileSync(sqlFile, 'utf8')
} else if (fs.existsSync(jsonFile)) {
  query = JSON.parse(fs.readFileSync(jsonFile, 'utf8')).query
} else {
  console.error(`Missing batch ${id} files`)
  process.exit(1)
}

process.stdout.write(JSON.stringify({ project_id: PROJECT_ID, query }))
