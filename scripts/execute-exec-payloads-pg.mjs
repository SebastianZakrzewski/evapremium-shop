#!/usr/bin/env node
/**
 * Execute mat_templates seed batches via direct Postgres (same SQL as MCP execute_sql).
 * Reads output/mcp-current/exec_payload_XX.json and records per-batch results.
 */
import fs from 'node:fs'
import path from 'node:path'
import pg from 'pg'
import dotenv from 'dotenv'
import { spawnSync } from 'node:child_process'

const ROOT = path.resolve(import.meta.dirname, '..')
dotenv.config({ path: path.join(ROOT, '.env.local') })
dotenv.config({ path: path.join(ROOT, '.env') })

const PAYLOAD_DIR = path.join(ROOT, 'output', 'mcp-current')
const FROM = Number(process.argv[2] ?? 1)
const TO = Number(process.argv[3] ?? 70)
const CONCURRENCY = Number(process.argv[4] ?? 5)

const connectionString =
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  process.env.POSTGRES_URL

if (!connectionString) {
  console.error('Missing DATABASE_URL')
  process.exit(1)
}

const record = (batch, status, error) => {
  const args = ['scripts/mcp-mat-batch-record.mjs', 'record', batch, status]
  if (error) args.push(error.slice(0, 500))
  spawnSync('node', args, { cwd: ROOT, stdio: 'pipe', shell: true })
}

const loadPayload = (n) => {
  const id = String(n).padStart(2, '0')
  const file = path.join(PAYLOAD_DIR, `exec_payload_${id}.json`)
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

const runBatch = async (client, n) => {
  const id = String(n).padStart(2, '0')
  const batch = `batch_${id}.sql`
  try {
    const payload = loadPayload(n)
    await client.query(payload.query)
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
    const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } })
    await client.connect()
    try {
      while (idx < nums.length) {
        const n = nums[idx++]
        results.push(await runBatch(client, n))
      }
    } finally {
      await client.end()
    }
  })
  await Promise.all(workers)
  return results.sort((a, b) => a.batch.localeCompare(b.batch))
}

const main = async () => {
  const nums = Array.from({ length: TO - FROM + 1 }, (_, i) => FROM + i)
  const results = await runPool(nums)
  const succeeded = results.filter((r) => r.success).length
  const failed = results.filter((r) => !r.success)

  const countClient = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } })
  await countClient.connect()
  let finalCount = null
  try {
    const res = await countClient.query('SELECT COUNT(*)::int AS total FROM evapremium_shop.mat_templates;')
    finalCount = res.rows[0]?.total ?? null
    spawnSync('node', ['scripts/mcp-mat-batch-record.mjs', 'finalize', String(finalCount)], {
      cwd: ROOT,
      stdio: 'inherit',
      shell: true,
    })
    console.log(`Final count: ${finalCount}`)
  } finally {
    await countClient.end()
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
