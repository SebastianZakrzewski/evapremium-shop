#!/usr/bin/env node
/**
 * Execute mat_templates batches via Supabase Management API (requires valid SUPABASE_PAT).
 * Processes batches in parallel groups of 5.
 * Usage: SUPABASE_PAT=sbp_... node scripts/mcp-exec-batches-mgmt.mjs [from] [to]
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const SQL_DIR = path.join(ROOT, 'output/mat-templates-seed-batches')
const RESULTS_PATH = path.join(ROOT, 'output/mcp-mat-batch-results.json')
const PROJECT_ID = 'kmepxyervpeujwvgdqtm'
const TOKEN = process.env.SUPABASE_PAT
const FROM = Number(process.argv[2] ?? 1)
const TO = Number(process.argv[3] ?? 70)
const CONCURRENCY = 5

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
  if (!res.ok) throw new Error(`${res.status} ${text.slice(0, 500)}`)
  return text
}

const runBatch = async (n) => {
  const id = String(n).padStart(2, '0')
  const batch = `batch_${id}.sql`
  const query = fs.readFileSync(path.join(SQL_DIR, batch), 'utf8')
  try {
    await executeSql(query)
    console.log(`OK ${batch}`)
    return { batch, success: true }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    console.error(`FAIL ${batch}: ${error.slice(0, 300)}`)
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

const loadResults = () => {
  if (!fs.existsSync(RESULTS_PATH)) {
    return { projectId: PROJECT_ID, results: [] }
  }
  return JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'))
}

const saveResults = (results, finalCount) => {
  const output = {
    projectId: PROJECT_ID,
    results: results.map(({ batch, success, error }) =>
      error && !success ? { batch, success, error } : { batch, success },
    ),
    finalCount,
    executedAt: new Date().toISOString(),
  }
  fs.writeFileSync(RESULTS_PATH, JSON.stringify(output, null, 2))
  return output
}

const main = async () => {
  if (!TOKEN?.startsWith('sbp_')) {
    console.error('Set SUPABASE_PAT=sbp_... (valid personal access token)')
    process.exit(1)
  }

  const existing = loadResults()
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

  saveResults(results, finalCount)
  const succeeded = results.filter((r) => r.success).length
  console.log(`Succeeded: ${succeeded}/70`)
  process.exit(results.some((r) => !r.success) ? 1 : 0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
