#!/usr/bin/env node
/**
 * Execute all mat_templates seed batches via Supabase MCP HTTP endpoint.
 * Requires Cursor-authenticated session — run from agent with CallMcpTool fallback.
 * This script reads invoke files and prints batch index for agent MCP loop.
 */
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const ROOT = path.resolve(import.meta.dirname, '..')
const INVOKE_DIR = path.join(ROOT, 'output/mcp-current')
const FROM = Number(process.argv[2] ?? 1)
const TO = Number(process.argv[3] ?? 70)

const record = (batch, status, error) => {
  const args = ['scripts/mcp-mat-batch-record.mjs', 'record', batch, status]
  if (error) args.push(error.slice(0, 500))
  spawnSync('node', args, { cwd: ROOT, stdio: 'pipe', shell: true })
}

const loadInvoke = (n) => {
  const id = String(n).padStart(2, '0')
  const file = path.join(INVOKE_DIR, `_mcp_invoke_${id}.json`)
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

// Print invoke paths for agent MCP execution
for (let i = FROM; i <= TO; i++) {
  const id = String(i).padStart(2, '0')
  const batch = `batch_${id}.sql`
  const invoke = path.join(INVOKE_DIR, `_mcp_invoke_${id}.json`)
  const payload = loadInvoke(i)
  console.log(JSON.stringify({ n: i, batch, invoke, project_id: payload.project_id, queryLen: payload.query.length }))
}
