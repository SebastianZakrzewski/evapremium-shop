import fs from 'fs'
import pg from 'pg'

const PROJECT_ID = 'kmepxyervpeujwvgdqtm'
const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
const envPath = `${root}/.env`
const env = fs.readFileSync(envPath, 'utf8')
const serviceKey = env.match(/^SUPABASE_SERVICE_ROLE_KEY=(.+)$/m)?.[1]?.trim()
const databaseUrl = env.match(/^DATABASE_URL=(.+)$/m)?.[1]?.trim()

const candidates = []
if (databaseUrl && !databaseUrl.includes('username:password')) {
  candidates.push({ label: 'DATABASE_URL from .env', url: databaseUrl })
}
if (serviceKey?.startsWith('eyJ')) {
  const encoded = encodeURIComponent(serviceKey)
  candidates.push(
    {
      label: 'pooler 6543 + service key',
      url: `postgresql://postgres.${PROJECT_ID}:${encoded}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`,
    },
    {
      label: 'pooler 5432 + service key',
      url: `postgresql://postgres.${PROJECT_ID}:${encoded}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`,
    },
    {
      label: 'direct db + service key',
      url: `postgresql://postgres:${encoded}@db.${PROJECT_ID}.supabase.co:5432/postgres`,
    },
  )
}

for (const candidate of candidates) {
  const client = new pg.Client({
    connectionString: candidate.url,
    ssl: { rejectUnauthorized: false },
  })
  try {
    await client.connect()
    const result = await client.query('SELECT current_database() AS db, current_user AS user')
    console.log('SUCCESS', candidate.label, result.rows[0])
    await client.end()
    process.exit(0)
  } catch (error) {
    console.log('FAILED', candidate.label, error.message)
    await client.end().catch(() => {})
  }
}

process.exit(1)
