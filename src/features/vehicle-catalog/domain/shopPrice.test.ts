import { describe, expect, it } from "vitest"
import { applyShopBasePrice } from "./shopPrice"

describe("applyShopBasePrice", () => {
  const catalogDiscount = (base: number) =>
    base >= 910 ? Math.round(base * 0.7 * 100) / 100 : Math.round(base * 0.8 * 100) / 100

  it("keeps excluded matrix rows at shop list price", () => {
    expect(
      applyShopBasePrice(150, {
        base_price_pln: 150,
        price_after_discount_pln: 150,
        discount_excluded: true,
      }, catalogDiscount),
    ).toEqual({ basePrice: 150, priceAfterDiscount: 150, discount: 0 })
  })

  it("uses matrix after-discount when shop list matches matrix base", () => {
    expect(
      applyShopBasePrice(710, {
        base_price_pln: 710,
        price_after_discount_pln: 568,
        discount_excluded: false,
      }, catalogDiscount),
    ).toEqual({ basePrice: 710, priceAfterDiscount: 568, discount: 142 })
  })

  it("recalculates catalog discount when shop list differs from matrix", () => {
    expect(
      applyShopBasePrice(1810, {
        base_price_pln: 1010,
        price_after_discount_pln: 707,
        discount_excluded: false,
      }, catalogDiscount),
    ).toEqual({ basePrice: 1810, priceAfterDiscount: 1267, discount: 543 })
  })
})
