import { describe, expect, it } from "vitest"
import { getVariantPresentation } from "./variantPresentation"

const TWO_ROW_PASSENGER_IMAGES: Record<string, string> = {
  driver_mat: "/konfigurator/zestaw/2rzedy/kierowca.png",
  front: "/konfigurator/zestaw/2rzedy/przod.png",
  front_with_tunnel: "/konfigurator/zestaw/2rzedy/przod.png",
  front_without_tunnel: "/konfigurator/zestaw/2rzedy/przod.png",
  rear_only: "/konfigurator/zestaw/2rzedy/tyl.png",
  basic: "/konfigurator/zestaw/2rzedy/przod-tyl.png",
  premium: "/konfigurator/zestaw/2rzedy/przod-tyl-bagaznik.png",
  complete: "/konfigurator/zestaw/2rzedy/mata-bagaznika.png",
  front_trunk: "/konfigurator/zestaw/2rzedy/przod-tyl-bagaznik.png",
  front_rear_two_trunks: "/konfigurator/zestaw/2rzedy/przod-tyl-bagaznik.png",
}

const THREE_ROW_PASSENGER_IMAGES: Record<string, string> = {
  driver_mat: "/konfigurator/zestaw/3rzedy/kierowca.png",
  front: "/konfigurator/zestaw/3rzedy/przod.png",
  rear_only: "/konfigurator/zestaw/3rzedy/tyl.png",
  basic: "/konfigurator/zestaw/3rzedy/przod-tyl.png",
  premium: "/konfigurator/zestaw/3rzedy/przod-tyl-duzy-bagaznik.png",
  complete: "/konfigurator/zestaw/3rzedy/mata-bagaznika.png",
  row_3: "/konfigurator/zestaw/3rzedy/3rzedy.png",
  row_3_small_trunk_unfolded: "/konfigurator/zestaw/3rzedy/3rzedy-maly-bagaznik.png",
  row_3_large_trunk_folded: "/konfigurator/zestaw/3rzedy/3rzedy-duzy-bagaznik.png",
  row_3_two_trunks: "/konfigurator/zestaw/3rzedy/3rzedy-maly-i-duzy-bagaznik.png",
  front_rear_two_trunks: "/konfigurator/zestaw/3rzedy/przod-tyl-duzy-bagaznik.png",
}

describe("getVariantPresentation 2-row passenger graphics", () => {
  it("uses the new top-down overlays for front/rear passenger sets", () => {
    for (const [variantKey, image] of Object.entries(TWO_ROW_PASSENGER_IMAGES)) {
      expect(
        getVariantPresentation(variantKey, "passenger_car").image,
      ).toBe(image)
    }
  })

  it("does not replace minivan category graphics", () => {
    expect(getVariantPresentation("row_2", "minivan").image).toBe(
      "/minivan/2rzedy.png",
    )
    expect(getVariantPresentation("row_3", "minivan").image).toBe(
      "/minivan/3rzedy.png",
    )
  })
})

describe("getVariantPresentation 3-row passenger graphics", () => {
  it("uses 3-row overlays when seatRows is 3", () => {
    for (const [variantKey, image] of Object.entries(THREE_ROW_PASSENGER_IMAGES)) {
      expect(
        getVariantPresentation(variantKey, "passenger_car", "suv", {
          seatRows: 3,
        }).image,
      ).toBe(image)
    }
  })

  it("uses 3-row overlays when the offer includes a 3-row set", () => {
    expect(
      getVariantPresentation("front", "passenger_car", "suv", {
        offeredVariantKeys: ["front", "basic", "row_3"],
      }).image,
    ).toBe("/konfigurator/zestaw/3rzedy/przod.png")
  })

  it("uses 3-row overlays for minivan body on passenger_car pricing", () => {
    expect(
      getVariantPresentation("basic", "passenger_car", "minivan").image,
    ).toBe("/konfigurator/zestaw/3rzedy/przod-tyl.png")
    expect(
      getVariantPresentation("row_3_two_trunks", "passenger_car", "minivan").image,
    ).toBe("/konfigurator/zestaw/3rzedy/3rzedy-maly-i-duzy-bagaznik.png")
  })

  it("keeps 2-row overlays for passenger cars without 3 rows", () => {
    expect(
      getVariantPresentation("front", "passenger_car", "hatchback", {
        seatRows: 2,
      }).image,
    ).toBe("/konfigurator/zestaw/2rzedy/przod.png")
  })
})
