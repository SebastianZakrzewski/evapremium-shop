#!/usr/bin/env node
/** Append batch result to mcp-batch-status.jsonl */
import fs from 'node:fs'
import path from 'node:path'

const [batch, status, ...errorParts] = process.argv.slice(2)
const file = path.join(import.meta.dirname, '..', 'output/mcp-temp/mcp-batch-status.jsonl')
const row = {
  batch,
  success: status === 'success',
  ...(status === 'failed' ? { error: errorParts.join(' ') } : {}),
  at: new Date().toISOString(),
}
fs.appendFileSync(file, JSON.stringify(row) + '\n')
console.log(`${batch}: ${status}`)
