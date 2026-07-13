#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const id = String(process.argv[2] ?? '1').padStart(2, '0')
const payloadPath = path.join(ROOT, 'output', 'mcp-current', `payload_${id}.json`)
const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf8'))
const outPath = path.join(ROOT, 'output', 'mcp-temp', `mcp_args_${id}.json`)
fs.writeFileSync(
  outPath,
  JSON.stringify({
    project_id: payload.project_id,
    query: payload.query,
    batch: payload.batch ?? `batch_${id}.sql`,
  }),
)
console.log(outPath)
