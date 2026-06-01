import { describe, it, expect } from "vitest"
import { getProductEntryLock, parseYearFromGeneration } from "./productEntryContext"

describe("getProductEntryLock", () => {
  it("locks when brand and model are in URL", () => {
    const params = new URLSearchParams("brand=dacia&model=duster")
    expect(getProductEntryLock(params).isLocked).toBe(true)
  })

  it("does not lock without model", () => {
    const params = new URLSearchParams("brand=dacia")
    expect(getProductEntryLock(params).isLocked).toBe(false)
  })
})

describe("parseYearFromGeneration", () => {
  it("parses closed range", () => {
    expect(parseYearFromGeneration("2012-2020")).toBe(2012)
  })

  it("parses open range", () => {
    expect(parseYearFromGeneration("2021+")).toBe(2021)
  })
})
