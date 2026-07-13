#!/usr/bin/env node
/**
 * Writes DATABASE_URL to .env using Supabase pooler (eu-central-1).
 *
 * Usage:
 *   SUPABASE_DB_PASSWORD="your-db-password" node scripts/configure-database-url.mjs
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const ENV_PATH = path.join(ROOT, '.env')
const PROJECT_REF = 'kmepxyervpeujwvgdqtm'

const password = process.env.SUPABASE_DB_PASSWORD?.trim()
if (!password) {
  console.error('Set SUPABASE_DB_PASSWORD with your Supabase database password.')
  console.error('Dashboard: Project Settings -> Database -> Database password')
  process.exit(1)
}

const encodedPassword = encodeURIComponent(password)
const databaseUrl =
  `postgresql://postgres.${PROJECT_REF}:${encodedPassword}` +
  '@aws-0-eu-central-1.pooler.supabase.com:6543/postgres'

if (!fs.existsSync(ENV_PATH)) {
  console.error('.env not found')
  process.exit(1)
}

let env = fs.readFileSync(ENV_PATH, 'utf8')
if (/^DATABASE_URL=.*$/m.test(env)) {
  env = env.replace(/^DATABASE_URL=.*$/m, `DATABASE_URL=${databaseUrl}`)
} else {
  env += `\nDATABASE_URL=${databaseUrl}\n`
}

fs.writeFileSync(ENV_PATH, env, 'utf8')
console.log('Updated DATABASE_URL in .env (pooler 6543, eu-central-1)')
