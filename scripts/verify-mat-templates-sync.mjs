#!/usr/bin/env node
/**
 * Verifies mat_templates DB sync against evamats-templates.normalized.json.
 */
import fs from "node:fs"
import path from "node:path"
import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"

const root = path.resolve(import.meta.dirname, "..")
dotenv.config({ path: path.join(root, ".env.local") })
dotenv.config({ path: path.join(root, ".env") })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) throw new Error("Missing Supabase credentials in .env")

const EXCLUDED_CATEGORY_KEYS = new Set([
  "unknown",
  "page",
  "strona",
  "corsa",
  "test_1",
])

const supabase = createClient(url, key, { auth: { persistSession: false } })
const table = () => supabase.schema("evapremium_shop").from("mat_templates")

const fetchActiveRecordKeys = async () => {
  const keys = new Set()
  const pageSize = 1000
  let from = 0

  while (true) {
    const { data, error } = await table()
      .select("record_key")
      .eq("is_active", true)
      .range(from, from + pageSize - 1)

    if (error) throw new Error(error.message)
    if (!data?.length) break

    data.forEach((row) => keys.add(row.record_key))
    if (data.length < pageSize) break
    from += pageSize
  }

  return keys
}

const main = async () => {
  const payload = JSON.parse(
    fs.readFileSync(path.join(root, "src/data/evamats-templates.normalized.json"), "utf8"),
  )

  const expectedKeys = new Set(
    payload.records
      .filter((record) => record.brand_name)
      .filter((record) => record.dealer_pricing_category)
      .filter((record) => record.dealer_pricing_category_key)
      .filter((record) => !EXCLUDED_CATEGORY_KEYS.has(record.dealer_pricing_category_key))
      .map((record) => record.record_key),
  )

  const activeKeys = await fetchActiveRecordKeys()
  const missing = [...expectedKeys].filter((keyValue) => !activeKeys.has(keyValue))
  const extra = [...activeKeys].filter((keyValue) => !expectedKeys.has(keyValue))

  const summary = {
    checked_at: new Date().toISOString(),
    expected_active: expectedKeys.size,
    db_active: activeKeys.size,
    missing_count: missing.length,
    extra_count: extra.length,
    missing: missing.slice(0, 20),
    extra: extra.slice(0, 20),
    ok: missing.length === 0 && extra.length === 0,
  }

  const outputPath = path.join(root, "output/mat-templates-sync-verification.json")
  fs.writeFileSync(outputPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8")

  console.log(JSON.stringify(summary, null, 2))
  process.exit(summary.ok ? 0 : 1)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
