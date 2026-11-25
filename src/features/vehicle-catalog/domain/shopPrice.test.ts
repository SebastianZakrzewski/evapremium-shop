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

  it("prices the 3D driver mat at 289 with no discount for pickup and passenger, and 289 to 231.20 for minivan", () => {
    const listWithoutDiscount = {
      base_price_pln: 289,
      price_after_discount_pln: null,
      discount_excluded: true,
    }
    const minivanMatrix = {
      base_price_pln: 350,
      price_after_discount_pln: 280,
      discount_excluded: false,
    }
    const pickup = applyShopBasePrice(289, listWithoutDiscount, catalogDiscount)
    const passenger = applyShopBasePrice(289, listWithoutDiscount, catalogDiscount)
    const minivan = applyShopBasePrice(289, minivanMatrix, catalogDiscount)

    expect(pickup).toEqual({ basePrice: 289, priceAfterDiscount: 289, discount: 0 })
    expect(passenger).toEqual({ basePrice: 289, priceAfterDiscount: 289, discount: 0 })
    expect(minivan).toEqual({
      basePrice: 289,
      priceAfterDiscount: 231.2,
      discount: 57.8,
    })
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
