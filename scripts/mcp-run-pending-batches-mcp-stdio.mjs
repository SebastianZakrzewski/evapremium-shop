#!/usr/bin/env node
/**
 * Execute pending mat_templates batches via Supabase MCP execute_sql (stdio).
 * Requires: npm install zod @supabase/mcp-server-supabase @modelcontextprotocol/sdk
 * Auth: SUPABASE_ACCESS_TOKEN=sbp_... OR Cursor-linked OAuth when run inside Cursor.
 */
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

const ROOT = path.resolve(import.meta.dirname, '..')
const DIR = path.join(ROOT, 'output/mcp-current')
const RESULTS_PATH = path.join(ROOT, 'output/mcp-mat-batch-results.json')
const PROJECT_ID = 'kmepxyervpeujwvgdqtm'
const START = Number(process.argv[2] ?? 5)
const END = Number(process.argv[3] ?? 69)
const CONCURRENCY = Number(process.argv[4] ?? 3)
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN ?? process.env.SUPABASE_PAT

const pad = (n) => String(n).padStart(2, '0')

const record = (batch, status, error) => {
  const args = ['scripts/mcp-mat-batch-record.mjs', 'record', batch, status]
  if (error) args.push(error.slice(0, 500))
  spawnSync('node', args, { cwd: ROOT, stdio: 'pipe', shell: true })
}

const isDone = (n) => {
  if (!fs.existsSync(RESULTS_PATH)) return false
  const data = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'))
  return data.results.some((r) => r.batch === `batch_${pad(n)}.sql` && r.success)
}

const loadQuery = (n) =>
  JSON.parse(fs.readFileSync(path.join(DIR, `CALL_MCP_${pad(n)}.args.json`), 'utf8')).query

const createClient = async () => {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [
      path.join(ROOT, 'node_modules/@supabase/mcp-server-supabase/dist/transports/stdio.js'),
    ],
    env: { ...process.env, ...(TOKEN ? { SUPABASE_ACCESS_TOKEN: TOKEN } : {}) },
  })
  const client = new Client({ name: 'mat-batch-mcp', version: '1.0.0' }, { capabilities: {} })
  await client.connect(transport)
  return client
}

const runBatch = async (client, n) => {
  const batch = `batch_${pad(n)}.sql`
  try {
    const result = await client.callTool({
      name: 'execute_sql',
      arguments: { project_id: PROJECT_ID, query: loadQuery(n) },
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
    console.error(`FAIL ${batch}: ${error.slice(0, 200)}`)
    return { batch, ok: false, error }
  }
}

const main = async () => {
  const pending = []
  for (let n = START; n <= END; n++) {
    if (!isDone(n)) pending.push(n)
  }
  console.log(`Pending: ${pending.length}`)
  if (!pending.length) return

  let client
  try {
    client = await createClient()
  } catch (err) {
    console.error('MCP connect failed:', err.message)
    console.error('Use CallMcpTool execute_sql manually or set SUPABASE_ACCESS_TOKEN=sbp_...')
    process.exit(1)
  }

  const results = []
  let i = 0
  const workers = Array.from({ length: Math.min(CONCURRENCY, pending.length) }, async () => {
    while (i < pending.length) {
      const n = pending[i++]
      results.push(await runBatch(client, n))
    }
  })
  await Promise.all(workers)
  await client.close()

  const ok = results.filter((r) => r.ok).length
  const fail = results.filter((r) => !r.ok).length
  console.log(JSON.stringify({ ok, fail }))
  process.exit(fail ? 1 : 0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
