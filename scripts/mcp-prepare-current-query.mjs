#!/usr/bin/env node
/**
 * Load batch/chunk MCP payload and write query to .current_query.sql for agent MCP calls.
 * Usage: node scripts/mcp-prepare-current-query.mjs batch 05
 *        node scripts/mcp-prepare-current-query.mjs chunk 02
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const DIR = path.join(ROOT, 'output/mcp-current')
const PROJECT_ID = 'kmepxyervpeujwvgdqtm'

const [kind, numRaw] = process.argv.slice(2)
if (!kind || !numRaw) {
  console.error('Usage: mcp-prepare-current-query.mjs <batch|chunk> <NN>')
  process.exit(1)
}

const num = String(numRaw).padStart(2, '0')
let file
if (kind === 'batch') {
  file = path.join(DIR, `MCP_CALL_${num}.json`)
  if (!fs.existsSync(file)) {
    const alt = path.join(DIR, `CALL_MCP_${num}.args.json`)
    const payload = JSON.parse(fs.readFileSync(alt, 'utf8'))
    fs.writeFileSync(file, JSON.stringify({ project_id: payload.project_id ?? PROJECT_ID, query: payload.query }))
  }
} else if (kind === 'chunk') {
  file = path.join(DIR, `.mcp_chunk_${num}.json`)
} else {
  console.error('kind must be batch or chunk')
  process.exit(1)
}

const payload = JSON.parse(fs.readFileSync(file, 'utf8'))
const queryOut = path.join(DIR, '.current_query.sql')
const metaOut = path.join(DIR, '.current_mcp_meta.json')
fs.writeFileSync(queryOut, payload.query)
fs.writeFileSync(
  metaOut,
  JSON.stringify({
    project_id: payload.project_id ?? PROJECT_ID,
    kind,
    num,
    queryLength: payload.query.length,
    queryFile: queryOut,
  })
)
console.log(JSON.stringify({ project_id: payload.project_id ?? PROJECT_ID, queryLength: payload.query.length, kind, num }))
