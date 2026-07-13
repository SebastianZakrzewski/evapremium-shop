import { describe, expect, it } from "vitest"
import {
  getMatProductTitleLabel,
  getMatSetVariantLabel,
  isSinglePriceSetType,
} from "./mat-set-labels"

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
