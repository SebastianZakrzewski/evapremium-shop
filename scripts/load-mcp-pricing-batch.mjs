import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const batchNum = process.argv[2]
if (!batchNum) {
  console.error('Usage: node load-mcp-pricing-batch.mjs <01-10>')
  process.exit(1)
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const file = path.join(
  __dirname,
  `../output/mcp-pricing-seed/batch_${batchNum}.sql.json`
)
const payload = JSON.parse(fs.readFileSync(file, 'utf8'))
process.stdout.write(JSON.stringify(payload))
