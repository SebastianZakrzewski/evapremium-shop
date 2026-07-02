import { describe, expect, it } from "vitest"
import {
  formatPriceCurrency,
  formatPricePln,
  formatPriceValue,
} from "../formatPrice"

describe("formatPrice", () => {
  it("formats values with Polish decimal separator", () => {
    expect(formatPriceValue(440)).toBe("440,00")
    expect(formatPriceValue(1234.5)).toBe("1234,50")
  })

  it("formats PLN labels", () => {
    expect(formatPricePln(440)).toBe("440,00 zł")
    expect(formatPriceCurrency(299.99)).toBe("299,99 PLN")
  })

  it("handles invalid values", () => {
    expect(formatPriceValue(null)).toBe("0,00")
    expect(formatPriceValue(undefined)).toBe("0,00")
  })
})
