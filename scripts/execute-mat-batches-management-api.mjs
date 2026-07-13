#!/usr/bin/env node
/**
 * Execute mat_templates seed batches via Supabase Management API.
 * Requires SUPABASE_ACCESS_TOKEN in environment.
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const BATCH_DIR = path.join(ROOT, 'output', 'mat-templates-seed-batches')
const RESULTS_PATH = path.join(ROOT, 'output', 'mcp-mat-batch-results.json')
const PROJECT_ID = 'kmepxyervpeujwvgdqtm'
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN

if (!TOKEN) {
  console.error('SUPABASE_ACCESS_TOKEN is required')
  process.exit(1)
}

const start = Number(process.argv[2] ?? 1)
const end = Number(process.argv[3] ?? 70)

const results = {
  projectId: PROJECT_ID,
  executedAt: new Date().toISOString(),
  totalBatches: end - start + 1,
  succeeded: 0,
  failed: 0,
  results: [],
  finalCount: null,
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
  if (!res.ok) {
    throw new Error(`${res.status} ${text}`)
  }
  return text
}

for (let i = start; i <= end; i++) {
  const id = String(i).padStart(2, '0')
  const batch = `batch_${id}.sql`
  const sqlPath = path.join(BATCH_DIR, batch)
  const query = fs.readFileSync(sqlPath, 'utf8')
  try {
    await executeSql(query)
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
  const countRes = await executeSql('SELECT COUNT(*)::int AS total FROM evapremium_shop.mat_templates;')
  const parsed = JSON.parse(countRes)
  results.finalCount = parsed?.[0]?.total ?? null
  console.log(`Final count: ${results.finalCount}`)
} catch (err) {
  console.error('Count query failed:', err)
}

fs.writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2))
console.log(`Results written to ${RESULTS_PATH}`)
process.exit(results.failed > 0 ? 1 : 0)
