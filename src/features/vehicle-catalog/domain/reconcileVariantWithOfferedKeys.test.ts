import { describe, expect, it } from "vitest"
import { reconcileVariantWithOfferedKeys } from "./reconcileVariantWithOfferedKeys"

describe("reconcileVariantWithOfferedKeys", () => {
  it("keeps a variant that the selected mat type still offers", () => {
    expect(reconcileVariantWithOfferedKeys("front", ["front", "basic"])).toEqual({
      variant: "front",
      cleared: false,
    })
  })

  it("clears a variant the selected mat type does not offer", () => {
    expect(reconcileVariantWithOfferedKeys("front", ["basic"])).toEqual({
      variant: "",
      cleared: true,
    })
  })

  it("does nothing when no variant is selected", () => {
    expect(reconcileVariantWithOfferedKeys("", ["front"])).toEqual({
      variant: "",
      cleared: false,
    })
  })
})
