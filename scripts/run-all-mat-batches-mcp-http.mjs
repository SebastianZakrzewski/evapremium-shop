#!/usr/bin/env node
/**
 * Execute mat_templates batches via Supabase MCP HTTP (mcp.supabase.com).
 * Falls back to stdio MCP server if SUPABASE_ACCESS_TOKEN is set.
 */
import fs from 'node:fs'
import path from 'node:path'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

const ROOT = path.resolve(import.meta.dirname, '..')
const PAYLOAD_DIR = path.join(ROOT, 'output', 'mcp-current')
const RESULTS_PATH = path.join(ROOT, 'output', 'mcp-mat-batch-results.json')
const PROJECT_ID = 'kmepxyervpeujwvgdqtm'
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN

const start = Number(process.argv[2] ?? 1)
const end = Number(process.argv[3] ?? 70)

const createTransport = async () => {
  if (TOKEN) {
    return new StdioClientTransport({
      command: 'npx',
      args: ['-y', '@supabase/mcp-server-supabase@latest'],
      env: { ...process.env, SUPABASE_ACCESS_TOKEN: TOKEN },
    })
  }
  return new StreamableHTTPClientTransport(new URL('https://mcp.supabase.com/mcp'))
}

const main = async () => {
  const transport = await createTransport()
  const client = new Client({ name: 'mat-batch-runner', version: '1.0.0' }, { capabilities: {} })
  await client.connect(transport)

  const results = []
  for (let i = start; i <= end; i++) {
    const id = String(i).padStart(2, '0')
    const payload = JSON.parse(fs.readFileSync(path.join(PAYLOAD_DIR, `payload_${id}.json`), 'utf8'))
    const batch = payload.batch ?? `batch_${id}.sql`
    try {
      const result = await client.callTool({
        name: 'execute_sql',
        arguments: { project_id: PROJECT_ID, query: payload.query },
      })
      if (result.isError) {
        const text = result.content?.map((c) => c.text).join('\n') ?? 'unknown MCP error'
        throw new Error(text)
      }
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
    const countResult = await client.callTool({
      name: 'execute_sql',
      arguments: {
        project_id: PROJECT_ID,
        query: 'SELECT COUNT(*)::int AS total FROM evapremium_shop.mat_templates;',
      },
    })
    if (!countResult.isError) {
      const text = countResult.content?.map((c) => c.text).join('\n') ?? ''
      const match = text.match(/"total"\s*:\s*(\d+)/)
      if (match) finalCount = Number(match[1])
    }
  } catch (err) {
    console.error('Count failed:', err instanceof Error ? err.message : err)
  }

  const output = { projectId: PROJECT_ID, executedAt: new Date().toISOString(), results, finalCount }
  fs.writeFileSync(RESULTS_PATH, JSON.stringify(output, null, 2))
  console.log(`Done. Succeeded: ${results.filter((r) => r.success).length}, Failed: ${results.filter((r) => !r.success).length}, Final: ${finalCount}`)
  await client.close()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
