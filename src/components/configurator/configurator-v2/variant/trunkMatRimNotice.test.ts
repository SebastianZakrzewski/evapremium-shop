import { describe, expect, it } from "vitest"
import {
  shouldShowVariantTrunkMatRimNotice,
  VARIANT_TRUNK_MAT_RIM_NOTICE_ICON_SRC,
  variantIncludesTrunkMat,
} from "./trunkMatRimNotice"

describe("trunk mat rim notice assets", () => {
  it("uses the trunk mat product photo", () => {
    expect(VARIANT_TRUNK_MAT_RIM_NOTICE_ICON_SRC).toBe(
      "/konfigurator/zestaw/mata-bagaznika-produkt.jpg",
    )
  })
})

describe("variantIncludesTrunkMat", () => {
  it("treats trunk-only and complete-set keys as including a trunk mat", () => {
    expect(variantIncludesTrunkMat("complete")).toBe(true)
    expect(variantIncludesTrunkMat("premium")).toBe(true)
    expect(variantIncludesTrunkMat("trunk_mat_small")).toBe(true)
    expect(variantIncludesTrunkMat("front_trunk")).toBe(true)
    expect(variantIncludesTrunkMat("row_3_two_trunks")).toBe(true)
  })

  it("excludes cabin-only sets", () => {
    expect(variantIncludesTrunkMat("front")).toBe(false)
    expect(variantIncludesTrunkMat("basic")).toBe(false)
    expect(variantIncludesTrunkMat("row_3")).toBe(false)
    expect(variantIncludesTrunkMat("")).toBe(false)
    expect(variantIncludesTrunkMat(undefined)).toBe(false)
  })
})

describe("shouldShowVariantTrunkMatRimNotice", () => {
  it("shows after selecting a trunk set with 3D z rantami", () => {
    expect(
      shouldShowVariantTrunkMatRimNotice({
        matType: "3d-with-rims",
        variantKey: "complete",
      }),
    ).toBe(true)
    expect(
      shouldShowVariantTrunkMatRimNotice({
        matType: "3d-with-rims",
        variantKey: "premium",
      }),
    ).toBe(true)
  })

  it("hides for cabin-only sets or 3D bez rantów", () => {
    expect(
      shouldShowVariantTrunkMatRimNotice({
        matType: "3d-with-rims",
        variantKey: "basic",
      }),
    ).toBe(false)
    expect(
      shouldShowVariantTrunkMatRimNotice({
        matType: "classic",
        variantKey: "complete",
      }),
    ).toBe(false)
    expect(
      shouldShowVariantTrunkMatRimNotice({
        matType: "3d-with-rims",
        variantKey: "",
      }),
    ).toBe(false)
  })
})
