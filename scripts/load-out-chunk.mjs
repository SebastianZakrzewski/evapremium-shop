#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const id = String(process.argv[2] ?? '').padStart(2, '0')
const root = path.resolve(import.meta.dirname, '..')
const file = path.join(root, 'output/mcp-current', `_out_chunk_${id}.json`)
const data = JSON.parse(fs.readFileSync(file, 'utf8'))
process.stdout.write(JSON.stringify({ project_id: data.project_id, query: data.query }))
