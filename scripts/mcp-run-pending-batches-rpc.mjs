#!/usr/bin/env node
/**
 * Execute pending mat_templates batches 05-69 via public.exec_mat_seed_sql RPC.
 * Requires one-time MCP setup of exec_mat_seed_sql function.
 */
import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { spawnSync } from 'node:child_process'

const ROOT = path.resolve(import.meta.dirname, '..')
dotenv.config({ path: path.join(ROOT, '.env') })

const DIR = path.join(ROOT, 'output/mcp-current')
const RESULTS_PATH = path.join(ROOT, 'output/mcp-mat-batch-results.json')
const START = 5
const END = 69
const CONCURRENCY = 5

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })
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

const fixNullCategories = (sql) =>
  sql.replace(/\(\s*NULL,\s*NULL,\s*NULL,/g, (match, offset, full) => {
    const slice = full.slice(offset, offset + 800)
    const body = slice.match(/false,\s*'([^']+)'/)?.[1]
    const bodyKey = slice.match(
      /'([^']+)',\s*NULL,\s*NULL,\s*'([^']+)',\s*NULL,\s*NULL,\s*'([^']+)'/,
    )?.[3]
    let cat = 'passenger_car'
    if (body === 'pickup' || bodyKey === 'pickup') cat = 'pickup'
    else if (body === 'excavator' || bodyKey === 'heavy_equipment') cat = 'excavator'
    else if (body === 'microvan' || bodyKey === 'minivan') cat = 'minivan'
    return `('${cat}', '${cat}', '${cat}',`
  })

const loadQuery = (n) => {
  const raw = JSON.parse(fs.readFileSync(path.join(DIR, `CALL_MCP_${pad(n)}.args.json`), 'utf8')).query
  const stripped = raw.replace(/^\s*BEGIN;\s*/i, '').replace(/\s*COMMIT;\s*$/i, '').trim()
  return fixNullCategories(stripped)
}

const runBatch = async (n) => {
  const batch = `batch_${pad(n)}.sql`
  const query = loadQuery(n)
  const { error } = await supabase.rpc('exec_mat_seed_sql', { q: query })
  if (error) {
    record(batch, 'failed', error.message)
    console.error(`FAIL ${batch}: ${error.message}`)
    return { batch, ok: false, error: error.message }
  }
  record(batch, 'success')
  console.log(`OK ${batch}`)
  return { batch, ok: true }
}

const main = async () => {
  const pending = []
  for (let n = START; n <= END; n++) {
    if (!isDone(n)) pending.push(n)
  }
  console.log(`Pending: ${pending.length}`)
  if (!pending.length) {
    console.log('Nothing to run')
    return
  }

  const results = []
  let i = 0
  const workers = Array.from({ length: Math.min(CONCURRENCY, pending.length) }, async () => {
    while (i < pending.length) {
      const n = pending[i++]
      results.push(await runBatch(n))
    }
  })
  await Promise.all(workers)

  const ok = results.filter((r) => r.ok).length
  const fail = results.filter((r) => !r.ok).length
  console.log(JSON.stringify({ ok, fail, total: results.length, note: 'Run MCP count + finalize after success' }))
  process.exit(fail ? 1 : 0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
