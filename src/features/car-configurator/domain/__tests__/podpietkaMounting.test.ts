import { describe, expect, it } from "vitest"
import {
  PODPIETKA_MOUNTING_PRICE,
  getPodpietkaMountingBitrixLabel,
  getPodpietkaMountingFee,
  getPodpietkaMountingLabel,
  getPodpietkaTotalPrice,
  isPodpietkaMounting,
} from "../podpietkaMounting"

describe("podpietkaMounting", () => {
  it("recognizes valid mounting values", () => {
    expect(isPodpietkaMounting("professional")).toBe(true)
    expect(isPodpietkaMounting("self")).toBe(true)
    expect(isPodpietkaMounting("other")).toBe(false)
    expect(isPodpietkaMounting(undefined)).toBe(false)
  })

  it("returns 10 zł fee for professional mounting and 0 otherwise", () => {
    expect(getPodpietkaMountingFee("professional")).toBe(PODPIETKA_MOUNTING_PRICE)
    expect(getPodpietkaMountingFee("self")).toBe(0)
    expect(getPodpietkaMountingFee(undefined)).toBe(0)
    expect(getPodpietkaMountingFee(null)).toBe(0)
  })

  it("adds mounting fee to accessory base price", () => {
    expect(getPodpietkaTotalPrice(40, "professional")).toBe(50)
    expect(getPodpietkaTotalPrice(40, "self")).toBe(40)
    expect(getPodpietkaTotalPrice(40)).toBe(40)
  })

  it("returns Polish labels for UI and Bitrix", () => {
    expect(getPodpietkaMountingLabel("professional")).toContain("Montaż przez nas")
    expect(getPodpietkaMountingLabel("self")).toContain("indywidualny")
    expect(getPodpietkaMountingBitrixLabel("professional")).toContain("przez nas")
    expect(getPodpietkaMountingBitrixLabel("self")).toContain("indywidualny")
    expect(getPodpietkaMountingLabel()).toBe("")
  })
})
