import { describe, expect, it } from "vitest"
import { CatalogQuerySchema } from "./schemas"

describe("CatalogQuerySchema", () => {
  it("preserves trailing spaces in raw model family keys from Excel", () => {
    const parsed = CatalogQuerySchema.parse({
      brandKey: "alpine",
      modelFamilyKey: "A290 1 gen ",
    })

    expect(parsed.modelFamilyKey).toBe("A290 1 gen ")
  })

  it("preserves trailing spaces in model family prefix", () => {
    const parsed = CatalogQuerySchema.parse({
      brandKey: "Alpine ",
      modelFamilyPrefix: "A290 ",
    })

    expect(parsed.brandKey).toBe("Alpine")
    expect(parsed.modelFamilyPrefix).toBe("A290 ")
  })
})
