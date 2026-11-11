import { describe, expect, it } from "vitest"
import { HEADER_SHOW_AFTER_PX, initialHeaderScroll, nextHeaderScroll } from "./headerScroll"

const maxY = 2000
const nav = 64

describe("nextHeaderScroll", () => {
  it("ignores overscroll above and below the document", () => {
    const shown = initialHeaderScroll(100)
    expect(nextHeaderScroll(shown, -30, maxY, nav)).toEqual(shown)
    const hidden = { ...shown, hidden: true }
    expect(nextHeaderScroll(hidden, maxY + 40, maxY, nav)).toEqual(hidden)
  })

  it("hides only after a downward run, and stays hidden through a short scroll up", () => {
    let state = initialHeaderScroll(80)
    state = nextHeaderScroll(state, 90, maxY, nav)
    expect(state.hidden).toBe(false)
    state = nextHeaderScroll(state, 104, maxY, nav)
    expect(state.hidden).toBe(true)
    state = nextHeaderScroll(state, 104 - (HEADER_SHOW_AFTER_PX - 4), maxY, nav)
    expect(state.hidden).toBe(true)
  })

  it("shows again only after about 36px of upward travel", () => {
    let state = { ...initialHeaderScroll(200), hidden: true }
    state = nextHeaderScroll(state, 200 - HEADER_SHOW_AFTER_PX, maxY, nav)
    expect(state.hidden).toBe(false)
  })

  it("always shows at the top of the page", () => {
    const hidden = { ...initialHeaderScroll(40), hidden: true }
    expect(nextHeaderScroll(hidden, 0, maxY, nav).hidden).toBe(false)
  })
})
