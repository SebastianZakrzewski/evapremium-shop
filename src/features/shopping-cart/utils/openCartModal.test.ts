import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { openCartModal } from "./openCartModal"

describe("openCartModal", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("dispatches openCartModal on the next tick", () => {
    const handler = vi.fn()
    window.addEventListener("openCartModal", handler)

    openCartModal()
    expect(handler).not.toHaveBeenCalled()

    vi.runAllTimers()
    expect(handler).toHaveBeenCalledTimes(1)

    window.removeEventListener("openCartModal", handler)
  })
})
