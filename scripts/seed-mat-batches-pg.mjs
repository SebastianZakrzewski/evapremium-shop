#!/usr/bin/env node
/**
 * Execute all mat_templates seed batches using node pg + Supabase pooler.
 * Usage: DATABASE_URL="postgresql://..." node scripts/seed-mat-batches-pg.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import pg from 'pg'

const { Client } = pg
const ROOT = path.resolve(import.meta.dirname, '..')
const BATCH_DIR = path.join(ROOT, 'output', 'mat-templates-seed-batches')
const RESULTS_PATH = path.join(ROOT, 'output', 'mcp-mat-batch-results.json')

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('DATABASE_URL is required')
  process.exit(1)
}

const start = Number(process.argv[2] ?? 1)
const end = Number(process.argv[3] ?? 70)

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } })
await client.connect()

const results = {
  projectId: 'kmepxyervpeujwvgdqtm',
  executedAt: new Date().toISOString(),
  method: 'pg',
  results: [],
  succeeded: 0,
  failed: 0,
  finalCount: null,
}

for (let i = start; i <= end; i++) {
  const id = String(i).padStart(2, '0')
  const batch = `batch_${id}.sql`
  const sql = fs.readFileSync(path.join(BATCH_DIR, batch), 'utf8')
  try {
    await client.query(sql)
    results.results.push({ batch, success: true })
    results.succeeded++
    console.log(`OK ${batch}`)
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    results.results.push({ batch, success: false, error })
    results.failed++
    console.error(`FAIL ${batch}: ${error}`)
  }
}

try {
  const { rows } = await client.query('SELECT COUNT(*)::int AS total FROM evapremium_shop.mat_templates')
  results.finalCount = rows[0]?.total ?? null
  console.log(`Final count: ${results.finalCount}`)
} catch (err) {
  console.error('Count failed:', err)
}

await client.end()
fs.writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2))
process.exit(results.failed > 0 ? 1 : 0)
