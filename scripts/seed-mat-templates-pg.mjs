#!/usr/bin/env node
/**
 * Execute all mat_templates seed batches via direct Postgres (pooler + service role).
 * Usage: node scripts/seed-mat-templates-pg.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import pg from 'pg'

const ROOT = path.resolve(import.meta.dirname, '..')
const INVOKE_DIR = path.join(ROOT, 'output/mcp-temp/invokes')
const RESULTS_PATH = path.join(ROOT, 'output/mcp-mat-batch-results.json')
const PROJECT_ID = 'kmepxyervpeujwvgdqtm'
const CONCURRENCY = 5

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

const runBatch = async (client, n) => {
  const id = String(n).padStart(2, '0')
  const batch = `batch_${id}.sql`
  const { query } = JSON.parse(fs.readFileSync(path.join(INVOKE_DIR, `invoke_${id}.json`), 'utf8'))
  try {
    await client.query(query)
    console.log(`OK ${batch}`)
    return { batch, success: true }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    console.error(`FAIL ${batch}: ${error.slice(0, 300)}`)
    return { batch, success: false, error }
  }
}

const runSequential = async (client, nums) => {
  const results = []
  for (const n of nums) results.push(await runBatch(client, n))
  return results
}

const main = async () => {
  const existing = fs.existsSync(RESULTS_PATH)
    ? JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'))
    : { results: [] }
  const done = new Set((existing.results ?? []).filter((r) => r.success).map((r) => r.batch))
  const nums = []
  for (let i = 1; i <= 70; i++) {
    const batch = `batch_${String(i).padStart(2, '0')}.sql`
    if (!done.has(batch)) nums.push(i)
  }

  const client = await connect()
  const batchResults = nums.length ? await runSequential(client, nums) : []

  let finalCount = null
  try {
    const res = await client.query('SELECT COUNT(*)::int AS total FROM evapremium_shop.mat_templates;')
    finalCount = res.rows[0]?.total ?? null
    console.log(`Final count: ${finalCount}`)
  } catch (err) {
    console.error('Count failed:', err)
  }
  await client.end()

  const byBatch = new Map((existing.results ?? []).map((r) => [r.batch, r]))
  for (const r of batchResults) byBatch.set(r.batch, r)
  const results = Array.from({ length: 70 }, (_, i) => {
    const batch = `batch_${String(i + 1).padStart(2, '0')}.sql`
    return byBatch.get(batch) ?? { batch, success: false, error: 'not executed' }
  })

  const output = {
    projectId: PROJECT_ID,
    results: results.map(({ batch, success, error }) =>
      error && !success ? { batch, success, error } : { batch, success },
    ),
    finalCount,
    executedAt: new Date().toISOString(),
  }
  fs.writeFileSync(RESULTS_PATH, JSON.stringify(output, null, 2))
  const succeeded = results.filter((r) => r.success).length
  console.log(`Succeeded: ${succeeded}/70`)
  process.exit(results.some((r) => !r.success) ? 1 : 0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
