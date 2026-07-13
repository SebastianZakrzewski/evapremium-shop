#!/usr/bin/env node
import fs from "node:fs"
import path from "node:path"
import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"

const root = path.resolve(import.meta.dirname, "..")
dotenv.config({ path: path.join(root, ".env") })

const pageSize = 1000
const updates = JSON.parse(
  fs.readFileSync(path.join(root, "output/mat-templates-raw-brand-model-updates.json"), "utf8"),
)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
)

const fetchAllActive = async () => {
  const rows = []
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .schema("evapremium_shop")
      .from("mat_templates")
      .select("source_row_id, brand_name, model_name, json_version, is_active")
      .eq("is_active", true)
      .order("source_row_id")
      .range(from, from + pageSize - 1)

    if (error) throw new Error(error.message)
    rows.push(...data)
    if (data.length < pageSize) break
  }
  return rows
}

const data = await fetchAllActive()
const rawRows = data.filter((row) => row.json_version === "raw-marka-model-1.0")

const byId = new Map(data.map((row) => [row.source_row_id, row]))
const missing = []
const wrongVersion = []
const wrongLabels = []

for (const row of updates) {
  const db = byId.get(row.source_row_id)
  if (!db) {
    missing.push(row)
    continue
  }
  if (db.json_version !== "raw-marka-model-1.0") wrongVersion.push({ expected: row, db })
  if (db.brand_name !== row.brand_name || db.model_name !== row.model_name) {
    wrongLabels.push({ expected: row, db })
  }
}

console.log(
  JSON.stringify(
    {
      activeRowsInDb: data.length,
      rawVersionRows: rawRows.length,
      expectedUpdates: updates.length,
      missingInDb: missing.length,
      wrongVersion: wrongVersion.length,
      wrongLabels: wrongLabels.length,
      missingSample: missing.slice(0, 15),
      wrongVersionSample: wrongVersion.slice(0, 5),
      wrongLabelsSample: wrongLabels.slice(0, 5),
    },
    null,
    2,
  ),
)
