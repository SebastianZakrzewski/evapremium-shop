#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const id = String(process.argv[2] ?? '1').padStart(2, '0')
const sqlPath = path.join(ROOT, 'output', 'mat-templates-seed-batches', `batch_${id}.sql`)
const query = fs.readFileSync(sqlPath, 'utf8')
process.stdout.write(
  JSON.stringify({
    project_id: 'kmepxyervpeujwvgdqtm',
    query,
  }),
)
