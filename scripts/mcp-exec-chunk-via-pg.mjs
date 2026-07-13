#!/usr/bin/env node
/**
 * Execute mat_templates chunk SQL via postgres (pg).
 * Requires DATABASE_URL with valid Supabase postgres password.
 * Usage: node scripts/mcp-exec-chunk-via-pg.mjs 02 [03 ...]
 */
import fs from 'node:fs'
import path from 'node:path'
import pg from 'pg'
import { spawnSync } from 'node:child_process'

const ROOT = path.resolve(import.meta.dirname, '..')
const DIR = path.join(ROOT, 'output/mcp-current')

const recordChunk = (chunkNum, status, error) => {
  const args = ['scripts/mcp-chunk-record.mjs', String(chunkNum), status]
  if (error) args.push(error.slice(0, 500))
  spawnSync('node', args, { cwd: ROOT, stdio: 'inherit', shell: true })
}

const chunks = process.argv.slice(2).map((c) => String(c).padStart(2, '0'))
if (!chunks.length) {
  console.error('Usage: node scripts/mcp-exec-chunk-via-pg.mjs <chunk_num> [...]')
  process.exit(1)
}

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl || databaseUrl.includes('password@') || databaseUrl.includes('username:password')) {
  console.error('DATABASE_URL missing or placeholder — set a valid Supabase postgres URL')
  process.exit(1)
}

const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } })

const runChunk = async (chunkNum) => {
  const file = path.join(DIR, `.exec_args_${chunkNum}.json`)
  if (!fs.existsSync(file)) {
    throw new Error(`Missing ${file}`)
  }
  const { query } = JSON.parse(fs.readFileSync(file, 'utf8'))
  await client.query(query)
}

try {
  await client.connect()
  for (const chunkNum of chunks) {
    try {
      console.log(`Executing chunk ${chunkNum}...`)
      await runChunk(chunkNum)
      recordChunk(chunkNum, 'success')
      console.log(`OK chunk ${chunkNum}`)
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err)
      recordChunk(chunkNum, 'failed', error)
      console.error(`FAIL chunk ${chunkNum}: ${error.slice(0, 300)}`)
    }
  }
} finally {
  await client.end().catch(() => {})
}
