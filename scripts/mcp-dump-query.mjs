#!/usr/bin/env node
/** Dump execute_sql query to stdout for agent CallMcpTool. Usage: node scripts/mcp-dump-query.mjs batch 05 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const DIR = path.join(ROOT, 'output/mcp-current')
const PROJECT_ID = 'kmepxyervpeujwvgdqtm'
const [kind, num] = process.argv.slice(2)
const id = String(num).padStart(2, '0')
const file =
  kind === 'chunk'
    ? path.join(DIR, `.exec_args_${id}.json`)
    : path.join(DIR, `CALL_MCP_${id}.args.json`)
const payload = JSON.parse(fs.readFileSync(file, 'utf8'))
process.stdout.write(payload.query)
