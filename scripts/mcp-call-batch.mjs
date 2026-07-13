#!/usr/bin/env node
/** Print MCP execute_sql arguments for batch N (stdout, UTF-8). */
import fs from 'node:fs'
import path from 'node:path'

const n = process.argv[2]
if (!n) {
  console.error('Usage: node scripts/mcp-call-batch.mjs <01-70>')
  process.exit(1)
}
const id = String(Number(n)).padStart(2, '0')
const file = path.join(import.meta.dirname, '..', 'output/mcp-temp', `args_${id}.json`)
const args = JSON.parse(fs.readFileSync(file, 'utf8'))
process.stdout.write(JSON.stringify(args))
