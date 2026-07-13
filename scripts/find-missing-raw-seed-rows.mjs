#!/usr/bin/env node
import fs from "node:fs"
import path from "node:path"
import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"

const root = path.resolve(import.meta.dirname, "..")
dotenv.config({ path: path.join(root, ".env") })

const updates = JSON.parse(
  fs.readFileSync(path.join(root, "output/mat-templates-raw-brand-model-updates.json"), "utf8"),
)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
)

const missingSql = `
  WITH expected AS (
    SELECT jsonb_array_elements($1::jsonb) AS row
  ),
  ids AS (
    SELECT (row->>'source_row_id')::int AS source_row_id
    FROM expected
  )
  SELECT i.source_row_id
  FROM ids i
  LEFT JOIN evapremium_shop.mat_templates mt
    ON mt.source_row_id = i.source_row_id
   AND mt.is_active = true
  WHERE mt.id IS NULL
  ORDER BY i.source_row_id;
`

const payload = JSON.stringify(updates.map((row) => ({ source_row_id: row.source_row_id })))
const escaped = payload.replace(/'/g, "''")
const query = missingSql.replace("$1::jsonb", `'${escaped}'::jsonb`)

const { error } = await supabase.rpc("exec_mat_seed_sql", { q: query })

if (error) {
  console.error("RPC error:", error.message)
  process.exit(1)
}

const countSql = `
  SELECT count(*)::int AS total
  FROM evapremium_shop.mat_templates
  WHERE is_active = true
    AND json_version = 'raw-marka-model-1.0';
`

const { error: countErr } = await supabase.rpc("exec_mat_seed_sql", { q: countSql })
console.log({ countErr: countErr?.message ?? null, note: "exec_mat_seed_sql may not return SELECT rows via REST" })
