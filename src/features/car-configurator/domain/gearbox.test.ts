import { describe, expect, it } from "vitest"
import {
  GEARBOX_AUTOMATIC,
  GEARBOX_MANUAL,
  GEARBOX_OPTIONS,
  getGearboxBitrixEnumId,
  getGearboxLabel,
  isGearbox,
} from "./gearbox"

describe("gearbox", () => {
  it("exposes automatic and manual options for the configurator", () => {
    expect(GEARBOX_OPTIONS.map((option) => option.value)).toEqual([
      GEARBOX_AUTOMATIC,
      GEARBOX_MANUAL,
    ])
  })

  it("accepts only configured gearbox values", () => {
    expect(isGearbox("Automatyczna")).toBe(true)
    expect(isGearbox("Manualna")).toBe(true)
    expect(isGearbox("automatic")).toBe(false)
    expect(isGearbox("")).toBe(false)
  })

  it("returns a display label for selected gearbox", () => {
    expect(getGearboxLabel(GEARBOX_AUTOMATIC)).toBe("Automatyczna")
    expect(getGearboxLabel(undefined)).toBe("")
  })

  it("maps gearbox to Bitrix enum ids", () => {
    expect(getGearboxBitrixEnumId(GEARBOX_MANUAL)).toBe(886)
    expect(getGearboxBitrixEnumId(GEARBOX_AUTOMATIC)).toBe(888)
    expect(getGearboxBitrixEnumId("")).toBeUndefined()
  })
})
