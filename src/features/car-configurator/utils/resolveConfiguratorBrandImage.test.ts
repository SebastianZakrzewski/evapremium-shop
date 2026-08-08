import { describe, expect, it } from "vitest"
import { resolveConfiguratorBrandImage } from "./resolveConfiguratorBrandImage"

describe("resolveConfiguratorBrandImage", () => {
  it("resolves brand placeholder from url slug", () => {
    expect(
      resolveConfiguratorBrandImage({
        brand: "alfa-romeo",
        brandParam: "alfa-romeo",
      }),
    ).toBe("/modele/alfa_romeo.jpg")
  })

  it("prefers brandKey when available", () => {
    expect(
      resolveConfiguratorBrandImage({
        brand: "BMW",
        brandKey: "bmw",
      }),
    ).toBe("/modele/bmw.png")
  })
})
