#!/usr/bin/env node
/**
 * Execute mat_templates seed batches via Supabase Management API.
 * Usage: SUPABASE_PAT=sbp_... node scripts/mcp-run-all-invokes.mjs [from] [to]
 * Or:    set SUPABASE_PAT=sbp_... && node scripts/mcp-run-all-invokes.mjs
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const ARGS_DIR = path.join(ROOT, 'output/mcp-temp')
const RESULTS_PATH = path.join(ROOT, 'output/mcp-mat-batch-results.json')
const PROJECT_ID = 'kmepxyervpeujwvgdqtm'
const TOKEN = process.env.SUPABASE_PAT || process.env.SUPABASE_ACCESS_TOKEN
const FROM = Number(process.argv[2] ?? 3)
const TO = Number(process.argv[3] ?? 70)
const CONCURRENCY = 5

if (!TOKEN || !TOKEN.startsWith('sbp_')) {
  console.error('Valid SUPABASE_PAT (sbp_...) required. Create at https://supabase.com/dashboard/account/tokens')
  console.error('Usage: SUPABASE_PAT=sbp_xxx node scripts/mcp-run-all-invokes.mjs')
  process.exit(1)
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
  if (!res.ok) throw new Error(`${res.status} ${text}`)
  return text
}

const runBatch = async (n) => {
  const id = String(n).padStart(2, '0')
  const batch = `batch_${id}.sql`
  const file = path.join(ARGS_DIR, `args_${id}.json`)
  if (!fs.existsSync(file)) {
    return { batch, success: false, error: 'args file missing' }
  }
  const { query } = JSON.parse(fs.readFileSync(file, 'utf8'))
  try {
    await executeSql(query)
    console.log(`OK ${batch}`)
    return { batch, success: true }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    console.error(`FAIL ${batch}: ${error.slice(0, 200)}`)
    return { batch, success: false, error }
  }
}

const runPool = async (nums) => {
  const results = []
  let idx = 0
  const workers = Array.from({ length: Math.min(CONCURRENCY, nums.length) }, async () => {
    while (idx < nums.length) {
      const n = nums[idx++]
      results.push(await runBatch(n))
    }
  })
  await Promise.all(workers)
  return results.sort((a, b) => a.batch.localeCompare(b.batch))
}

const main = async () => {
  const existing = fs.existsSync(RESULTS_PATH)
    ? JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'))
    : { projectId: PROJECT_ID, results: [] }

  const done = new Set((existing.results ?? []).filter((r) => r.success).map((r) => r.batch))
  const nums = []
  for (let i = FROM; i <= TO; i++) {
    const batch = `batch_${String(i).padStart(2, '0')}.sql`
    if (!done.has(batch)) nums.push(i)
  }

  const batchResults = nums.length ? await runPool(nums) : []
  const byBatch = new Map((existing.results ?? []).map((r) => [r.batch, r]))
  for (const r of batchResults) byBatch.set(r.batch, r)

  const results = Array.from({ length: 70 }, (_, i) => {
    const batch = `batch_${String(i + 1).padStart(2, '0')}.sql`
    return byBatch.get(batch) ?? { batch, success: false, error: 'not executed' }
  })

  let finalCount = null
  try {
    const countRes = await executeSql('SELECT COUNT(*)::int AS total FROM evapremium_shop.mat_templates;')
    const parsed = JSON.parse(countRes)
    finalCount = parsed?.[0]?.total ?? null
    console.log(`Final count: ${finalCount}`)
  } catch (err) {
    console.error('Count failed:', err)
  }

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
  const failed = results.filter((r) => !r.success)
  console.log(`Succeeded: ${succeeded}/70`)
  process.exit(failed.length ? 1 : 0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
