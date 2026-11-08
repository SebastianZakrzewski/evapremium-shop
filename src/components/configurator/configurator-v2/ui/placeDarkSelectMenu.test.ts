import { describe, expect, it } from "vitest"
import { placeDarkSelectMenu } from "./placeDarkSelectMenu"

const anchor = {
  top: 480,
  bottom: 524,
  left: 16,
  width: 320,
}

describe("placeDarkSelectMenu", () => {
  it("opens downward when the options pane has room below the field", () => {
    const placement = placeDarkSelectMenu(anchor, { top: 200, bottom: 760 }, 4)

    expect(placement.top).toBe(532)
    expect(placement.maxHeight).toBe(184)
    expect(placement.left).toBe(16)
    expect(placement.width).toBe(320)
  })

  it("opens upward when the field sits on the bottom edge of the pane", () => {
    const placement = placeDarkSelectMenu(anchor, { top: 80, bottom: 560 }, 8)

    expect(placement.top).toBeGreaterThanOrEqual(80)
    expect(placement.top + placement.maxHeight).toBeLessThanOrEqual(anchor.top)
    expect(placement.maxHeight).toBeGreaterThanOrEqual(44)
  })
})
