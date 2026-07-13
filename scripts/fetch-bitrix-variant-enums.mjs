#!/usr/bin/env node
/**
 * Fetches UF_CRM_1757024931236 enum values from Bitrix24 and builds
 * segment + variant_key -> bitrix_enum_id map for pricing sync.
 */
import fs from "node:fs"
import path from "node:path"
import dotenv from "dotenv"

const root = path.resolve(import.meta.dirname, "..")
dotenv.config({ path: path.join(root, ".env.local") })
dotenv.config({ path: path.join(root, ".env") })

const webhookUrl = process.env.BITRIX24_WEBHOOK_URL
if (!webhookUrl) {
  throw new Error("BITRIX24_WEBHOOK_URL is required")
}

const outputPath = path.join(root, "src/data/evamats-bitrix-variant-enum-ids.json")
const bitrixMappingPath = path.join(
  root,
  "src/data/evamats-bitrix-variant-mapping.normalized.json",
)

const normalizeLabel = (value) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim()

const VARIANT_POLISH_LABELS = {
  driver_mat: "Dywanik Kierowcy",
  driver_mat_large_trunk: "Dywanik kierowcy + bagażnik duży",
  front: "Przód",
  rear: "Tył",
  rear_only: "Tył",
  front_with_tunnel: "Przód z tunelem",
  front_only_with_tunnel: "Przód z tunelem",
  front_without_tunnel: "Przód bez tunelu",
  front_and_rear: "Przód + Tył",
  basic: "Przód + Tył",
  front_rear_trunk: "Przód + Tył + Bagażnik",
  premium: "Przód + Tył + Bagażnik",
  front_trunk: "Przód + Bagażnik",
  rear_trunk: "Tył + Bagażnik",
  row_1: "1 Rząd",
  row_2: "2 Rzędy",
  row_3: "3 Rzędy",
  row_3_single: "3 Rząd",
  row_3_large_trunk: "3 Rzędy + Duży Bagażnik",
  row_3_small_trunk: "3 Rzędy + Mały Bagażnik",
  row_3_large_and_small_trunk: "3 Rzędy + Mały i Duży Bagażnik",
  row_2_large_trunk: "2 Rzędy + Duży Bagażnik",
  row_2_small_trunk: "2 Rzędy + Mały Bagażnik",
  row_1_trunk: "1 Rząd + Bagażnik",
  row_1_large_trunk: "1 Rząd + Duży Bagażnik",
  trunk_large: "Mata Do Bagażnika",
  trunk_small: "Bagażnik mały",
  trunk_custom: "Bagażnik niestandardowy",
  trunk_mat: "Mata Do Bagażnika",
  home_mat: "Mata do domu",
  passenger_mat: "Dywanik Pasażera",
  passenger_mat_rear: "Dywanik Pasażera + Tył",
  passenger_mat_rear_trunk: "Dywanik Pasażera + Tył + Bagażnik",
  tunnel_mat: "Dywanik na Tunel",
  custom_order: "Niestandardowe zamówienie",
  complete: "Mata do bagażnika",
}

const resolveEnumId = (label, enumByLabel) => {
  if (!label) return null
  const direct = enumByLabel.get(normalizeLabel(label))
  if (direct != null) return direct

  const candidates = [...enumByLabel.entries()].filter(([key]) =>
    key.includes(normalizeLabel(label)) || normalizeLabel(label).includes(key),
  )
  return candidates.length === 1 ? candidates[0][1] : null
}

const main = async () => {
  const response = await fetch(`${webhookUrl}crm.deal.userfield.list`)
  const payload = await response.json()
  if (payload.error) {
    throw new Error(`Bitrix API error: ${payload.error_description ?? payload.error}`)
  }

  const field = payload.result.find(
    (item) => item.FIELD_NAME === "UF_CRM_1757024931236",
  )
  if (!field?.LIST?.length) {
    throw new Error("Bitrix variant enum field not found")
  }

  const enums = field.LIST.map((item) => ({
    id: Number(item.ID),
    value: item.VALUE.trim(),
  }))
  const enumByLabel = new Map(
    enums.map((item) => [normalizeLabel(item.value), item.id]),
  )

  const bitrix = JSON.parse(fs.readFileSync(bitrixMappingPath, "utf8"))
  const bySegment = {}
  const labelsPl = {}
  const unresolved = []

  for (const [segmentId, segment] of Object.entries(bitrix.segments)) {
    bySegment[segmentId] = {}
    for (const variant of segment.variants) {
      const polishLabel = VARIANT_POLISH_LABELS[variant.variant_key]
      if (polishLabel) labelsPl[variant.variant_key] = polishLabel
      const enumId = resolveEnumId(polishLabel, enumByLabel)
      if (enumId != null) {
        bySegment[segmentId][variant.variant_key] = enumId
      } else if (polishLabel) {
        unresolved.push({
          segment: segmentId,
          variant_key: variant.variant_key,
          polish_label: polishLabel,
        })
      }
    }
  }

  const artifact = {
    meta: {
      field: "UF_CRM_1757024931236",
      fetched_at: new Date().toISOString(),
      enum_count: enums.length,
      unresolved_count: unresolved.length,
    },
    enums,
    variant_labels_pl: labelsPl,
    by_segment: bySegment,
    unresolved,
  }

  fs.writeFileSync(outputPath, `${JSON.stringify(artifact, null, 2)}\n`, "utf8")
  console.log(
    `Wrote ${outputPath} (${enums.length} enums, ${unresolved.length} unresolved variant keys)`,
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
