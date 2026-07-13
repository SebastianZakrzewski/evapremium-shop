#!/usr/bin/env node
/** Print execute_sql args JSON for batch N to stdout (UTF-8 safe). */
import { readFileSync } from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const n = String(process.argv[2] ?? '').padStart(2, '0')
const file = path.join(ROOT, 'output/mcp-current', `_mcp_call_batch_${n}.json`)
const payload = JSON.parse(readFileSync(file, 'utf8'))
process.stdout.write(JSON.stringify({ project_id: payload.project_id, query: payload.query }))
