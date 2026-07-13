import "server-only"
import { getBitrixVariantMapping } from "./pricingRepository"
import { resolveBitrixVariantEnumId } from "../domain/bitrixEnumIds"

const LEGACY_SET_TYPE_ENUM_MAP: Record<string, number> = {
  "3d-with-rims": 264,
  classic: 266,
  single: 264,
}

type ResolveBitrixSnapshotsInput = {
  pricingCategoryKey: string
  setType: "3d-with-rims" | "classic" | "single"
  variantKey: string
}

export const resolveBitrixSnapshots = async ({
  pricingCategoryKey,
  setType,
  variantKey,
}: ResolveBitrixSnapshotsInput) => {
  const mapping = await getBitrixVariantMapping(pricingCategoryKey, variantKey)

  return {
    variantEnumId:
      mapping?.bitrix_enum_id ??
      resolveBitrixVariantEnumId(pricingCategoryKey, variantKey) ??
      undefined,
    variantLabel: mapping?.bitrix_label,
    setTypeEnumId: LEGACY_SET_TYPE_ENUM_MAP[setType],
  }
}

export const resolveLegacyVariantEnumId = (
  pricingCategoryKey: string,
  variantKey: string,
): number | undefined => resolveBitrixVariantEnumId(pricingCategoryKey, variantKey)

export const resolveLegacySetTypeEnumId = (
  setType: string,
): number | undefined => LEGACY_SET_TYPE_ENUM_MAP[setType]
