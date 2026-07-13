#!/usr/bin/env node
/** Load invoke files for batch numbers (space-separated) into current_invoke_GROUP.json files */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const INVOKE_DIR = path.join(ROOT, 'output/mcp-temp/invokes')
const OUT = path.join(ROOT, 'output/mcp-temp')

const nums = process.argv.slice(2).map((n) => String(Number(n)).padStart(2, '0'))
for (const id of nums) {
  const invoke = JSON.parse(fs.readFileSync(path.join(INVOKE_DIR, `invoke_${id}.json`), 'utf8'))
  fs.writeFileSync(
    path.join(OUT, `current_${id}.json`),
    JSON.stringify({ project_id: invoke.project_id, query: invoke.query, batch: invoke.batch }),
  )
  console.log(`ready ${invoke.batch} (${invoke.query.length})`)
}
