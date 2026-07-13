#!/usr/bin/env node
/**
 * Syncs all evapremium_shop tables after raw MARKA/MODEL migration on mat_templates.
 *
 * Steps:
 *   1. Schema comments migration
 *   2. pricing_template_overrides rebuild (raw labels, expanded per generation)
 *
 * Prerequisites:
 *   output/mat-templates-raw-brand-model-updates.json
 *   node scripts/run-raw-brand-model-seed-rest.mjs (mat_templates already seeded)
 *
 * Usage:
 *   node scripts/run-evapremium-shop-raw-label-sync.mjs
 */
import { spawnSync } from "node:child_process"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")

const run = (script) => {
  const result = spawnSync("node", [path.join("scripts", script)], {
    cwd: root,
    stdio: "inherit",
    shell: true,
  })
  if (result.status !== 0) process.exit(result.status ?? 1)
}

run("apply-evapremium-shop-comments-migration.mjs")
run("seed-pricing-template-overrides-raw.mjs")

console.log("evapremium_shop raw label sync completed.")
