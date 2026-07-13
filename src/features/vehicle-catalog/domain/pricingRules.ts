export const CONFIGURATOR_DUAL_MAT_VARIANT_KEYS = [
  "front",
  "basic",
  "premium",
  "complete",
] as const

/**
 * Extra set variants for MINIVAN body type priced on the passenger_car table
 * (cennik osobowe: row_3, row_3_*_trunk_*, front_rear_two_trunks).
 */
export const CONFIGURATOR_PASSENGER_PRICED_MINIVAN_VARIANT_KEYS = [
  "row_3",
  "row_3_small_trunk_unfolded",
  "row_3_large_trunk_folded",
  "row_3_two_trunks",
  "front_rear_two_trunks",
] as const

export const CONFIGURATOR_PASSENGER_PRICED_MINIVAN_SET_VARIANT_KEYS = [
  ...CONFIGURATOR_DUAL_MAT_VARIANT_KEYS,
  ...CONFIGURATOR_PASSENGER_PRICED_MINIVAN_VARIANT_KEYS,
] as const

export const isMinivanBodyTypeKey = (bodyTypeKey?: string): boolean =>
  !!bodyTypeKey && bodyTypeKey.toLowerCase().includes("minivan")

/** evamats.pl minivan product pages (e.g. Espace IV) */
export const CONFIGURATOR_MINIVAN_VARIANT_KEYS = [
  "driver_mat",
  "front",
  "row_2",
  "row_3",
  "trunk_small",
  "trunk_large",
  "row_3_small_trunk_unfolded",
  "row_3_large_trunk_folded",
  "row_3_two_trunks",
] as const

/** evamats.pl bus / van product pages (e.g. Vito) */
export const CONFIGURATOR_BUS_VARIANT_KEYS = [
  "driver_mat",
  "row_2",
  "row_3",
  "row_3_trunk",
] as const

export type ConfiguratorSetVariantKey =
  (typeof CONFIGURATOR_DUAL_MAT_VARIANT_KEYS)[number]

export const isConfiguratorSetVariantKey = (
  key: string,
): key is ConfiguratorSetVariantKey =>
  (CONFIGURATOR_DUAL_MAT_VARIANT_KEYS as readonly string[]).includes(key)

const filterByAllowlist = (
  keys: string[],
  allowlist: readonly string[],
): string[] => {
  const available = new Set(keys)
  return allowlist.filter((key) => available.has(key))
}

export const filterSellableVariantKeys = (
  keys: string[],
  pricingModel: string,
  categorySlug?: string,
  bodyTypeKey?: string,
): string[] => {
  if (pricingModel === "dual_mat_type") {
    if (isMinivanBodyTypeKey(bodyTypeKey)) {
      return filterByAllowlist(
        keys,
        CONFIGURATOR_PASSENGER_PRICED_MINIVAN_SET_VARIANT_KEYS,
      )
    }
    return filterByAllowlist(keys, CONFIGURATOR_DUAL_MAT_VARIANT_KEYS)
  }
  if (categorySlug === "minivan") {
    return filterByAllowlist(keys, CONFIGURATOR_MINIVAN_VARIANT_KEYS)
  }
  if (categorySlug === "bus") {
    return filterByAllowlist(keys, CONFIGURATOR_BUS_VARIANT_KEYS)
  }
  return keys
}

export type PricingOverride = {
  templateRecordKey: string | null
  brandKey: string | null
  modelFamilyKey: string | null
  yearFrom: number | null
  yearTo: number | null
  variantKey: string
}

type PricingOverrideContext = {
  recordKey: string
  brandKey: string
  modelFamilyKey: string
  year: number
  variantKey: string
}

const includesYear = (
  override: PricingOverride,
  year: number,
): boolean => {
  if (override.yearFrom != null && year < override.yearFrom) return false
  if (override.yearTo != null && year > override.yearTo) return false
  return true
}

export const selectPricingOverride = <T extends PricingOverride>(
  overrides: T[],
  context: PricingOverrideContext,
): T | undefined => {
  const candidates = overrides.filter((override) => {
    if (override.variantKey !== context.variantKey) return false
    if (!includesYear(override, context.year)) return false
    if (override.templateRecordKey === context.recordKey) return true
    return (
      override.templateRecordKey == null &&
      override.brandKey === context.brandKey &&
      override.modelFamilyKey === context.modelFamilyKey
    )
  })

  return candidates.find(
    (override) => override.templateRecordKey === context.recordKey,
  ) ?? candidates[0]
}
