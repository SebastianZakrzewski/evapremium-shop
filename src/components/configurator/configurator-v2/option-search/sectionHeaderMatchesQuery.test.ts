import { describe, expect, it } from "vitest"
import { sectionHeaderMatchesQuery } from "./sectionHeaderMatchesQuery"

describe("sectionHeaderMatchesQuery", () => {
  it("matches every header when the query is empty", () => {
    expect(sectionHeaderMatchesQuery("Kolor materiału", "  ")).toBe(true)
  })

  it("matches a header regardless of case and Polish characters", () => {
    expect(sectionHeaderMatchesQuery("Kolor obszycia", "OBSZY")).toBe(true)
    expect(sectionHeaderMatchesQuery("Wariant zestawu", "kolor")).toBe(false)
  })
})
