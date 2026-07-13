#!/usr/bin/env node
/**
 * Applies evapremium_shop schema comment migration via Supabase REST + exec_mat_seed_sql.
 */
import fs from "node:fs"
import path from "node:path"
import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"

const root = path.resolve(import.meta.dirname, "..")
dotenv.config({ path: path.join(root, ".env") })

const migrationPath = path.join(
  root,
  "supabase/migrations/20260713033000_evapremium_shop_schema_raw_label_comments.sql",
)

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
if (!url || !key) throw new Error("Missing Supabase env in .env")

const sql = fs.readFileSync(migrationPath, "utf8")
const query = sql.replace(/NOTIFY pgrst, 'reload schema';\s*$/i, "").trim()

const supabase = createClient(url, key, { auth: { persistSession: false } })
const { error } = await supabase.rpc("exec_mat_seed_sql", { q: query })

if (error) {
  console.error(error.message)
  process.exit(1)
}

console.log("Applied schema comment migration:", path.basename(migrationPath))
