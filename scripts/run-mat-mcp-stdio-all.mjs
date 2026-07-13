#!/usr/bin/env node
/**
 * Execute all mat_templates batches via Supabase MCP stdio server.
 * Requires SUPABASE_ACCESS_TOKEN in environment.
 */
import fs from 'node:fs'
import path from 'node:path'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

const ROOT = path.resolve(import.meta.dirname, '..')
const PAYLOAD_DIR = path.join(ROOT, 'output', 'mcp-current')
const RESULTS_PATH = path.join(ROOT, 'output', 'mcp-mat-batch-results.json')
const PROJECT_ID = 'kmepxyervpeujwvgdqtm'
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN

if (!TOKEN) {
  console.error('SUPABASE_ACCESS_TOKEN is required')
  process.exit(1)
}

const start = Number(process.argv[2] ?? 1)
const end = Number(process.argv[3] ?? 70)

const transport = new StdioClientTransport({
  command: 'npx',
  args: ['-y', '@supabase/mcp-server-supabase@latest'],
  env: {
    ...process.env,
    SUPABASE_ACCESS_TOKEN: TOKEN,
  },
})

const client = new Client({ name: 'mat-batch-runner', version: '1.0.0' }, { capabilities: {} })

const executeSql = async (query) => {
  const result = await client.callTool({
    name: 'execute_sql',
    arguments: { project_id: PROJECT_ID, query },
  })
  if (result.isError) {
    const text = result.content?.map((c) => c.text).join('\n') ?? 'unknown MCP error'
    throw new Error(text)
  }
  return result
}

const main = async () => {
  await client.connect(transport)
  const results = []

  for (let i = start; i <= end; i++) {
    const id = String(i).padStart(2, '0')
    const payload = JSON.parse(fs.readFileSync(path.join(PAYLOAD_DIR, `payload_${id}.json`), 'utf8'))
    const batch = payload.batch ?? `batch_${id}.sql`
    try {
      await executeSql(payload.query)
      results.push({ batch, success: true })
      console.log(`OK ${batch}`)
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err)
      results.push({ batch, success: false, error })
      console.error(`FAIL ${batch}: ${error}`)
    }
  }

  let finalCount = null
  try {
    const countResult = await executeSql('SELECT COUNT(*)::int AS total FROM evapremium_shop.mat_templates;')
    const text = countResult.content?.map((c) => c.text).join('\n') ?? ''
    const match = text.match(/"total"\s*:\s*(\d+)/)
    finalCount = match ? Number(match[1]) : null
    console.log(`Final count: ${finalCount}`)
  } catch (err) {
    console.error('Count query failed:', err)
  }

  const output = { projectId: PROJECT_ID, results, finalCount }
  fs.writeFileSync(RESULTS_PATH, JSON.stringify(output, null, 2))
  await client.close()
  const succeeded = results.filter((r) => r.success).length
  console.log(`Succeeded: ${succeeded}/${results.length}`)
  process.exit(results.some((r) => !r.success) ? 1 : 0)
}

main().catch(async (err) => {
  console.error(err)
  try { await client.close() } catch {}
  process.exit(1)
})
