import { act, renderHook, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useCrossfadeImageSrc } from "./useCrossfadeImageSrc"

class MockImage {
  static instances: MockImage[] = []
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  src = ""
  complete = false

  constructor() {
    MockImage.instances.push(this)
  }

  decode = vi.fn(async () => undefined)
}

describe("useCrossfadeImageSrc", () => {
  beforeEach(() => {
    MockImage.instances = []
    vi.stubGlobal(
      "Image",
      MockImage as unknown as typeof Image,
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  const loadLatestImage = () => {
    const latest = MockImage.instances.at(-1)
    if (!latest) return
    latest.complete = true
    latest.onload?.()
  }

  const getVisibleLayer = (result: {
    current: ReturnType<typeof useCrossfadeImageSrc>
  }) =>
    result.current.layers.find((layer) => layer.opacity === 1) ??
    result.current.layers[1]

  it("crossfades to the next image in a single transition", async () => {
    const { result, rerender } = renderHook(
      ({ src }) => useCrossfadeImageSrc(src, 120),
      { initialProps: { src: "/dywaniki/a.webp" } },
    )

    expect(result.current.layers[0].opacity).toBe(1)

    rerender({ src: "/dywaniki/b.webp" })
    loadLatestImage()

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 180))
    })

    expect(getVisibleLayer(result).src).toBe("/dywaniki/b.webp")
  })

  it("keeps fixed z-index layers while fading", async () => {
    const { result, rerender } = renderHook(
      ({ src }) => useCrossfadeImageSrc(src, 120),
      { initialProps: { src: "/dywaniki/a.webp" } },
    )

    rerender({ src: "/dywaniki/b.webp" })
    loadLatestImage()

    await waitFor(() => {
      expect(
        result.current.layers.some(
          (layer) => layer.opacity > 0 && layer.opacity < 1,
        ) ||
          result.current.layers.filter((layer) => layer.opacity === 1).length ===
            1,
      ).toBe(true)
    })

    expect(result.current.layers[0].zIndex).toBe(1)
    expect(result.current.layers[1].zIndex).toBe(2)
  })

  it("applies a later color change after the current fade finishes", async () => {
    const { result, rerender } = renderHook(
      ({ src }) => useCrossfadeImageSrc(src, 120),
      { initialProps: { src: "/dywaniki/a.webp" } },
    )

    rerender({ src: "/dywaniki/b.webp" })
    loadLatestImage()

    rerender({ src: "/dywaniki/c.webp" })

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 400))
    })

    loadLatestImage()

    await waitFor(() => {
      expect(getVisibleLayer(result).src).toBe("/dywaniki/c.webp")
    })
  })
})
