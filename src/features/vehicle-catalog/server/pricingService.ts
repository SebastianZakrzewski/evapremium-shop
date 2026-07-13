import {
  filterSellableVariantKeys,
  selectPricingOverride,
} from "../domain/pricingRules"
import type { PricingResolveInput, PricingVariantOption } from "../model/schemas"
import { getMatTemplateByRecordKey } from "./repository"
import {
  getActivePricingCatalog,
  getCategoryPricingRows,
  getPricingCategory,
  getPricingOverrides,
  getVariantsByKeys,
} from "./pricingRepository"

type RawOverride = Awaited<ReturnType<typeof getPricingOverrides>>[number]
type CategoryPricingRows = Awaited<ReturnType<typeof getCategoryPricingRows>>

const calculateDiscountedPrice = (
  basePrice: number,
  catalog: Awaited<ReturnType<typeof getActivePricingCatalog>>,
): number => {
  const threshold = Number(catalog.discount_threshold_pln)
  const rate =
    basePrice >= threshold
      ? Number(catalog.discount_rate_from)
      : Number(catalog.discount_rate_below)
  return Math.round(basePrice * (1 - rate) * 100) / 100
}

const toOverride = (row: RawOverride) => ({
  row,
  templateRecordKey: row.template_record_key,
  brandKey: row.brand_key,
  modelFamilyKey: row.model_family_key,
  yearFrom: row.year_from,
  yearTo: row.year_to,
  variantKey: row.variant_key,
})

const loadOverrideCategoryRows = async (
  catalogId: string,
  overrides: ReturnType<typeof toOverride>[],
): Promise<Map<string, CategoryPricingRows & { pricing_model: string }>> => {
  const slugs = [
    ...new Set(
      overrides
        .map((override) => override.row.override_category_slug)
        .filter((slug): slug is string => typeof slug === "string" && slug.length > 0),
    ),
  ]

  const rowsBySlug = new Map<string, CategoryPricingRows & { pricing_model: string }>()
  await Promise.all(
    slugs.map(async (slug) => {
      const category = await getPricingCategory(slug)
      const rows = await getCategoryPricingRows(catalogId, category.id)
      rowsBySlug.set(slug, { ...rows, pricing_model: category.pricing_model })
    }),
  )

  return rowsBySlug
}

export const resolveVehiclePricing = async (input: PricingResolveInput) => {
  const template = await getMatTemplateByRecordKey(input.recordKey)
  if (!template) throw new Error("Vehicle template not found")

  const yearMatches =
    (template.year_from == null || input.year >= template.year_from) &&
    (template.year_to == null || input.year <= template.year_to)
  if (!yearMatches) throw new Error("Selected year does not match the template")

  const bodyTypeKeys = [
    template.body_type_1_key,
    template.body_type_2_key,
    template.body_type_3_key,
  ].filter(Boolean)
  if (!bodyTypeKeys.includes(input.bodyTypeKey)) {
    throw new Error("Selected body type does not match the template")
  }

  const catalog = await getActivePricingCatalog()
  const category = await getPricingCategory(
    template.dealer_pricing_category_key,
  )
  const [categoryRows, rawOverrides] = await Promise.all([
    getCategoryPricingRows(catalog.id, category.id),
    getPricingOverrides(catalog.id),
  ])
  const overrides = rawOverrides.map(toOverride)
  const matchingOverrides = overrides.filter((override) =>
    selectPricingOverride([override], {
      recordKey: template.record_key,
      brandKey: template.brand_key,
      modelFamilyKey: template.model_family_key,
      year: input.year,
      variantKey: override.variantKey,
    }),
  )
  const overrideCategoryRows = await loadOverrideCategoryRows(
    catalog.id,
    matchingOverrides,
  )

  const categoryVariantKeys = categoryRows.variants.map(
    (variant) => variant.variant_key,
  )
  const overrideVariantKeys = matchingOverrides.map(
    (override) => override.variantKey,
  )
  const allVariantKeys = filterSellableVariantKeys(
    [...new Set([...categoryVariantKeys, ...overrideVariantKeys])],
    category.pricing_model,
    category.slug,
    input.bodyTypeKey,
  )
  const missingVariantKeys = overrideVariantKeys.filter(
    (key) => !categoryVariantKeys.includes(key),
  )
  const extraVariants = await getVariantsByKeys(missingVariantKeys)
  const variantDictionary = new Map(
    [...categoryRows.variants, ...extraVariants].map((variant) => [
      variant.variant_key,
      variant,
    ]),
  )

  for (const rows of overrideCategoryRows.values()) {
    rows.variants.forEach((variant) => {
      if (!variantDictionary.has(variant.variant_key)) {
        variantDictionary.set(variant.variant_key, variant)
      }
    })
  }

  const availableMatTypes =
    category.pricing_model === "single_price"
      ? (["single"] as const)
      : (["3d-with-rims", "classic"] as const)
  const effectiveMatType =
    category.pricing_model === "single_price" ? "single" : input.matType

  const variants: PricingVariantOption[] = effectiveMatType
    ? allVariantKeys.flatMap((variantKey) => {
        const override = selectPricingOverride(matchingOverrides, {
          recordKey: template.record_key,
          brandKey: template.brand_key,
          modelFamilyKey: template.model_family_key,
          year: input.year,
          variantKey,
        })?.row
        const variant = variantDictionary.get(variantKey)
        const overridePricingRows =
          override?.override_category_slug != null
            ? overrideCategoryRows.get(override.override_category_slug)
            : undefined
        const pricingRows = overridePricingRows ?? categoryRows
        const pricingMatType =
          overridePricingRows?.pricing_model === "single_price"
            ? "single"
            : effectiveMatType
        const matrix = pricingRows.matrices.find(
          (row) =>
            row.variant_id === variant?.id &&
            row.mat_type === pricingMatType,
        )
        if (!variant || (!matrix && override?.fixed_base_price_pln == null)) {
          return []
        }

        const basePrice = Number(
          override?.fixed_base_price_pln ?? matrix?.base_price_pln,
        )
        const matrixPrice = matrix?.price_after_discount_pln
        const discountedPrice =
          override?.fixed_base_price_pln != null
            ? calculateDiscountedPrice(basePrice, catalog)
            : matrixPrice != null
              ? Number(matrixPrice)
              : matrix?.discount_excluded
                ? basePrice
                : calculateDiscountedPrice(basePrice, catalog)
        const finalPrice =
          Math.round(
            (discountedPrice + Number(override?.surcharge_pln ?? 0)) * 100,
          ) / 100

        return [{
          key: variantKey,
          label: variant.variant_label,
          basePrice,
          priceAfterDiscount: finalPrice,
          discount: Math.max(0, Math.round((basePrice - finalPrice) * 100) / 100),
        }]
      })
    : []

  const selectedVariant = input.variantKey
    ? variants.find((variant) => variant.key === input.variantKey)
    : undefined
  if (input.variantKey && !selectedVariant) {
    throw new Error("Selected pricing variant is not available")
  }

  const selectedOverride = input.variantKey
    ? selectPricingOverride(matchingOverrides, {
        recordKey: template.record_key,
        brandKey: template.brand_key,
        modelFamilyKey: template.model_family_key,
        year: input.year,
        variantKey: input.variantKey,
      })?.row
    : undefined

  return {
    recordKey: template.record_key,
    templateId: template.id,
    pricingCategoryKey:
      selectedOverride?.override_category_slug ?? category.slug,
    catalogVersionCode: catalog.code,
    availableMatTypes,
    matType: effectiveMatType ?? null,
    variants,
    selectedVariant: selectedVariant ?? null,
  }
}
