#!/usr/bin/env node
/**
 * Seed evapremium_shop.mat_templates via Supabase REST API (service role).
 * Synchronizes all rows in bulk packages (mark inactive + upsert).
 *
 * Usage:
 *   node scripts/seed-mat-templates-rest.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

const ROOT = path.resolve(import.meta.dirname, '..')
const RESULTS_PATH = path.join(ROOT, 'output/mat-templates-seed-results.json')
const BATCH_SIZE = 500

const EXCLUDED_CATEGORY_KEYS = new Set([
  'unknown',
  'page',
  'strona',
  'corsa',
  'test_1',
])

dotenv.config({ path: path.join(ROOT, '.env.local') })
dotenv.config({ path: path.join(ROOT, '.env') })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
  process.exit(1)
}

const supabase = createClient(url, key, {
  auth: { persistSession: false },
})

const table = () => supabase.schema('evapremium_shop').from('mat_templates')

const mapRecord = (record, meta) => ({
  dealer_pricing_category: record.dealer_pricing_category,
  dealer_pricing_category_key: record.dealer_pricing_category_key,
  dealer_pricing_category_source: record.dealer_pricing_category_source,
  brand_name: record.brand_name,
  brand_key: record.brand_key,
  model_name: record.model_name,
  model_key: record.model_key,
  model_family_name: record.model_family_name,
  model_family_key: record.model_family_key,
  generation: record.generation.label,
  year_from: record.generation.year_from,
  year_to: record.generation.year_to,
  is_open_ended: record.generation.is_open_ended,
  body_type_1: record.body_types.body_type_1.label,
  body_type_2: record.body_types.body_type_2.label,
  body_type_3: record.body_types.body_type_3.label,
  body_type_1_key: record.body_types.body_type_1.key,
  body_type_2_key: record.body_types.body_type_2.key,
  body_type_3_key: record.body_types.body_type_3.key,
  body_type: record.body_type,
  body_type_key: record.body_type_key,
  body_type_variants: record.body_type_variants.map((item) => item.label).filter(Boolean),
  record_key: record.record_key,
  source_file: meta.source_file,
  source_sheet: meta.source_sheet,
  source_row_id: record.id,
  json_version: meta.version,
  is_active: true,
})

const main = async () => {
  const payload = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'src/data/evamats-templates.normalized.json'), 'utf8'),
  )

  const filteredRecords = payload.records
    .filter((record) => record.brand_name)
    .filter((record) => record.dealer_pricing_category)
    .filter((record) => record.dealer_pricing_category_key)
    .filter((record) => !EXCLUDED_CATEGORY_KEYS.has(record.dealer_pricing_category_key))

  const rows = filteredRecords.map((record) => mapRecord(record, payload.meta))
  const skippedNullCategory = payload.records.filter(
    (record) => record.brand_name && !record.dealer_pricing_category,
  ).length
  const skippedDuplicates = rows.length - new Set(rows.map((row) => row.record_key)).size

  if (skippedDuplicates > 0) {
    throw new Error(`Duplicate record_key values detected: ${skippedDuplicates}`)
  }

  console.log(
    `Prepared ${rows.length} rows (${skippedNullCategory} without category, ${skippedDuplicates} duplicates removed)`,
  )

  const { count: beforeCount, error: beforeCountError } = await table()
    .select('record_key', { count: 'exact', head: true })

  if (beforeCountError) {
    console.error('Count before failed:', beforeCountError.message)
    process.exit(1)
  }

  console.log(`Rows before sync: ${beforeCount ?? 0}`)

  const { error: deactivateError } = await table()
    .update({ is_active: false })
    .eq('is_active', true)

  if (deactivateError) {
    console.error('Deactivate failed:', deactivateError.message)
    process.exit(1)
  }

  console.log('Marked existing mat_templates rows inactive')

  const results = {
    method: 'supabase_rest_service_role',
    executed_at: new Date().toISOString(),
    rows_before: beforeCount ?? 0,
    rows_prepared: rows.length,
    skipped_null_category: skippedNullCategory,
    skipped_duplicates: skippedDuplicates,
    batches: [],
    inserted: 0,
    failed: 0,
    final_count: null,
  }

  for (let index = 0; index < rows.length; index += BATCH_SIZE) {
    const chunk = rows.slice(index, index + BATCH_SIZE)
    const batchLabel = `${index + 1}-${index + chunk.length}`

    const { error } = await table().upsert(chunk, {
      onConflict: 'record_key',
      ignoreDuplicates: false,
    })

    if (error) {
      results.failed += chunk.length
      results.batches.push({ batch: batchLabel, success: false, error: error.message })
      console.error(`FAIL ${batchLabel}: ${error.message}`)
    } else {
      results.inserted += chunk.length
      results.batches.push({ batch: batchLabel, success: true, rows: chunk.length })
      console.log(`OK ${batchLabel}`)
    }
  }

  const { count: finalCount, error: finalCountError } = await table()
    .select('record_key', { count: 'exact', head: true })

  if (finalCountError) {
    console.error('Count after failed:', finalCountError.message)
  } else {
    results.final_count = finalCount ?? null
    console.log(`Final count: ${finalCount}`)
  }

  fs.writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2), 'utf8')
  process.exit(results.failed > 0 ? 1 : 0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
