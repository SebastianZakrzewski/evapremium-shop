import { describe, expect, it } from "vitest"
import {
  bodyTypeMatchesParam,
  brandParamToCatalogKey,
  resolveCatalogBrandKey,
  resolveModelFamiliesFromParam,
} from "./catalogKeys"

const brands = [
  { key: "renault", name: "Renault" },
  { key: "bmw", name: "BMW" },
  { key: "alfa_romeo", name: "Alfa Romeo" },
]

const rawAlfaBrands = [{ key: "Alfa Romeo", name: "Alfa Romeo" }]

const renaultModels = [
  { key: "espace_4_gen", name: "espace_4_gen" },
  { key: "espace_5_gen", name: "espace_5_gen" },
  { key: "espace_6_gen", name: "espace_6_gen" },
  { key: "espace_grand_4_gen", name: "espace_grand_4_gen" },
]

describe("brandParamToCatalogKey", () => {
  it("maps hyphenated URL slug to underscore catalog key", () => {
    expect(brandParamToCatalogKey("alfa-romeo")).toBe("alfa_romeo")
  })

  it("maps spaced brand name to underscore catalog key", () => {
    expect(brandParamToCatalogKey("Alfa Romeo")).toBe("alfa_romeo")
  })

  it("maps mercedes slug to mercedes_benz catalog key", () => {
    expect(brandParamToCatalogKey("mercedes")).toBe("mercedes_benz")
  })
})

describe("resolveCatalogBrandKey", () => {
  it("resolves alfa-romeo URL param to alfa_romeo catalog key", () => {
    expect(resolveCatalogBrandKey("alfa-romeo", null, brands)).toBe("alfa_romeo")
  })

  it("resolves alfa-romeo slug to raw Excel brand_key Alfa Romeo", () => {
    expect(resolveCatalogBrandKey("alfa-romeo", null, rawAlfaBrands)).toBe(
      "Alfa Romeo",
    )
  })

  it("resolves aston-martin slug to raw brand_key with space", () => {
    const rawBrands = [{ key: "Aston Martin", name: "Aston Martin" }]
    expect(resolveCatalogBrandKey("aston-martin", null, rawBrands)).toBe(
      "Aston Martin",
    )
  })

  it("resolves raw brand name with trailing space in catalog", () => {
    const rawBrands = [
      { key: "Citroen ", name: "Citroen " },
      { key: "BMW", name: "BMW" },
    ]
    expect(resolveCatalogBrandKey("citroen", null, rawBrands)).toBe("Citroen ")
  })

  it("maps display name stored in localStorage to catalog slug", () => {
    expect(resolveCatalogBrandKey("renault", "Renault", brands)).toBe("renault")
  })

  it("prefers a valid stored slug over URL param", () => {
    expect(resolveCatalogBrandKey("bmw", "renault", brands)).toBe("renault")
  })

  it("falls back to URL slug when stored key is invalid", () => {
    expect(resolveCatalogBrandKey("renault", "Renault", [])).toBe("renault")
  })
})

describe("bodyTypeMatchesParam", () => {
  it("matches suv_7_seater label to suv catalog key", () => {
    expect(
      bodyTypeMatchesParam({ key: "suv", label: "suv_7_seater" }, "suv_7_seater"),
    ).toBe(true)
  })

  it("matches minivan label to minivan key", () => {
    expect(
      bodyTypeMatchesParam({ key: "minivan", label: "minivan" }, "minivan"),
    ).toBe(true)
  })

  it("does not match minivan param to suv body type", () => {
    expect(
      bodyTypeMatchesParam({ key: "suv", label: "suv_7_seater" }, "minivan"),
    ).toBe(false)
  })
})

describe("resolveModelFamiliesFromParam", () => {
  it("resolves raw Excel model label exactly (S4 B6)", () => {
    const audiModels = [
      { key: "S4 (B6) 2 gen", name: "S4 (B6) 2 gen" },
      { key: "S4(B6) 2 gen", name: "S4(B6) 2 gen" },
    ]
    const result = resolveModelFamiliesFromParam("S4 (B6) 2 gen", audiModels)
    expect(result.mode).toBe("single")
    if (result.mode === "single") {
      expect(result.family.key).toBe("S4 (B6) 2 gen")
    }
  })

  it("resolves espace_grand to espace_grand_4_gen", () => {
    const result = resolveModelFamiliesFromParam("espace_grand", renaultModels)
    expect(result.mode).toBe("single")
    if (result.mode === "single") {
      expect(result.family.key).toBe("espace_grand_4_gen")
      expect(result.displayName).toBe("Espace Grand")
    }
  })

  it("returns prefix mode for generic espace param", () => {
    const result = resolveModelFamiliesFromParam("espace", renaultModels)
    expect(result.mode).toBe("prefix")
    if (result.mode === "prefix") {
      expect(result.families).toHaveLength(3)
      expect(result.prefix).toBe("espace")
    }
  })

  it("returns none for unknown model token", () => {
    expect(resolveModelFamiliesFromParam("clio", renaultModels).mode).toBe("none")
  })
})
