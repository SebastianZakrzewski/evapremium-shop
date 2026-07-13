#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const id = String(process.argv[2] ?? '').padStart(2, '0')
const root = path.resolve(import.meta.dirname, '..')
const file = path.join(root, 'output', 'mcp-current', `exec_payload_${id}.json`)
const payload = JSON.parse(fs.readFileSync(file, 'utf8'))
process.stdout.write(JSON.stringify({ project_id: payload.project_id, query: payload.query }))
