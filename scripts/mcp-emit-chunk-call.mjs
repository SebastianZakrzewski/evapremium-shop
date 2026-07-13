#!/usr/bin/env node
/**
 * Print MCP execute_sql arguments for chunk N as JSON to stdout (UTF-8).
 * Agent reads via: node scripts/mcp-emit-chunk-call.mjs 02
 * Then CallMcpTool execute_sql with parsed { project_id, query }.
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const chunk = String(process.argv[2] ?? '').padStart(2, '0')

if (!/^\d{2}$/.test(chunk)) {
  console.error('Usage: node scripts/mcp-emit-chunk-call.mjs <chunk_num>')
  process.exit(1)
}

const file = path.join(ROOT, 'output/mcp-current', `.exec_args_${chunk}.json`)
if (!fs.existsSync(file)) {
  console.error(`Missing ${file}`)
  process.exit(1)
}

const payload = JSON.parse(fs.readFileSync(file, 'utf8'))
process.stdout.write(JSON.stringify({ project_id: payload.project_id, query: payload.query }))
