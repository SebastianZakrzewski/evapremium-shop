import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const batchNum = process.argv[2]?.padStart(2, '0')
if (!batchNum) {
  console.error('Usage: node emit-mcp-batch-query.mjs <1-10>')
  process.exit(1)
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const file = path.join(__dirname, `../output/mcp-pricing-seed/batch_${batchNum}.sql.json`)
const payload = JSON.parse(fs.readFileSync(file, 'utf8'))
process.stdout.write(payload.query)
