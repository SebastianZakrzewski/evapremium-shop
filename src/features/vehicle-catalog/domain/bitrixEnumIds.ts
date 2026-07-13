import enumData from "@/data/evamats-bitrix-variant-enum-ids.json"
import type { BitrixVariantEnumArtifact } from "../model/bitrixEnumArtifact"

const artifact = enumData as BitrixVariantEnumArtifact

/** Segment-aware Bitrix enum IDs (fetched from Bitrix24 CRM). */
export const BITRIX_VARIANT_ENUM_BY_SEGMENT = artifact.by_segment

const CONFIGURATOR_VARIANT_ALIASES: Record<string, number> = {
  front: 270,
  basic: 274,
  premium: 276,
}

export const resolveBitrixVariantEnumId = (
  segmentId: string,
  variantKey: string,
): number | undefined => {
  const normalizedSegment =
    segmentId === "premium_passenger_car" ? "passenger_car" : segmentId
  return (
    artifact.by_segment[normalizedSegment]?.[variantKey] ??
    CONFIGURATOR_VARIANT_ALIASES[variantKey]
  )
}

export const resolveBitrixPolishLabel = (variantKey: string): string | undefined =>
  artifact.variant_labels_pl[variantKey]
