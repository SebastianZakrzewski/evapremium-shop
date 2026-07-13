#!/usr/bin/env node
/**
 * Execute mat_templates seed batches via Supabase MCP stdio (no SDK).
 * Uses Cursor/plugin OAuth via npx @supabase/mcp-server-supabase.
 */
import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'

const ROOT = path.resolve(import.meta.dirname, '..')
const DIR = path.join(ROOT, 'output/mcp-current')
const RESULTS_PATH = path.join(ROOT, 'output/mcp-mat-batch-results.json')
const PROJECT_ID = 'kmepxyervpeujwvgdqtm'
const FROM = Number(process.argv[2] ?? 1)
const TO = Number(process.argv[3] ?? 70)
const CONCURRENCY = Number(process.argv[4] ?? 5)

const loadPayload = (n) => {
  const id = String(n).padStart(2, '0')
  const file = path.join(DIR, `exec_payload_${id}.json`)
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

const createMcpClient = () =>
  new Promise((resolve, reject) => {
    const child = spawn('npx', ['-y', '@supabase/mcp-server-supabase@latest'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
      env: { ...process.env },
    })

    let nextId = 1
    const pending = new Map()
    let buffer = ''

    const send = (method, params) => {
      const id = nextId++
      const msg = JSON.stringify({ jsonrpc: '2.0', id, method, params })
      child.stdin.write(`${msg}\n`)
      return new Promise((res, rej) => pending.set(id, { res, rej }))
    }

    child.stdout.on('data', (chunk) => {
      buffer += chunk.toString()
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        if (!line.trim()) continue
        try {
          const msg = JSON.parse(line)
          if (msg.id != null && pending.has(msg.id)) {
            const { res, rej } = pending.get(msg.id)
            pending.delete(msg.id)
            if (msg.error) rej(new Error(msg.error.message ?? JSON.stringify(msg.error)))
            else res(msg.result)
          }
        } catch {
          /* ignore non-json lines */
        }
      }
    })

    child.stderr.on('data', (d) => process.stderr.write(d))
    child.on('error', reject)
    child.on('close', (code) => {
      if (code !== 0 && code !== null) reject(new Error(`MCP exited ${code}`))
    })

    const init = async () => {
      await send('initialize', {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'mat-batch-stdio', version: '1.0.0' },
      })
      child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' })}\n`)
      resolve({
        callTool: async (name, args) => {
          const result = await send('tools/call', { name, arguments: args })
          if (result?.isError) {
            const text = result.content?.map((c) => c.text).join('\n') ?? 'MCP error'
            throw new Error(text)
          }
          return result
        },
        close: () => child.kill(),
      })
    }

    init().catch(reject)
  })

const runBatch = async (client, n) => {
  const id = String(n).padStart(2, '0')
  const batch = `batch_${id}.sql`
  try {
    const payload = loadPayload(n)
    await client.callTool('execute_sql', { project_id: PROJECT_ID, query: payload.query })
    console.log(`OK ${batch}`)
    return { batch, success: true }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    console.error(`FAIL ${batch}: ${error.slice(0, 200)}`)
    return { batch, success: false, error }
  }
}

const runPool = async (client, nums) => {
  const results = []
  let idx = 0
  const workers = Array.from({ length: Math.min(CONCURRENCY, nums.length) }, async () => {
    while (idx < nums.length) {
      const n = nums[idx++]
      results.push(await runBatch(client, n))
    }
  })
  await Promise.all(workers)
  return results
}

const main = async () => {
  const existing = fs.existsSync(RESULTS_PATH)
    ? JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'))
    : { projectId: PROJECT_ID, results: [] }

  const done = new Set((existing.results ?? []).filter((r) => r.success).map((r) => r.batch))
  const nums = []
  for (let i = FROM; i <= TO; i++) {
    const batch = `batch_${String(i).padStart(2, '0')}.sql`
    if (!done.has(batch)) nums.push(i)
  }

  const client = await createMcpClient()
  let batchResults = []
  if (nums.length) {
    console.log(`Executing ${nums.length} batches (concurrency ${CONCURRENCY})...`)
    batchResults = await runPool(client, nums)
  } else {
    console.log('All batches in range already succeeded')
  }

  const byBatch = new Map((existing.results ?? []).map((r) => [r.batch, r]))
  for (const r of batchResults) byBatch.set(r.batch, r)

  const results = Array.from({ length: 70 }, (_, i) => {
    const batch = `batch_${String(i + 1).padStart(2, '0')}.sql`
    return byBatch.get(batch) ?? { batch, success: false, error: 'not executed' }
  })

  let finalCount = null
  try {
    const countResult = await client.callTool('execute_sql', {
      project_id: PROJECT_ID,
      query: 'SELECT COUNT(*)::int AS total FROM evapremium_shop.mat_templates;',
    })
    const text = countResult.content?.map((c) => c.text).join('\n') ?? ''
    const match = text.match(/"total"\s*:\s*(\d+)/) ?? text.match(/\b(\d+)\b/)
    finalCount = match ? Number(match[1]) : null
    console.log(`Final count: ${finalCount}`)
  } catch (err) {
    console.error('Count failed:', err)
  }

  client.close()

  const output = {
    projectId: PROJECT_ID,
    results: results.map(({ batch, success, error }) =>
      error && !success ? { batch, success, error } : { batch, success },
    ),
    finalCount,
  }
  fs.writeFileSync(RESULTS_PATH, JSON.stringify(output, null, 2))

  const succeeded = results.filter((r) => r.success).length
  const failed = results.filter((r) => !r.success)
  console.log(`Succeeded: ${succeeded}/70`)
  if (failed.length) {
    console.log('Failed:', failed.map((f) => f.batch).join(', '))
  }
  process.exit(failed.length ? 1 : 0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
