#!/usr/bin/env node
/**
 * Execute pending mat_templates seed batches 05-69 via Postgres (service role pooler).
 * Same SQL as MCP execute_sql payloads in output/mcp-current/CALL_MCP_NN.args.json
 *
 * Usage: node scripts/mcp-run-pending-batches-pg.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import pg from 'pg'

const ROOT = path.resolve(import.meta.dirname, '..')
const DIR = path.join(ROOT, 'output/mcp-current')
const RESULTS_PATH = path.join(ROOT, 'output/mcp-mat-batch-results.json')
const PROJECT_ID = 'kmepxyervpeujwvgdqtm'
const CONCURRENCY = 5
const START = 5
const END = 69

const pad = (n) => String(n).padStart(2, '0')

const readServiceKey = () => {
  const envPath = path.join(ROOT, '.env')
  if (!fs.existsSync(envPath)) return null
  const match = fs.readFileSync(envPath, 'utf8').match(/^SUPABASE_SERVICE_ROLE_KEY=(.+)$/m)
  return match?.[1]?.trim() ?? null
}

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.startsWith('eyJ')
  ? process.env.SUPABASE_SERVICE_ROLE_KEY
  : readServiceKey()

if (!serviceKey?.startsWith('eyJ')) {
  console.error('SUPABASE_SERVICE_ROLE_KEY missing in .env')
  process.exit(1)
}

const record = (batch, status, error) => {
  const args = ['scripts/mcp-mat-batch-record.mjs', 'record', batch, status]
  if (error) args.push(error.slice(0, 500))
  spawnSync('node', args, { cwd: ROOT, stdio: 'inherit', shell: true })
}

const isDone = (n) => {
  if (!fs.existsSync(RESULTS_PATH)) return false
  const data = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'))
  return data.results.some((r) => r.batch === `batch_${pad(n)}.sql` && r.success)
}

const hosts = [
  `postgresql://postgres.${PROJECT_ID}:${encodeURIComponent(serviceKey)}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${PROJECT_ID}:${encodeURIComponent(serviceKey)}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`,
  `postgresql://postgres:${encodeURIComponent(serviceKey)}@db.${PROJECT_ID}.supabase.co:5432/postgres`,
  `postgresql://postgres.${PROJECT_ID}:${encodeURIComponent(serviceKey)}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`,
]

const connect = async () => {
  for (const connectionString of hosts) {
    const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } })
    try {
      await client.connect()
      console.log('Connected via', connectionString.replace(serviceKey, '***'))
      return client
    } catch (err) {
      await client.end().catch(() => {})
      console.error('Connect failed:', connectionString.split('@')[1], err.message)
    }
  }
  throw new Error('All Postgres connection attempts failed')
}

const loadQuery = (n) => {
  const file = path.join(DIR, `CALL_MCP_${pad(n)}.args.json`)
  const payload = JSON.parse(fs.readFileSync(file, 'utf8'))
  return payload.query
}

const runBatch = async (client, n) => {
  const batch = `batch_${pad(n)}.sql`
  try {
    await client.query(loadQuery(n))
    record(batch, 'success')
    console.log(`OK ${batch}`)
    return { batch, ok: true }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    record(batch, 'failed', error)
    console.error(`FAIL ${batch}: ${error.slice(0, 300)}`)
    return { batch, ok: false, error }
  }
}

const runPool = async (client, nums) => {
  const results = []
  let i = 0
  const workers = Array.from({ length: Math.min(CONCURRENCY, nums.length) }, async () => {
    while (i < nums.length) {
      const n = nums[i++]
      results.push(await runBatch(client, n))
    }
  })
  await Promise.all(workers)
  return results
}

const main = async () => {
  const pending = []
  for (let n = START; n <= END; n++) {
    if (!isDone(n)) pending.push(n)
  }
  console.log(`Pending batches: ${pending.length}`)

  if (!pending.length) {
    console.log('Nothing to run')
    process.exit(0)
  }

  const client = await connect()
  const results = await runPool(client, pending)

  let finalCount = null
  try {
    const res = await client.query('SELECT COUNT(*)::int AS total FROM evapremium_shop.mat_templates;')
    finalCount = res.rows[0]?.total ?? null
    console.log(`Final count: ${finalCount}`)
    spawnSync('node', ['scripts/mcp-mat-batch-record.mjs', 'finalize', String(finalCount)], {
      cwd: ROOT,
      stdio: 'inherit',
      shell: true,
    })
  } catch (err) {
    console.error('Count failed:', err)
  }
  await client.end()

  const ok = results.filter((r) => r.ok).length
  const fail = results.filter((r) => !r.ok).length
  console.log(JSON.stringify({ ok, fail, total: results.length, finalCount }))
  process.exit(fail ? 1 : 0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
