#!/usr/bin/env node
/**
 * Execute all mat_templates batches via Supabase Management API (parallel groups of 5).
 * Requires: SUPABASE_PAT=sbp_... (valid personal access token)
 * Usage: SUPABASE_PAT=sbp_xxx node scripts/mcp-run-all-batches-mgmt.mjs
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const MCP_DIR = path.join(ROOT, 'output/mcp-current')
const RESULTS_PATH = path.join(ROOT, 'output/mcp-mat-batch-results.json')
const PROJECT_ID = 'kmepxyervpeujwvgdqtm'
const TOKEN = process.env.SUPABASE_PAT ?? process.env.SUPABASE_ACCESS_TOKEN
const CONCURRENCY = 5

if (!TOKEN?.startsWith('sbp_')) {
  console.error('Set SUPABASE_PAT=sbp_... from https://supabase.com/dashboard/account/tokens')
  process.exit(1)
}

const executeSql = async (query) => {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_ID}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`${res.status} ${text.slice(0, 500)}`)
  return text
}

const runBatch = async (n) => {
  const id = String(n).padStart(2, '0')
  const batch = `batch_${id}.sql`
  const file = path.join(MCP_DIR, `CALL_MCP_${id}.args.json`)
  const invoke = JSON.parse(fs.readFileSync(file, 'utf8'))
  try {
    await executeSql(invoke.query)
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
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, nums.length) }, async () => {
      while (idx < nums.length) {
        const n = nums[idx++]
        results.push(await runBatch(n))
      }
    }),
  )
  return results.sort((a, b) => a.batch.localeCompare(b.batch))
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

  console.log(`Executing ${nums.length} batches (concurrency ${CONCURRENCY})...`)
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
    finalCount = JSON.parse(countRes)?.[0]?.total ?? null
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
  console.log(`Succeeded: ${succeeded}/70`)
  process.exit(results.some((r) => !r.success) ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
