import { describe, expect, it } from "vitest"
import { enrichCarContextFromModel } from "../enrichCarContextFromModel"

describe("enrichCarContextFromModel", () => {
  it("returns generation and bodyType when unambiguous, never year", () => {
    const result = enrichCarContextFromModel("3 G20", {
      getYearsForModel: () => [2026, 2025],
      getBodyTypesForYear: () => ["sedan"],
      findGenerationByYear: () => "2018-2026",
    })

    expect(result).toEqual({
      generation: "2018-2026",
      bodyType: "sedan",
    })
    expect(result).not.toHaveProperty("year")
  })

  it("omits bodyType when multiple options exist for the year", () => {
    const result = enrichCarContextFromModel("3 E-46", {
      getYearsForModel: () => [2005, 2004],
      getBodyTypesForYear: () => ["kombi", "cabrio"],
      findGenerationByYear: () => "1998-2005",
    })

    expect(result.generation).toBe("1998-2005")
    expect(result.bodyType).toBeNull()
  })
})
