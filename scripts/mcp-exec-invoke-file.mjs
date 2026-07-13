#!/usr/bin/env node
/**
 * Execute one batch invoke JSON via Supabase Management API.
 * Usage: SUPABASE_PAT=sbp_... node scripts/mcp-exec-invoke-file.mjs output/mcp-temp/invokes/invoke_04.json
 */
import fs from 'node:fs'

const file = process.argv[2]
const TOKEN = process.env.SUPABASE_PAT
if (!file) {
  console.error('Usage: SUPABASE_PAT=sbp_... node scripts/mcp-exec-invoke-file.mjs <invoke.json>')
  process.exit(1)
}
if (!TOKEN?.startsWith('sbp_')) {
  console.error('Set SUPABASE_PAT=sbp_...')
  process.exit(1)
}

const { project_id, query, batch } = JSON.parse(fs.readFileSync(file, 'utf8'))
const res = await fetch(`https://api.supabase.com/v1/projects/${project_id}/database/query`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query }),
})
const text = await res.text()
if (!res.ok) {
  console.error(`FAIL ${batch}: ${res.status} ${text.slice(0, 500)}`)
  process.exit(1)
}
console.log(`OK ${batch}`)
