#!/usr/bin/env node
/**
 * Execute all pending mat_templates seed batches via Supabase MCP stdio.
 * Requires SUPABASE_ACCESS_TOKEN (Personal Access Token from supabase.com/dashboard/account/tokens).
 *
 * Usage:
 *   set SUPABASE_ACCESS_TOKEN=sbp_...
 *   node scripts/mcp-execute-all-batches.mjs [from] [to] [concurrency]
 */
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

const ROOT = path.resolve(import.meta.dirname, '..')
const DIR = path.join(ROOT, 'output/mcp-current')
const PROJECT_ID = 'kmepxyervpeujwvgdqtm'
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN
const FROM = Number(process.argv[2] ?? 1)
const TO = Number(process.argv[3] ?? 70)
const CONCURRENCY = Number(process.argv[4] ?? 3)

if (!TOKEN) {
  console.error('SUPABASE_ACCESS_TOKEN is required')
  console.error('Create at https://supabase.com/dashboard/account/tokens')
  process.exit(1)
}

const record = (batch, status, error) => {
  const args = ['scripts/mcp-mat-batch-record.mjs', 'record', batch, status]
  if (error) args.push(error.slice(0, 500))
  spawnSync('node', args, { cwd: ROOT, stdio: 'pipe', shell: true })
}

const loadPayload = (n) => {
  const id = String(n).padStart(2, '0')
  const file = path.join(DIR, `exec_payload_${id}.json`)
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

const transport = new StdioClientTransport({
  command: 'npx',
  args: ['-y', '@supabase/mcp-server-supabase@latest'],
  env: { ...process.env, SUPABASE_ACCESS_TOKEN: TOKEN },
})

const client = new Client({ name: 'mat-batch-all', version: '1.0.0' }, { capabilities: {} })

const executeSql = async (query) => {
  const result = await client.callTool({
    name: 'execute_sql',
    arguments: { project_id: PROJECT_ID, query },
  })
  if (result.isError) {
    const text = result.content?.map((c) => c.text).join('\n') ?? 'MCP error'
    throw new Error(text)
  }
}

const runBatch = async (n) => {
  const id = String(n).padStart(2, '0')
  const batch = `batch_${id}.sql`
  try {
    const payload = loadPayload(n)
    await executeSql(payload.query)
    record(batch, 'success')
    console.log(`OK ${batch}`)
    return { batch, success: true }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    record(batch, 'failed', error)
    console.error(`FAIL ${batch}: ${error}`)
    return { batch, success: false, error }
  }
}

const runPool = async (nums) => {
  const results = []
  let idx = 0
  const workers = Array.from({ length: Math.min(CONCURRENCY, nums.length) }, async () => {
    while (idx < nums.length) {
      const n = nums[idx++]
      results.push(await runBatch(n))
    }
  })
  await Promise.all(workers)
  return results
}

const main = async () => {
  await client.connect(transport)
  const nums = Array.from({ length: TO - FROM + 1 }, (_, i) => FROM + i)
  const results = await runPool(nums)

  let finalCount = null
  try {
    const countResult = await client.callTool({
      name: 'execute_sql',
      arguments: {
        project_id: PROJECT_ID,
        query: 'SELECT COUNT(*)::int AS total FROM evapremium_shop.mat_templates;',
      },
    })
    const text = countResult.content?.map((c) => c.text).join('\n') ?? ''
    const match = text.match(/"total"\s*:\s*(\d+)/)
    finalCount = match ? Number(match[1]) : null
    spawnSync('node', ['scripts/mcp-mat-batch-record.mjs', 'finalize', String(finalCount)], {
      cwd: ROOT,
      stdio: 'inherit',
      shell: true,
    })
  } catch (err) {
    console.error('Count failed:', err)
  }

  await client.close()
  const succeeded = results.filter((r) => r.success).length
  const failed = results.filter((r) => !r.success)
  console.log(JSON.stringify({ succeeded, failed: failed.length, finalCount, failedBatches: failed }, null, 2))
  process.exit(failed.length ? 1 : 0)
}

main().catch(async (err) => {
  console.error(err)
  try {
    await client.close()
  } catch {}
  process.exit(1)
})
