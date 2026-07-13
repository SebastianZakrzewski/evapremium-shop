#!/usr/bin/env node
/** Decode base64 MCP args file to stdout JSON. */
import { readFileSync } from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const file = process.argv[2]
const abs = path.isAbsolute(file) ? file : path.join(ROOT, file)
const b64 = readFileSync(abs, 'utf8').trim()
process.stdout.write(Buffer.from(b64, 'base64').toString('utf8'))
