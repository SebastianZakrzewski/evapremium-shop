import { describe, expect, it } from "vitest"
import {
  CONFIGURATOR_BUS_VARIANT_KEYS,
  CONFIGURATOR_MINIVAN_VARIANT_KEYS,
  CONFIGURATOR_PASSENGER_BASE_VARIANT_KEYS,
  CONFIGURATOR_PASSENGER_PRICED_MINIVAN_VARIANT_KEYS,
} from "@/features/vehicle-catalog/domain/pricingRules"
import cennik from "@/data/evamats-cennik.normalized.json"
import {
  assertMatSetLabelConsistency,
  getMatSetVariantLabel,
  getMatProductTitleLabel,
  isSinglePriceSetType,
} from "./mat-set-labels"
import { isEnglishCatalogVariantLabel } from "./variant-label-catalog"

type PricingItem = {
  variant_key: string
  variant_label: string
}

const expectPolishLabel = (label: string, variantKey: string) => {
  expect(label.trim().length).toBeGreaterThan(0)
  expect(label).not.toBe(variantKey)
  expect(label.includes("_")).toBe(false)
  expect(isEnglishCatalogVariantLabel(label)).toBe(false)
}

describe("mat-set-labels", () => {
  it("detects single-price set type", () => {
    expect(isSinglePriceSetType("single")).toBe(true)
    expect(isSinglePriceSetType("classic")).toBe(false)
  })

  it("returns minivan variant label instead of raw key", () => {
    expect(
      getMatSetVariantLabel({
        setVariant: "row_2",
        pricingCategoryKey: "minivan",
      }),
    ).toBe("2 rzędy")
  })

  it("prefers canonical Polish label over English API label", () => {
    expect(
      getMatSetVariantLabel({
        setVariant: "row_3",
        setVariantLabel: "Row 3",
        pricingCategoryKey: "passenger_car",
        bodyTypeKey: "minivan",
      }),
    ).toBe("Przód + tył + 3 rząd")
  })

  it("uses variant name as product title for single-price vehicles", () => {
    expect(
      getMatProductTitleLabel({
        setType: "single",
        setVariant: "row_3",
        pricingCategoryKey: "minivan",
      }),
    ).toBe("3 rzędy")
  })
})

describe("mat-set-labels consistency across modules", () => {
  const passengerMinivanCases = CONFIGURATOR_PASSENGER_PRICED_MINIVAN_VARIANT_KEYS.map(
    (variantKey) => ({
      setType: "classic" as const,
      setVariant: variantKey,
      pricingCategoryKey: "passenger_car",
      bodyTypeKey: "minivan",
      pricingLabel: "Row 3",
    }),
  )

  const minivanCases = CONFIGURATOR_MINIVAN_VARIANT_KEYS.map((variantKey) => ({
    setType: "single" as const,
    setVariant: variantKey,
    pricingCategoryKey: "minivan",
    bodyTypeKey: "minivan",
    pricingLabel: "Row 3",
  }))

  const busCases = CONFIGURATOR_BUS_VARIANT_KEYS.map((variantKey) => ({
    setType: "single" as const,
    setVariant: variantKey,
    pricingCategoryKey: "bus",
    bodyTypeKey: "bus",
  }))

  const passengerCases = CONFIGURATOR_PASSENGER_BASE_VARIANT_KEYS.map((variantKey) => ({
    setType: "3d-with-rims" as const,
    setVariant: variantKey,
    pricingCategoryKey: "passenger_car",
    bodyTypeKey: "sedan",
  }))

  const allCases = [
    ...passengerCases,
    ...passengerMinivanCases,
    ...minivanCases,
    ...busCases,
  ]

  it.each(allCases)(
    "keeps cart label aligned with configurator for $setVariant ($pricingCategoryKey/$bodyTypeKey)",
    (context) => {
      const labels = assertMatSetLabelConsistency(context)
      expectPolishLabel(labels.cartLabel, context.setVariant)

      if (isSinglePriceSetType(context.setType)) {
        expect(labels.summaryTitle).toBe(labels.cartLabel)
      } else if (context.bodyTypeKey === "minivan") {
        expect(labels.summarySubtitle).toBe(labels.cartLabel)
      }
    },
  )
})

describe("mat-set-labels coverage for cennik sellable variants", () => {
  const segments = ["passenger_car", "minivan", "bus", "pickup"] as const

  for (const segment of segments) {
    const items = (cennik.categories as Record<string, { items: PricingItem[] }>)[
      segment
    ]?.items

    if (!items?.length) continue

    it(`resolves Polish labels for all ${segment} cennik variants`, () => {
      for (const item of items) {
        const label = getMatSetVariantLabel({
          setVariant: item.variant_key,
          pricingCategoryKey: segment,
          bodyTypeKey: segment === "passenger_car" ? "sedan" : segment,
          pricingLabel: item.variant_label,
        })

        expectPolishLabel(label, item.variant_key)
      }
    })
  }
})
