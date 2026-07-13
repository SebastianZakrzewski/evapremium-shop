#!/usr/bin/env node
/**
 * Execute mat_templates seed batches via Supabase MCP stdio.
 * Requires SUPABASE_ACCESS_TOKEN=sbp_... OR works when Cursor MCP OAuth is available.
 *
 * Usage:
 *   node scripts/mcp-run-batches-stdio.mjs 05 06 07
 *   node scripts/mcp-run-batches-stdio.mjs --range 05 69
 *   node scripts/mcp-run-batches-stdio.mjs --pending
 */
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const ROOT = path.resolve(import.meta.dirname, '..')
const DIR = path.join(ROOT, 'output/mcp-current')
const RESULTS_PATH = path.join(ROOT, 'output/mcp-mat-batch-results.json')
const PROJECT_ID = 'kmepxyervpeujwvgdqtm'
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN ?? process.env.SUPABASE_PAT

const pad = (n) => String(n).padStart(2, '0')

const loadPayload = (n) => {
  const file = path.join(DIR, `CALL_MCP_${pad(n)}.args.json`)
  if (!fs.existsSync(file)) throw new Error(`Missing ${file}`)
  const payload = JSON.parse(fs.readFileSync(file, 'utf8'))
  return {
    project_id: payload.project_id ?? PROJECT_ID,
    query: payload.query,
    batch: `batch_${pad(n)}.sql`,
  }
}

const record = (batch, status, error) => {
  const args = ['scripts/mcp-mat-batch-record.mjs', 'record', batch, status]
  if (error) args.push(error.slice(0, 500))
  spawnSync('node', args, { cwd: ROOT, stdio: 'inherit', shell: true })
}

const isPending = (n) => {
  if (!fs.existsSync(RESULTS_PATH)) return true
  const data = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'))
  const entry = data.results.find((r) => r.batch === `batch_${pad(n)}.sql`)
  return !entry?.success
}

const runOne = async (n, Client, StdioClientTransport) => {
  const { project_id, query, batch } = loadPayload(n)
  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['-y', '@supabase/mcp-server-supabase@latest'],
    env: { ...process.env, ...(TOKEN ? { SUPABASE_ACCESS_TOKEN: TOKEN } : {}) },
  })
  const client = new Client({ name: 'mat-batch-runner', version: '1.0.0' }, { capabilities: {} })
  try {
    await client.connect(transport)
    const result = await client.callTool({
      name: 'execute_sql',
      arguments: { project_id, query },
    })
    if (result.isError) {
      const text = result.content?.map((c) => c.text).join('\n') ?? 'MCP error'
      throw new Error(text)
    }
    record(batch, 'success')
    console.log(`OK ${batch}`)
    return { batch, ok: true }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    record(batch, 'failed', error)
    console.error(`FAIL ${batch}: ${error}`)
    return { batch, ok: false, error }
  } finally {
    try {
      await client.close()
    } catch {}
  }
}

const parseArgs = () => {
  const args = process.argv.slice(2)
  if (args[0] === '--pending') {
    const nums = []
    for (let i = 5; i <= 69; i++) {
      if (isPending(i)) nums.push(pad(i))
    }
    return nums
  }
  if (args[0] === '--range') {
    const start = Number(args[1])
    const end = Number(args[2])
    const nums = []
    for (let i = start; i <= end; i++) nums.push(pad(i))
    return nums
  }
  return args.map((a) => pad(Number(a)))
}

const main = async () => {
  const nums = parseArgs()
  if (!nums.length) {
    console.error('No batches to run')
    process.exit(1)
  }

  let Client
  let StdioClientTransport
  try {
    ;({ Client } = await import('@modelcontextprotocol/sdk/client/index.js'))
    ;({ StdioClientTransport } = await import('@modelcontextprotocol/sdk/client/stdio.js'))
  } catch {
    console.error('Install @modelcontextprotocol/sdk or use CallMcpTool execute_sql manually')
    process.exit(1)
  }

  const results = []
  for (const n of nums) {
    results.push(await runOne(n, Client, StdioClientTransport))
  }

  const ok = results.filter((r) => r.ok).length
  const fail = results.filter((r) => !r.ok).length
  console.log(JSON.stringify({ ok, fail, total: results.length }))
  process.exit(fail ? 1 : 0)
}

main()
