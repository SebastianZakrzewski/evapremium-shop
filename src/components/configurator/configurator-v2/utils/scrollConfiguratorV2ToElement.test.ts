import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import {
  scrollConfiguratorV2ToElement,
  scrollConfiguratorV2ToElementWhenReady,
} from "./scrollConfiguratorV2ToElement"

describe("scrollConfiguratorV2ToElement", () => {
  beforeEach(() => {
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      cb(0)
      return 1
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("scrolls the configurator main container to the target element", () => {
    const main = document.createElement("main")
    const target = document.createElement("section")
    target.id = "section-summary"
    main.appendChild(target)
    document.body.appendChild(main)

    main.scrollTo = vi.fn()
    Object.defineProperty(main, "scrollTop", { value: 100, writable: true })
    target.getBoundingClientRect = () =>
      ({ top: 420, bottom: 500, left: 0, right: 0, width: 0, height: 80 }) as DOMRect
    main.getBoundingClientRect = () =>
      ({ top: 120, bottom: 800, left: 0, right: 0, width: 0, height: 680 }) as DOMRect

    const didScroll = scrollConfiguratorV2ToElement("section-summary", { offset: 12 })

    expect(didScroll).toBe(true)
    expect(main.scrollTo).toHaveBeenCalledWith({
      top: 388,
      behavior: "smooth",
    })

    document.body.removeChild(main)
  })

  it("accounts for main padding when alignToContentStart is enabled", () => {
    const main = document.createElement("main")
    const target = document.createElement("h2")
    target.id = "summary-order-heading"
    main.appendChild(target)
    document.body.appendChild(main)

    main.scrollTo = vi.fn()
    Object.defineProperty(main, "scrollTop", { value: 200, writable: true })
    target.getBoundingClientRect = () =>
      ({ top: 520, bottom: 560, left: 0, right: 0, width: 0, height: 40 }) as DOMRect
    main.getBoundingClientRect = () =>
      ({ top: 64, bottom: 800, left: 0, right: 0, width: 0, height: 736 }) as DOMRect
  vi.spyOn(window, "getComputedStyle").mockReturnValue({
      paddingTop: "304px",
    } as CSSStyleDeclaration)

    const didScroll = scrollConfiguratorV2ToElement("summary-order-heading", {
      alignToContentStart: true,
      offset: 12,
    })

    expect(didScroll).toBe(true)
    expect(main.scrollTo).toHaveBeenCalledWith({
      top: 340,
      behavior: "smooth",
    })

    document.body.removeChild(main)
  })

  it("retries until the target element exists", () => {
    const cancel = scrollConfiguratorV2ToElementWhenReady("section-summary")
    cancel()
    expect(window.requestAnimationFrame).toHaveBeenCalled()
  })
})
