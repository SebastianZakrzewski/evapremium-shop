#!/usr/bin/env node
/**
 * Seed evapremium_shop.mat_templates via direct Postgres (no MCP).
 *
 * Prerequisites:
 *   1. node scripts/configure-database-url.mjs  (with SUPABASE_DB_PASSWORD)
 *   2. node scripts/seed-evapremium-shop-mat-templates.mjs
 *
 * Usage:
 *   node scripts/run-mat-templates-seed-pg.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import pg from 'pg'

const ROOT = path.resolve(import.meta.dirname, '..')
const BATCH_DIR = path.join(ROOT, 'output', 'mat-templates-seed-batches')
const RESULTS_PATH = path.join(ROOT, 'output', 'mat-templates-seed-results.json')
const ENV_PATH = path.join(ROOT, '.env')

const loadEnvFile = () => {
  if (!fs.existsSync(ENV_PATH)) return
  for (const line of fs.readFileSync(ENV_PATH, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue
    const index = trimmed.indexOf('=')
    const key = trimmed.slice(0, index).trim()
    const value = trimmed.slice(index + 1).trim()
    if (!process.env[key]) process.env[key] = value
  }
}

const isPlaceholderUrl = (value) =>
  !value ||
  value.includes('username:password') ||
  value.includes('localhost:5432/eva_website_db')

const resolveConnectionString = () => {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.SUPABASE_DB_URL,
    process.env.POSTGRES_URL,
  ].filter((value) => value && !isPlaceholderUrl(value))

  if (!candidates.length) {
    throw new Error(
      'Missing DATABASE_URL. Run: SUPABASE_DB_PASSWORD="..." node scripts/configure-database-url.mjs',
    )
  }

  return candidates[0]
}

const main = async () => {
  loadEnvFile()
  const connectionString = resolveConnectionString()

  const files = fs
    .readdirSync(BATCH_DIR)
    .filter((file) => /^batch_\d+\.sql$/.test(file))
    .sort()

  if (!files.length) {
    console.error('No seed batches found. Run seed-evapremium-shop-mat-templates.mjs first.')
    process.exit(1)
  }

  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  })

  await client.connect()
  console.log('Connected to Postgres')

  const results = {
    method: 'pg',
    executed_at: new Date().toISOString(),
    results: [],
    succeeded: 0,
    failed: 0,
    final_count: null,
  }

  for (const file of files) {
    const sql = fs.readFileSync(path.join(BATCH_DIR, file), 'utf8')
    try {
      await client.query(sql)
      results.results.push({ batch: file, success: true })
      results.succeeded += 1
      console.log(`OK ${file}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      results.results.push({ batch: file, success: false, error: message })
      results.failed += 1
      console.error(`FAIL ${file}: ${message}`)
    }
  }

  try {
    const { rows } = await client.query(
      'SELECT COUNT(*)::int AS total FROM evapremium_shop.mat_templates',
    )
    results.final_count = rows[0]?.total ?? null
    console.log(`Final count: ${results.final_count}`)
  } catch (error) {
    console.error('Count failed:', error)
  }

  await client.end()
  fs.writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2), 'utf8')
  process.exit(results.failed > 0 ? 1 : 0)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
