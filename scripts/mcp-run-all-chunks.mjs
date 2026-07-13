#!/usr/bin/env node
/**
 * Execute all mat_templates seed chunks via Supabase MCP execute_sql pattern.
 * This script prepares chunks and records results; actual SQL runs via MCP from agent.
 *
 * Usage:
 *   node scripts/mcp-run-all-chunks.mjs prepare   # write _mcp_args_chunk_XX.json for 01-23
 *   node scripts/mcp-run-all-chunks.mjs status    # show pending/succeeded chunks
 */
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const ROOT = path.resolve(import.meta.dirname, '..')
const DIR = path.join(ROOT, 'output/mcp-current')
const RESULTS = path.join(ROOT, 'output/mcp-mat-batch-results.json')

const prepare = () => {
  for (let i = 1; i <= 23; i++) {
    const id = String(i).padStart(2, '0')
    spawnSync('node', ['scripts/mcp-write-args.mjs', 'chunk', id], {
      cwd: ROOT,
      stdio: 'inherit',
      shell: true,
    })
  }
  console.log('Prepared _mcp_args_chunk_01..23.json')
}

const status = () => {
  const data = JSON.parse(fs.readFileSync(RESULTS, 'utf8'))
  const succeeded = new Set(
    data.results.filter((r) => r.success).map((r) => r.batch)
  )
  const pending = []
  for (let i = 1; i <= 70; i++) {
    const batch = `batch_${String(i).padStart(2, '0')}.sql`
    if (!succeeded.has(batch)) pending.push(batch)
  }
  console.log(JSON.stringify({ succeeded: succeeded.size, pending: pending.length, pendingBatches: pending }, null, 2))
}

const cmd = process.argv[2]
if (cmd === 'prepare') prepare()
else if (cmd === 'status') status()
else {
  console.log('Usage: node scripts/mcp-run-all-chunks.mjs <prepare|status>')
  process.exit(1)
}
