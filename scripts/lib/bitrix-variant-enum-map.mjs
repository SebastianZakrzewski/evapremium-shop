import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const artifact = JSON.parse(
  fs.readFileSync(
    path.join(root, "src/data/evamats-bitrix-variant-enum-ids.json"),
    "utf8",
  ),
)

export const BITRIX_VARIANT_ENUM_BY_SEGMENT = artifact.by_segment

const CONFIGURATOR_VARIANT_ALIASES = {
  front: 270,
  basic: 274,
  premium: 276,
}

export const resolveBitrixVariantEnumId = (segmentId, variantKey) => {
  const normalizedSegment =
    segmentId === "premium_passenger_car" ? "passenger_car" : segmentId
  return (
    artifact.by_segment[normalizedSegment]?.[variantKey] ??
    CONFIGURATOR_VARIANT_ALIASES[variantKey]
  )
}

export const resolveBitrixPolishLabel = (variantKey) =>
  artifact.variant_labels_pl?.[variantKey]
