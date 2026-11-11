import { describe, expect, it } from "vitest"
import { summaryScrollTop } from "./alignCarSummary"

describe("summaryScrollTop", () => {
  it("places the summary just under the pinned image on the document", () => {
    expect(summaryScrollTop(500, 0, 600, 300)).toBe(800)
  })

  it("places the summary at the top of a desktop options column", () => {
    expect(summaryScrollTop(420, 80, 200, 0)).toBe(540)
  })

  it("does not scroll above zero", () => {
    expect(summaryScrollTop(40, 0, 0, 300)).toBe(0)
  })
})
