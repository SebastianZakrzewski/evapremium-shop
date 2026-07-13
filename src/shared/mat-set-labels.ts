import {
  getCanonicalVariantLabel,
  getVariantPresentation,
} from "@/components/configurator/configurator-simple/variantPresentation"
import type { MatConfiguration } from "@/features/vehicle-catalog/model/matConfiguration"
import {
  getPolishVariantLabelFallback,
  isEnglishCatalogVariantLabel,
} from "./variant-label-catalog"

export type MatSetLabelContext = {
  setType?: MatConfiguration["setType"] | string
  setVariant?: string
  setVariantLabel?: string
  pricingCategoryKey?: string
  bodyTypeKey?: string
  pricingLabel?: string
  bitrixVariantLabel?: string
}

export const isSinglePriceSetType = (
  setType?: string,
): boolean => setType === "single"

export const MAT_TYPE_LABELS: Record<string, string> = {
  "3d-with-rims": "3D z rantami",
  classic: "3D bez rantów",
}

export const getMatTypeLabel = (setType?: string): string => {
  if (!setType) return ""
  if (isSinglePriceSetType(setType)) return ""
  return MAT_TYPE_LABELS[setType] ?? setType
}

const resolveStoredVariantLabel = (
  context: MatSetLabelContext,
): string | null => {
  const candidates = [
    context.setVariantLabel,
    context.bitrixVariantLabel,
    context.pricingLabel,
  ]

  for (const candidate of candidates) {
    const trimmed = candidate?.trim()
    if (!trimmed) continue
    if (
      context.setVariant &&
      isEnglishCatalogVariantLabel(trimmed, context.setVariant)
    ) {
      continue
    }
    return trimmed
  }

  return null
}

export const getMatSetVariantLabel = (
  context: MatSetLabelContext,
): string => {
  if (!context.setVariant) return ""

  const canonical = getCanonicalVariantLabel(
    context.setVariant,
    context.pricingCategoryKey,
    context.bodyTypeKey,
  )
  if (canonical) return canonical

  const polishFallback = getPolishVariantLabelFallback(context.setVariant)
  if (polishFallback) return polishFallback

  const stored = resolveStoredVariantLabel(context)
  if (stored) return stored

  return context.setVariant
}

/** Etykieta zapisywana w koszyku / zamówieniu — zawsze po polsku */
export const resolvePersistedMatSetVariantLabel = (
  context: MatSetLabelContext,
): string => getMatSetVariantLabel(context)

/** Główna etykieta produktu w podsumowaniu / zamówieniu */
export const getMatProductTitleLabel = (context: MatSetLabelContext): string => {
  if (isSinglePriceSetType(context.setType)) {
    return getMatSetVariantLabel(context)
  }

  const matTypeLabel = getMatTypeLabel(context.setType)
  if (matTypeLabel) return matTypeLabel

  return getMatSetVariantLabel(context)
}

/** Podtytuł produktu — opis wariantu lub wariant przy typie dual */
export const getMatProductSubtitleLabel = (
  context: MatSetLabelContext,
): string => {
  if (!context.setVariant) return ""

  if (isSinglePriceSetType(context.setType)) {
    return getVariantPresentation(
      context.setVariant,
      context.pricingCategoryKey,
      context.bodyTypeKey,
    ).description
  }

  return getMatSetVariantLabel(context)
}

export const getMatConfigurationLabelContext = (
  config: MatConfiguration,
): MatSetLabelContext => ({
  setType: config.setType,
  setVariant: config.setVariant,
  setVariantLabel: config.setVariantLabel,
  pricingCategoryKey: config.pricing?.pricingCategoryKey,
  bodyTypeKey: config.carDetails.bodyTypeKey,
  bitrixVariantLabel: config.bitrix?.variantLabel,
})

/** Spójność podsumowania konfiguratora i koszyka dla tego samego kontekstu */
export const assertMatSetLabelConsistency = (
  context: MatSetLabelContext,
): { summaryTitle: string; summarySubtitle: string; cartLabel: string } => {
  const cartLabel = getMatSetVariantLabel(context)
  const summaryTitle = getMatProductTitleLabel(context)
  const summarySubtitle = getMatProductSubtitleLabel(context)

  return { summaryTitle, summarySubtitle, cartLabel }
}
