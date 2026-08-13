import { describe, expect, it } from "vitest"
import { buildConfiguratorEntryUrl } from "../buildConfiguratorEntryUrl"

describe("buildConfiguratorEntryUrl", () => {
  it("never includes year param", () => {
    const url = buildConfiguratorEntryUrl({
      brand: "BMW",
      model: "3 G20",
      generation: "2018-2026",
      bodyType: "sedan",
    })

    expect(url).toContain("brand=bmw")
    expect(url).toContain("model=3+G20")
    expect(url).toContain("generation=2018-2026")
    expect(url).toContain("bodyType=sedan")
    expect(url).not.toContain("year=")
  })

  it("supports brand-only entry", () => {
    expect(buildConfiguratorEntryUrl({ brand: "Audi" })).toBe("/konfigurator?brand=audi")
  })

  it("includes previewImage when provided", () => {
    const url = buildConfiguratorEntryUrl({
      brand: "Opel",
      model: "mokka",
      generation: "2012-2020",
      bodyType: "suv",
      previewImage: "/dywaniki/previews/opel-mokka-1-gen.png",
    })

    expect(url).toContain(
      "previewImage=%2Fdywaniki%2Fpreviews%2Fopel-mokka-1-gen.png",
    )
  })
})
