import { describe, expect, it } from "vitest"
import { resolveMobilePreviewDocked } from "./mobilePreviewDock"

describe("resolveMobilePreviewDocked", () => {
  it("keeps the carousel open until the options scroll down", () => {
    expect(resolveMobilePreviewDocked(0, false)).toBe(false)
    expect(resolveMobilePreviewDocked(24, false)).toBe(false)
    expect(resolveMobilePreviewDocked(41, false)).toBe(true)
  })

  it("reopens the carousel only after returning to the top", () => {
    expect(resolveMobilePreviewDocked(20, true)).toBe(true)
    expect(resolveMobilePreviewDocked(8, true)).toBe(false)
  })
})
