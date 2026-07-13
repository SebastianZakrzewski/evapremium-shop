#!/usr/bin/env node
/**
 * Execute one mat_templates seed batch via Supabase MCP stdio (OAuth PAT required).
 * Reads output/mcp-current/_mcp_call_batch_XX.json
 *
 * Usage: SUPABASE_ACCESS_TOKEN=sbp_... node scripts/mcp-exec-batch-from-file.mjs 04
 */
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

const ROOT = path.resolve(import.meta.dirname, '..')
const n = String(process.argv[2] ?? '').padStart(2, '0')
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN

if (!/^\d{2}$/.test(n)) {
  console.error('Usage: node scripts/mcp-exec-batch-from-file.mjs <batch_number>')
  process.exit(1)
}

if (!TOKEN?.startsWith('sbp_')) {
  console.error('SUPABASE_ACCESS_TOKEN must be a Personal Access Token (sbp_...)')
  process.exit(1)
}

const file = path.join(ROOT, 'output/mcp-current', `_mcp_call_batch_${n}.json`)
const { project_id, query } = JSON.parse(fs.readFileSync(file, 'utf8'))
const batch = `batch_${n}.sql`

const record = (status, error) => {
  const args = ['scripts/mcp-mat-batch-record.mjs', 'record', batch, status]
  if (error) args.push(error.slice(0, 500))
  spawnSync('node', args, { cwd: ROOT, stdio: 'inherit', shell: true })
}

const transport = new StdioClientTransport({
  command: 'npx',
  args: ['-y', '@supabase/mcp-server-supabase@latest'],
  env: { ...process.env, SUPABASE_ACCESS_TOKEN: TOKEN },
})

const client = new Client({ name: 'mat-batch-one', version: '1.0.0' }, { capabilities: {} })

try {
  await client.connect(transport)
  const result = await client.callTool({
    name: 'execute_sql',
    arguments: { project_id, query },
  })
  if (result.isError) {
    const text = result.content?.map((c) => c.text).join('\n') ?? 'MCP error'
    throw new Error(text)
  }
  record('success')
  console.log(`OK ${batch}`)
} catch (err) {
  const error = err instanceof Error ? err.message : String(err)
  record('failed', error)
  console.error(`FAIL ${batch}: ${error}`)
  process.exit(1)
} finally {
  try {
    await client.close()
  } catch {}
}
