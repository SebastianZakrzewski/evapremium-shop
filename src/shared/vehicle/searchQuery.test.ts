import { describe, expect, it } from "vitest"
import {
  normalizeSearchToken,
  normalizeVehicleSearchQuery,
  toComparableSearchQuery,
} from "./searchQuery"

describe("searchQuery normalization", () => {
  it("treats upper and lower case as equivalent", () => {
    expect(toComparableSearchQuery("DACIA DUSTER")).toBe(
      toComparableSearchQuery("dacia duster"),
    )
    expect(toComparableSearchQuery("Renault KADJAR")).toBe(
      toComparableSearchQuery("renault kadjar"),
    )
  })

  it("strips diacritics for accent-insensitive matching", () => {
    expect(normalizeSearchToken("Citroën")).toBe("citroen")
    expect(normalizeSearchToken("CITROËN")).toBe("citroen")
  })

  it("preserves user spacing while trimming edges", () => {
    expect(normalizeVehicleSearchQuery("  Dacia   Duster  ")).toBe("Dacia   Duster")
    expect(toComparableSearchQuery("  Dacia   Duster  ")).toBe("dacia duster")
  })
})
