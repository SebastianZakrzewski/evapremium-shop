/**
 * Generates fewer, larger MCP-friendly SQL chunks from updates JSON.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")
const updatesFile = path.join(root, "output", "mat-templates-raw-brand-model-updates.json")
const outDir = path.join(root, "output", "mcp-current")

const CHUNK_SIZE = 500
const PROJECT_ID = "kmepxyervpeujwvgdqtm"
const SOURCE_FILE = "NEW Baza szablonów Evamats (2).xlsx"
const SOURCE_SHEET = "Nowa baza szablonów"

const updates = JSON.parse(fs.readFileSync(updatesFile, "utf8"))
fs.mkdirSync(outDir, { recursive: true })

const buildChunkSql = (chunk) => {
  const json = JSON.stringify(chunk).replace(/'/g, "''")
  return `BEGIN;
UPDATE evapremium_shop.mat_templates AS mt
SET
  brand_name = src.brand_name,
  brand_key = src.brand_key,
  model_name = src.model_name,
  model_key = src.model_key,
  model_family_name = src.model_family_name,
  model_family_key = src.model_family_key,
  source_file = '${SOURCE_FILE.replace(/'/g, "''")}',
  source_sheet = '${SOURCE_SHEET.replace(/'/g, "''")}',
  json_version = 'raw-marka-model-1.0',
  updated_at = now()
FROM jsonb_to_recordset('${json}'::jsonb) AS src(
  source_row_id integer,
  brand_name text,
  brand_key text,
  model_name text,
  model_key text,
  model_family_name text,
  model_family_key text
)
WHERE mt.source_row_id = src.source_row_id
  AND mt.is_active = true;
COMMIT;`
}

const index = []
for (let i = 0; i < updates.length; i += CHUNK_SIZE) {
  const chunk = updates.slice(i, i + CHUNK_SIZE)
  const chunkNo = Math.floor(i / CHUNK_SIZE) + 1
  const sql = buildChunkSql(chunk)
  const outFile = path.join(outDir, `raw_brand_model_chunk_${String(chunkNo).padStart(2, "0")}.json`)
  fs.writeFileSync(
    outFile,
    JSON.stringify({ project_id: PROJECT_ID, query: sql, rows: chunk.length }),
  )
  index.push({ chunk: chunkNo, file: outFile, rows: chunk.length, queryLength: sql.length })
}

fs.writeFileSync(path.join(outDir, "raw_brand_model_chunks_index.json"), JSON.stringify(index, null, 2))
console.log(JSON.stringify(index, null, 2))
