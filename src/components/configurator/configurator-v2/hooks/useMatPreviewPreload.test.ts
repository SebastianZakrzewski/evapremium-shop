import { renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { useMatPreviewPreload } from "./useMatPreviewPreload"

const sources: string[] = []

class FakeImage {
  set src(value: string) {
    sources.push(value)
  }
}

const base = {
  matType: "3d-with-rims",
  pricingCategoryKey: "passenger_car",
  structure: "diamonds",
  color: "black",
  edgeColor: "red",
  variant: "basic",
  extraPaths: ["/extra.webp"],
}

describe("useMatPreviewPreload", () => {
  afterEach(() => {
    sources.length = 0
    vi.unstubAllGlobals()
  })

  it("does not preload color variants on the first paint", () => {
    vi.stubGlobal("Image", FakeImage)

    const { rerender } = renderHook(
      (props: typeof base) => useMatPreviewPreload(props),
      { initialProps: base },
    )

    expect(sources).toEqual([])

    rerender({ ...base, color: "blue" })

    expect(sources.length).toBeGreaterThan(0)
    expect(sources).toContain("/extra.webp")
  })
})
