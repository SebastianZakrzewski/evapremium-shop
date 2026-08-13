import { describe, expect, it } from "vitest"
import { shouldShowVariantTunnelBonus } from "./variantTunnelBonus"

describe("shouldShowVariantTunnelBonus", () => {
  it("shows tunnel bonus for passenger car pricing", () => {
    expect(shouldShowVariantTunnelBonus("passenger_car")).toBe(true)
    expect(shouldShowVariantTunnelBonus("premium_passenger_car")).toBe(true)
  })

  it("hides tunnel bonus for commercial vehicle pricing", () => {
    expect(shouldShowVariantTunnelBonus("minivan")).toBe(false)
    expect(shouldShowVariantTunnelBonus("bus")).toBe(false)
    expect(shouldShowVariantTunnelBonus("pickup")).toBe(false)
    expect(shouldShowVariantTunnelBonus(undefined)).toBe(false)
  })
})
