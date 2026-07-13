#!/usr/bin/env node
/**
 * Execute all mat_templates seed batches via Supabase MCP execute_sql.
 * Reads exec_payload_XX.json files and records per-batch results.
 * Designed for agent workflow: prints JSON lines for each batch result.
 */
import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'

const ROOT = path.resolve(import.meta.dirname, '..')
const PAYLOAD_DIR = path.join(ROOT, 'output', 'mcp-current')
const PROJECT_ID = 'kmepxyervpeujwvgdqtm'
const FROM = Number(process.argv[2] ?? 1)
const TO = Number(process.argv[3] ?? 70)

const loadPayload = (n) => {
  const id = String(n).padStart(2, '0')
  const file = path.join(PAYLOAD_DIR, `exec_payload_${id}.json`)
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

const record = (batch, status, error) => {
  const args = ['scripts/mcp-mat-batch-record.mjs', 'record', batch, status]
  if (error) args.push(error)
  spawn('node', args, { cwd: ROOT, stdio: 'inherit', shell: true })
}

for (let i = FROM; i <= TO; i++) {
  const id = String(i).padStart(2, '0')
  const batch = `batch_${id}.sql`
  const payload = loadPayload(i)
  const outFile = path.join(PAYLOAD_DIR, `_mcp_invoke_${id}.json`)
  fs.writeFileSync(outFile, JSON.stringify({ project_id: payload.project_id, query: payload.query }))
  console.log(JSON.stringify({ n: i, batch, invokeFile: outFile, queryLen: payload.query.length }))
}
