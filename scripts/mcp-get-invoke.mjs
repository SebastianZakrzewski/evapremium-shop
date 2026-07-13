#!/usr/bin/env node
/** Output {project_id, query} for MCP from invoke_NN.json */
import fs from 'node:fs'
import path from 'node:path'

const n = String(Number(process.argv[2])).padStart(2, '0')
const file = path.join(import.meta.dirname, '..', 'output/mcp-temp/invokes', `invoke_${n}.json`)
const { project_id, query } = JSON.parse(fs.readFileSync(file, 'utf8'))
process.stdout.write(JSON.stringify({ project_id, query }))
