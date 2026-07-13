#!/usr/bin/env node
/**
 * Load MCP execute_sql args from UTF-8 JSON file and print metadata.
 * Agent uses CallMcpTool with JSON.parse(readFileSync(path)).
 *
 * Usage:
 *   node scripts/mcp-load-and-call.mjs batch 04
 *   node scripts/mcp-load-and-call.mjs chunk 02
 *   node scripts/mcp-load-and-call.mjs file output/mcp-current/.mcp_tool_args.json
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const DIR = path.join(ROOT, 'output/mcp-current')
const PROJECT_ID = 'kmepxyervpeujwvgdqtm'

const [kind, numOrPath] = process.argv.slice(2)

let file
if (kind === 'file') {
  file = path.resolve(ROOT, numOrPath)
} else if (kind === 'batch') {
  const num = String(numOrPath).padStart(2, '0')
  file = path.join(DIR, `CALL_MCP_${num}.args.json`)
} else if (kind === 'chunk') {
  const num = String(numOrPath).padStart(2, '0')
  file = path.join(DIR, `.exec_args_${num}.json`)
} else {
  console.error('Usage: node scripts/mcp-load-and-call.mjs <batch|chunk|file> <num|path>')
  process.exit(1)
}

if (!fs.existsSync(file)) {
  console.error(`Missing ${file}`)
  process.exit(1)
}

const payload = JSON.parse(fs.readFileSync(file, 'utf8'))
const out = path.join(DIR, '.mcp_tool_args.json')
fs.writeFileSync(out, JSON.stringify({ project_id: payload.project_id, query: payload.query }))
console.log(JSON.stringify({
  file,
  out,
  project_id: payload.project_id,
  queryLength: payload.query.length,
  call: 'CallMcpTool execute_sql with JSON.parse(fs.readFileSync(out))',
}))
