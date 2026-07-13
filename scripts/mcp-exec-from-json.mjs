#!/usr/bin/env node
/**
 * Load MCP execute_sql args from a JSON file and print metadata.
 * Agent reads the same file and passes {project_id, query} to CallMcpTool.
 *
 * Usage:
 *   node scripts/mcp-exec-from-json.mjs output/mcp-current/CALL_MCP_04.args.json
 *   node scripts/mcp-exec-from-json.mjs chunk 02
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const DIR = path.join(ROOT, 'output/mcp-current')
const PROJECT_ID = 'kmepxyervpeujwvgdqtm'

const [kindOrFile, num] = process.argv.slice(2)
if (!kindOrFile) {
  console.error('Usage: mcp-exec-from-json.mjs <json-file|chunk|batch> [num]')
  process.exit(1)
}

let file
if (kindOrFile === 'chunk') {
  file = path.join(DIR, `.exec_args_${String(num).padStart(2, '0')}.json`)
} else if (kindOrFile === 'batch') {
  file = path.join(DIR, `CALL_MCP_${String(num).padStart(2, '0')}.args.json`)
} else {
  file = path.resolve(kindOrFile)
}

const payload = JSON.parse(fs.readFileSync(file, 'utf8'))
const out = path.join(DIR, '.mcp_tool_args.json')
fs.writeFileSync(out, JSON.stringify({ project_id: payload.project_id ?? PROJECT_ID, query: payload.query }))
console.log(JSON.stringify({
  file,
  out,
  project_id: payload.project_id ?? PROJECT_ID,
  queryLength: payload.query.length,
}))
