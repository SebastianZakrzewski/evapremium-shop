#!/usr/bin/env node
/**
 * Execute all mat_templates seed batches via Supabase Management API.
 * Reads output/mcp-current/exec_payload_XX.json (or _mcp_invoke_XX.json).
 * Records per-batch results via mcp-mat-batch-record.mjs.
 */
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import dotenv from 'dotenv'

const ROOT = path.resolve(import.meta.dirname, '..')
dotenv.config({ path: path.join(ROOT, '.env.local') })
dotenv.config({ path: path.join(ROOT, '.env') })

const PAYLOAD_DIR = path.join(ROOT, 'output', 'mcp-current')
const PROJECT_ID = 'kmepxyervpeujwvgdqtm'
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN
const FROM = Number(process.argv[2] ?? 1)
const TO = Number(process.argv[3] ?? 70)
const CONCURRENCY = Number(process.argv[4] ?? 5)

const record = (batch, status, error) => {
  const args = ['scripts/mcp-mat-batch-record.mjs', 'record', batch, status]
  if (error) args.push(error.slice(0, 500))
  spawnSync('node', args, { cwd: ROOT, stdio: 'inherit', shell: true })
}

const loadPayload = (n) => {
  const id = String(n).padStart(2, '0')
  const invoke = path.join(PAYLOAD_DIR, `_mcp_invoke_${id}.json`)
  const exec = path.join(PAYLOAD_DIR, `exec_payload_${id}.json`)
  const file = fs.existsSync(invoke) ? invoke : exec
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

const executeSql = async (query) => {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_ID}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`${res.status} ${text}`)
  return text
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
  return results.sort((a, b) => a.batch.localeCompare(b.batch))
}

const main = async () => {
  if (!TOKEN) {
    console.error('SUPABASE_ACCESS_TOKEN not set — use MCP execute_sql or set token in .env.local')
    process.exit(1)
  }

  const nums = Array.from({ length: TO - FROM + 1 }, (_, i) => FROM + i)
  const results = await runPool(nums)
  const succeeded = results.filter((r) => r.success).length
  const failed = results.filter((r) => !r.success)

  let finalCount = null
  try {
    const countRes = await executeSql('SELECT COUNT(*)::int AS total FROM evapremium_shop.mat_templates;')
    const parsed = JSON.parse(countRes)
    finalCount = parsed?.[0]?.total ?? null
    spawnSync('node', ['scripts/mcp-mat-batch-record.mjs', 'finalize', String(finalCount)], {
      cwd: ROOT,
      stdio: 'inherit',
      shell: true,
    })
    console.log(`Final count: ${finalCount}`)
  } catch (err) {
    console.error('Count query failed:', err)
  }

  console.log(`Succeeded: ${succeeded}/${results.length}`)
  if (failed.length) {
    console.log('Failed:')
    for (const f of failed) console.log(`  ${f.batch}: ${f.error}`)
  }
  process.exit(failed.length ? 1 : 0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
