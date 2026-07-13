import { describe, expect, it } from "vitest"
import {
  resolveBitrixVariantEnumId,
  BITRIX_VARIANT_ENUM_BY_SEGMENT,
} from "./bitrixEnumIds"

describe("resolveBitrixVariantEnumId", () => {
  it("maps passenger car configurator variants", () => {
    expect(resolveBitrixVariantEnumId("passenger_car", "basic")).toBe(274)
    expect(resolveBitrixVariantEnumId("premium_passenger_car", "front")).toBe(270)
  })

  it("maps minivan and bus segment variants when enum artifact is present", () => {
    expect(BITRIX_VARIANT_ENUM_BY_SEGMENT.minivan?.front).toBe(270)
    expect(BITRIX_VARIANT_ENUM_BY_SEGMENT.bus?.row_1).toBe(1260)
    expect(BITRIX_VARIANT_ENUM_BY_SEGMENT.minivan?.row_2).toBe(1290)
  })

  it("returns undefined for unknown segment keys", () => {
    expect(resolveBitrixVariantEnumId("unknown_segment", "row_2")).toBeUndefined()
  })
})
