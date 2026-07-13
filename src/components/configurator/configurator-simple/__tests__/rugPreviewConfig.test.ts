import { describe, expect, it } from "vitest"
import {
  canShowRugSidebarPreview,
  getMatTypeForDynamicPreview,
  usesClassicOnlyDynamicPreview,
} from "../rugPreviewConfig"

describe("usesClassicOnlyDynamicPreview", () => {
  it("returns true for single mat type", () => {
    expect(usesClassicOnlyDynamicPreview("single")).toBe(true)
  })

  it("returns true for minivan pricing category", () => {
    expect(usesClassicOnlyDynamicPreview("classic", "minivan")).toBe(true)
  })

  it("returns false for passenger car dual mat types", () => {
    expect(usesClassicOnlyDynamicPreview("3d-with-rims", "passenger_car")).toBe(
      false,
    )
  })
})

describe("canShowRugSidebarPreview", () => {
  it("allows dynamic preview for single mat type from step 2", () => {
    expect(canShowRugSidebarPreview(2, "single")).toBe(true)
  })

  it("blocks preview before mat type is chosen", () => {
    expect(canShowRugSidebarPreview(2, "")).toBe(false)
  })
})

describe("getMatTypeForDynamicPreview", () => {
  it("uses classic images for minivan single-price vehicles", () => {
    expect(getMatTypeForDynamicPreview("single", "minivan")).toBe("classic")
  })

  it("uses 3d images for vehicles with rims option", () => {
    expect(getMatTypeForDynamicPreview("3d-with-rims", "passenger_car")).toBe(
      "3d",
    )
  })
})
