#!/usr/bin/env node
/**
 * Execute mat_templates seed batches from payload JSON files.
 * Reads output/mcp-current/payload_XX.json and records results.
 * Uses SUPABASE_ACCESS_TOKEN if set, otherwise prints instructions.
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const PAYLOAD_DIR = path.join(ROOT, 'output', 'mcp-current')
const RESULTS_PATH = path.join(ROOT, 'output', 'mcp-mat-batch-results.json')
const PROJECT_ID = 'kmepxyervpeujwvgdqtm'
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN
const CONCURRENCY = 5

const start = Number(process.argv[2] ?? 1)
const end = Number(process.argv[3] ?? 70)

const loadPayload = (n) => {
  const id = String(n).padStart(2, '0')
  const file = path.join(PAYLOAD_DIR, `payload_${id}.json`)
  const raw = fs.readFileSync(file, 'utf8')
  return JSON.parse(raw)
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

const runBatch = async (n) => {
  const payload = loadPayload(n)
  const batch = payload.batch ?? `batch_${String(n).padStart(2, '0')}.sql`
  try {
    await executeSql(payload.query)
    return { batch, success: true }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    return { batch, success: false, error }
  }
}

const runPool = async (nums) => {
  const out = []
  let idx = 0
  const workers = Array.from({ length: Math.min(CONCURRENCY, nums.length) }, async () => {
    while (idx < nums.length) {
      const current = nums[idx++]
      const result = await runBatch(current)
      out.push({ n: current, result })
      const status = result.success ? 'OK' : 'FAIL'
      console.log(`${status} ${result.batch}`)
    }
  })
  await Promise.all(workers)
  return out.sort((a, b) => a.n - b.n).map((x) => x.result)
}

const main = async () => {
  if (!TOKEN) {
    console.error('SUPABASE_ACCESS_TOKEN is required for direct API execution')
    process.exit(1)
  }

  const existing = fs.existsSync(RESULTS_PATH)
    ? JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'))
    : { projectId: PROJECT_ID, results: [] }

  const done = new Set((existing.results ?? []).filter((r) => r.success).map((r) => r.batch))
  const nums = []
  for (let i = start; i <= end; i++) {
    const batch = `batch_${String(i).padStart(2, '0')}.sql`
    if (!done.has(batch)) nums.push(i)
  }

  if (nums.length === 0) {
    console.log('All batches in range already succeeded')
  } else {
    const batchResults = await runPool(nums)
    const byBatch = new Map((existing.results ?? []).map((r) => [r.batch, r]))
    for (const r of batchResults) byBatch.set(r.batch, r)
    existing.results = Array.from({ length: 70 }, (_, i) => {
      const batch = `batch_${String(i + 1).padStart(2, '0')}.sql`
      return byBatch.get(batch) ?? { batch, success: false, error: 'not executed' }
    })
  }

  try {
    const countRes = await executeSql('SELECT COUNT(*)::int AS total FROM evapremium_shop.mat_templates;')
    const parsed = JSON.parse(countRes)
    existing.finalCount = parsed?.[0]?.total ?? null
    console.log(`Final count: ${existing.finalCount}`)
  } catch (err) {
    console.error('Count query failed:', err)
  }

  existing.projectId = PROJECT_ID
  fs.writeFileSync(RESULTS_PATH, JSON.stringify(existing, null, 2))
  const succeeded = (existing.results ?? []).filter((r) => r.success).length
  const failed = (existing.results ?? []).filter((r) => !r.success)
  console.log(`Succeeded: ${succeeded}/70`)
  if (failed.length) {
    console.log('Failed batches:')
    for (const f of failed) console.log(`  ${f.batch}: ${f.error ?? 'unknown'}`)
  }
  process.exit(failed.length ? 1 : 0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
