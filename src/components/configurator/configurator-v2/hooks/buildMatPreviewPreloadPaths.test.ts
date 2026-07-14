import { describe, expect, it } from "vitest"
import { buildMatPreviewPreloadPaths } from "./buildMatPreviewPreloadPaths"

describe("buildMatPreviewPreloadPaths", () => {
  it("returns empty list without variant or structure", () => {
    expect(
      buildMatPreviewPreloadPaths({
        matType: "3d-with-rims",
        pricingCategoryKey: "passenger_car",
        structure: "diamonds",
        color: "black",
        edgeColor: "black",
        variant: "",
      }),
    ).toEqual([])
  })

  it("includes current color combo and material variants for edge", () => {
    const paths = buildMatPreviewPreloadPaths({
      matType: "3d-with-rims",
      pricingCategoryKey: "passenger_car",
      structure: "diamonds",
      color: "black",
      edgeColor: "red",
      variant: "basic",
    })

    expect(paths).toContain(
      "/dywaniki/3d/diamonds/red/5os-3d-diamonds-black-red.webp",
    )
    expect(paths).toContain(
      "/dywaniki/3d/diamonds/red/5os-3d-diamonds-red-red.webp",
    )
    expect(paths.length).toBeGreaterThan(3)
  })
})
