#!/usr/bin/env node
/**
 * Execute pending mat_templates seed batches 05-69 via Supabase REST (service role).
 * Uses same record data as SQL batches; ON CONFLICT via ignoreDuplicates.
 */
import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { spawnSync } from 'node:child_process'

const ROOT = path.resolve(import.meta.dirname, '..')
dotenv.config({ path: path.join(ROOT, '.env') })

const RESULTS_PATH = path.join(ROOT, 'output/mcp-mat-batch-results.json')
const SUMMARY_PATH = path.join(ROOT, 'output/mat-templates-seed-summary.json')
const STRUCTURED_PATH = path.join(ROOT, 'output/evamats-templates-structured.json')
const START = 5
const END = 69

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key, {
  db: { schema: 'evapremium_shop' },
  auth: { persistSession: false },
})

const record = (batch, status, error) => {
  const args = ['scripts/mcp-mat-batch-record.mjs', 'record', batch, status]
  if (error) args.push(error.slice(0, 500))
  spawnSync('node', args, { cwd: ROOT, stdio: 'inherit', shell: true })
}

const isDone = (n) => {
  if (!fs.existsSync(RESULTS_PATH)) return false
  const data = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'))
  return data.results.some(
    (r) => r.batch === `batch_${String(n).padStart(2, '0')}.sql` && r.success,
  )
}

const main = async () => {
  const summary = JSON.parse(fs.readFileSync(SUMMARY_PATH, 'utf8'))
  const structured = JSON.parse(fs.readFileSync(STRUCTURED_PATH, 'utf8'))
  const records = structured.records

  let offset = 0
  const batchSlices = summary.batch_files.map((b) => {
    const slice = records.slice(offset, offset + b.rows)
    offset += b.rows
    return { name: b.name, rows: slice }
  })

  const pending = batchSlices.filter((b) => {
    const num = Number(b.name.match(/batch_(\d+)/)[1])
    return num >= START && num <= END && !isDone(num)
  })

  console.log(`Pending REST batches: ${pending.length}`)

  for (const batch of pending) {
    const { error } = await supabase
      .from('mat_templates')
      .upsert(batch.rows, { onConflict: 'record_key', ignoreDuplicates: true })

    if (error) {
      record(batch.name, 'failed', error.message)
      console.error(`FAIL ${batch.name}: ${error.message}`)
    } else {
      record(batch.name, 'success')
      console.log(`OK ${batch.name} (${batch.rows.length} rows)`)
    }
  }

  const { count, error: countError } = await supabase
    .from('mat_templates')
    .select('*', { count: 'exact', head: true })

  if (countError) {
    console.error('Count failed:', countError.message)
    process.exit(1)
  }

  spawnSync('node', ['scripts/mcp-mat-batch-record.mjs', 'finalize', String(count)], {
    cwd: ROOT,
    stdio: 'inherit',
    shell: true,
  })
  console.log(`Final count: ${count}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
