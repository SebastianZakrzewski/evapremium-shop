import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const batchDir = path.join(__dirname, '../output/mcp-pricing-seed')
const batchArg = process.argv[2]

const connectionString =
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  process.env.POSTGRES_URL

if (!connectionString) {
  console.error('Missing DATABASE_URL / SUPABASE_DB_URL / POSTGRES_URL')
  process.exit(1)
}

const runBatch = async (num) => {
  const file = path.join(batchDir, `batch_${num}.sql.json`)
  const { query } = JSON.parse(fs.readFileSync(file, 'utf8'))
  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } })
  await client.connect()
  try {
    await client.query(query)
    return { batch: num, success: true }
  } finally {
    await client.end()
  }
}

const main = async () => {
  const batches = batchArg
    ? [batchArg.padStart(2, '0')]
    : Array.from({ length: 10 }, (_, i) => String(i + 1).padStart(2, '0'))

  const results = []
  for (const num of batches) {
    try {
      results.push(await runBatch(num))
      console.log(`batch_${num}: success`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      results.push({ batch: num, success: false, error: message })
      console.error(`batch_${num}: FAILED - ${message}`)
      process.exitCode = 1
      break
    }
  }
  console.log(JSON.stringify(results, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
