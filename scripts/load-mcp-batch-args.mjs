#!/usr/bin/env node
/**
 * Load MCP args for a batch number (stdout JSON).
 * Usage: node scripts/load-mcp-batch-args.mjs 01
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const id = String(process.argv[2] ?? '1').padStart(2, '0')
const file = path.join(ROOT, 'output', 'mcp-temp', `for_mcp_${id}.json`)
if (!fs.existsSync(file)) {
  const payload = JSON.parse(fs.readFileSync(path.join(ROOT, 'output', 'mcp-current', `payload_${id}.json`), 'utf8'))
  process.stdout.write(JSON.stringify({ project_id: payload.project_id, query: payload.query, batch: payload.batch }))
} else {
  process.stdout.write(fs.readFileSync(file, 'utf8'))
}
