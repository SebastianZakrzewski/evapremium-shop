/**
 * Execute mat_templates seed batches from payload JSON files.
 * Uses DATABASE_URL (same SQL as Supabase execute_sql / MCP).
 */
import fs from 'node:fs'
import path from 'node:path'
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const ROOT = path.resolve(import.meta.dirname, '..')
const PAYLOAD_DIR = path.join(ROOT, 'output', 'mcp-current')
const RESULTS_PATH = path.join(ROOT, 'output', 'mcp-mat-batch-results.json')
const projectId = 'kmepxyervpeujwvgdqtm'

const connectionString =
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  process.env.POSTGRES_URL

if (!connectionString) {
  console.error('Missing DATABASE_URL / SUPABASE_DB_URL / POSTGRES_URL')
  process.exit(1)
}

const from = Number(process.argv[2] || 1)
const to = Number(process.argv[3] || 70)

const results = {
  projectId,
  results: [],
  finalCount: null,
}

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
})

const runBatch = async (i) => {
  const id = String(i).padStart(2, '0')
  const batchName = `batch_${id}.sql`
  const payloadPath = path.join(PAYLOAD_DIR, `payload_${id}.json`)

  if (!fs.existsSync(payloadPath)) {
    return { batch: batchName, success: false, error: 'payload missing' }
  }

  const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf8'))
  const query = payload.query

  try {
    await client.query(query)
    return { batch: payload.batch ?? batchName, success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { batch: payload.batch ?? batchName, success: false, error: message }
  }
}

const main = async () => {
  await client.connect()

  for (let i = from; i <= to; i++) {
    const result = await runBatch(i)
    results.results.push(result)
    const status = result.success ? 'success' : `FAILED: ${result.error}`
    console.log(`${result.batch}: ${status}`)
    if (!result.success) break
  }

  if (results.results.every((r) => r.success)) {
    const verify = await client.query(
      'SELECT COUNT(*)::int AS total FROM evapremium_shop.mat_templates;',
    )
    results.finalCount = verify.rows[0]?.total ?? null
    console.log(`finalCount: ${results.finalCount}`)
  }

  await client.end()
  fs.writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2))
  console.log(`Wrote ${RESULTS_PATH}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
