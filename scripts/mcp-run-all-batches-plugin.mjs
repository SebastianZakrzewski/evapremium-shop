#!/usr/bin/env node
/**
 * Execute pending mat_templates seed batches via Supabase Management API.
 * Reads output/mcp-current/_mcp_call_batch_XX.json (UTF-8 safe).
 *
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=sbp_... node scripts/mcp-run-all-batches-plugin.mjs [from] [to] [concurrency]
 */
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const ROOT = path.resolve(import.meta.dirname, '..')
const DIR = path.join(ROOT, 'output/mcp-current')
const PROJECT_ID = 'kmepxyervpeujwvgdqtm'
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN
const FROM = Number(process.argv[2] ?? 1)
const TO = Number(process.argv[3] ?? 70)
const CONCURRENCY = Number(process.argv[4] ?? 5)

if (!TOKEN?.startsWith('sbp_')) {
  console.error('SUPABASE_ACCESS_TOKEN must be a Personal Access Token (sbp_...)')
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
  const file = path.join(DIR, `_mcp_call_batch_${id}.json`)
  if (!fs.existsSync(file)) {
    throw new Error(`Missing ${file}`)
  }
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
  if (!res.ok) throw new Error(`${res.status} ${text.slice(0, 500)}`)
}

const runBatch = async (n) => {
  const id = String(n).padStart(2, '0')
  const batch = `batch_${id}.sql`
  try {
    const { query } = loadPayload(n)
    await executeSql(query)
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
  const worker = async () => {
    while (idx < nums.length) {
      const i = idx++
      results.push(await runBatch(nums[i]))
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()))
  return results
}

const nums = []
for (let i = FROM; i <= TO; i++) nums.push(i)

const results = await runPool(nums)
const ok = results.filter((r) => r.success).length
const fail = results.filter((r) => !r.success)
console.log(`\nDone: ${ok} succeeded, ${fail.length} failed`)
if (fail.length) process.exit(1)
