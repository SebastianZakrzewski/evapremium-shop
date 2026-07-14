import { describe, expect, it } from "vitest"
import { resolveSelectedPricingVariant } from "./resolveSelectedPricingVariant"

describe("resolveSelectedPricingVariant", () => {
  const variants = [
    {
      key: "front",
      label: "Starter",
      basePrice: 550,
      priceAfterDiscount: 440,
      discount: 110,
    },
    {
      key: "basic",
      label: "Podstawowy",
      basePrice: 700,
      priceAfterDiscount: 560,
      discount: 140,
    },
  ]

  it("returns null without variant key", () => {
    expect(resolveSelectedPricingVariant(variants, undefined)).toBeNull()
  })

  it("resolves variant from cached list", () => {
    expect(resolveSelectedPricingVariant(variants, "basic")).toEqual(variants[1])
  })

  it("returns null for unknown variant", () => {
    expect(resolveSelectedPricingVariant(variants, "premium")).toBeNull()
  })
})
