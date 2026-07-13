#!/usr/bin/env node
/**
 * Execute all mat_templates seed batches via Supabase Management API.
 * Requires SUPABASE_ACCESS_TOKEN in environment (Personal Access Token from supabase.com/dashboard/account/tokens).
 *
 * Usage: SUPABASE_ACCESS_TOKEN=sbp_... node scripts/run-all-mat-batches-mgmt-api.mjs [start] [end]
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const PAYLOAD_DIR = path.join(ROOT, 'output', 'mcp-current')
const RESULTS_PATH = path.join(ROOT, 'output', 'mcp-mat-batch-results.json')
const PROJECT_ID = 'kmepxyervpeujwvgdqtm'
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN

const start = Number(process.argv[2] ?? 1)
const end = Number(process.argv[3] ?? 70)

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
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${text}`)
  }
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

const getCount = async () => {
  const rows = await executeSql('SELECT COUNT(*)::int AS total FROM evapremium_shop.mat_templates;')
  return rows?.[0]?.total ?? null
}

const main = async () => {
  if (!TOKEN) {
    console.error('SUPABASE_ACCESS_TOKEN is required')
    process.exit(1)
  }

  const results = []
  let succeeded = 0
  let failed = 0

  for (let i = start; i <= end; i++) {
    const id = String(i).padStart(2, '0')
    const payloadPath = path.join(PAYLOAD_DIR, `payload_${id}.json`)
    const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf8'))
    const batch = payload.batch ?? `batch_${id}.sql`
    try {
      await executeSql(payload.query)
      results.push({ batch, success: true })
      succeeded++
      console.log(`OK ${batch}`)
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err)
      results.push({ batch, success: false, error })
      failed++
      console.error(`FAIL ${batch}: ${error}`)
    }
  }

  let finalCount = null
  try {
    finalCount = await getCount()
    console.log(`Final count: ${finalCount}`)
  } catch (err) {
    console.error('Count query failed:', err instanceof Error ? err.message : err)
  }

  const output = {
    projectId: PROJECT_ID,
    executedAt: new Date().toISOString(),
    results,
    finalCount,
  }
  fs.writeFileSync(RESULTS_PATH, JSON.stringify(output, null, 2))
  console.log(`Results written to ${RESULTS_PATH}`)
  console.log(`Succeeded: ${succeeded}, Failed: ${failed}, Final count: ${finalCount}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
