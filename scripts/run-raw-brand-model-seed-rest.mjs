#!/usr/bin/env node
/**
 * One-shot raw MARKA/MODEL seed via Supabase REST + exec_mat_seed_sql RPC.
 * Uses NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from .env.
 *
 * Prerequisites:
 *   node scripts/extract-marka-model-raw.mjs
 *   node scripts/seed-mat-templates-raw-brand-model.mjs --sql-only
 *
 * Usage:
 *   node scripts/run-raw-brand-model-seed-rest.mjs
 *   node scripts/run-raw-brand-model-seed-rest.mjs --dry-run
 */
import fs from "node:fs"
import path from "node:path"
import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"

const root = path.resolve(import.meta.dirname, "..")
dotenv.config({ path: path.join(root, ".env.local") })
dotenv.config({ path: path.join(root, ".env") })

const sqlPath = path.join(root, "output", "mat-templates-raw-brand-model-update.sql")
const updatesPath = path.join(root, "output", "mat-templates-raw-brand-model-updates.json")
const isDryRun = process.argv.includes("--dry-run")

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env")
  process.exit(1)
}

if (!fs.existsSync(sqlPath)) {
  console.error(`Missing ${sqlPath}. Run: node scripts/seed-mat-templates-raw-brand-model.mjs --sql-only`)
  process.exit(1)
}

const rawSql = fs.readFileSync(sqlPath, "utf8")
const query = rawSql
  .replace(/^--.*\n/gm, "")
  .replace(/^\s*BEGIN;\s*/i, "")
  .replace(/\s*COMMIT;\s*$/i, "")
  .trim()

const updates = JSON.parse(fs.readFileSync(updatesPath, "utf8"))

console.log(`Rows to update: ${updates.length}`)
console.log(`SQL length: ${query.length} chars`)

if (isDryRun) {
  console.log("Dry run — no RPC call.")
  process.exit(0)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })

const { error: rpcError } = await supabase.rpc("exec_mat_seed_sql", { q: query })

if (rpcError) {
  console.error("RPC failed:", rpcError.message)
  process.exit(1)
}

const { count, error: countError } = await supabase
  .schema("evapremium_shop")
  .from("mat_templates")
  .select("id", { count: "exact", head: true })
  .eq("is_active", true)
  .eq("json_version", "raw-marka-model-1.0")

if (countError) {
  console.error("Verify count failed:", countError.message)
  process.exit(1)
}

console.log(
  JSON.stringify(
    {
      method: "rest-rpc",
      updatedExpected: updates.length,
      rawMarkaModelRows: count,
      executedAt: new Date().toISOString(),
    },
    null,
    2,
  ),
)

if (count !== updates.length) {
  console.error(`Expected ${updates.length} rows with json_version raw-marka-model-1.0, got ${count}`)
  process.exit(1)
}

console.log("Seed completed successfully.")
