#!/usr/bin/env node
/**
 * Emit next pending batch MCP args for agent CallMcpTool loop.
 * Usage:
 *   node scripts/mcp-agent-next.mjs batch 05
 *   node scripts/mcp-agent-next.mjs chunk 02
 * Writes output/mcp-current/.agent_mcp_call.json and prints metadata.
 */
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const ROOT = path.resolve(import.meta.dirname, '..')
const DIR = path.join(ROOT, 'output/mcp-current')
const OUT = path.join(DIR, '.agent_mcp_call.json')

const [kind, num] = process.argv.slice(2)
if (!kind || !num) {
  console.error('Usage: node scripts/mcp-agent-next.mjs <batch|chunk> <num>')
  process.exit(1)
}

spawnSync('node', ['scripts/mcp-exec-from-json.mjs', kind, num], { cwd: ROOT, stdio: 'inherit', shell: true })
const payload = JSON.parse(fs.readFileSync(path.join(DIR, '.mcp_tool_args.json'), 'utf8'))
fs.writeFileSync(OUT, JSON.stringify({ project_id: payload.project_id, query: payload.query }))
console.log(JSON.stringify({ kind, num, project_id: payload.project_id, queryLength: payload.query.length, out: OUT }))
