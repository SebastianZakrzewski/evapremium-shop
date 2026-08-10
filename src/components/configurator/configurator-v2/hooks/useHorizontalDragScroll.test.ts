import { describe, expect, it, vi } from "vitest"
import { renderHook } from "@testing-library/react"
import { useHorizontalDragScroll } from "./useHorizontalDragScroll"

const createPointerEvent = (
  type: "pointerdown" | "pointermove" | "pointerup",
  clientX: number,
  pointerId = 1,
  target: EventTarget | null = null,
): React.PointerEvent<HTMLDivElement> => {
  const currentTarget = {
    setPointerCapture: vi.fn(),
    releasePointerCapture: vi.fn(),
    scrollLeft: 0,
  }

  return {
    type,
    button: 0,
    pointerId,
    clientX,
    target,
    currentTarget,
    preventDefault: vi.fn(),
  } as unknown as React.PointerEvent<HTMLDivElement>
}

describe("useHorizontalDragScroll", () => {
  it("selects thumbnail on tap without drag", () => {
    const onThumbnailTap = vi.fn()
    const thumb = document.createElement("button")
    thumb.dataset.galleryThumbId = "model-template-1"

    const { result } = renderHook(() =>
      useHorizontalDragScroll({ onThumbnailTap }),
    )

    result.current.scrollRef.current = {
      scrollLeft: 0,
    } as HTMLDivElement

    result.current.onPointerDown(
      createPointerEvent("pointerdown", 100, 1, thumb),
    )
    result.current.onPointerUp(createPointerEvent("pointerup", 102, 1, thumb))

    expect(onThumbnailTap).toHaveBeenCalledWith("model-template-1")
  })

  it("does not select thumbnail after horizontal drag", () => {
    const onThumbnailTap = vi.fn()
    const thumb = document.createElement("button")
    thumb.dataset.galleryThumbId = "model-template-1"

    const { result } = renderHook(() =>
      useHorizontalDragScroll({ onThumbnailTap }),
    )

    result.current.scrollRef.current = {
      scrollLeft: 0,
    } as HTMLDivElement

    result.current.onPointerDown(
      createPointerEvent("pointerdown", 100, 1, thumb),
    )
    result.current.onPointerMove(
      createPointerEvent("pointermove", 140, 1, thumb),
    )
    result.current.onPointerUp(createPointerEvent("pointerup", 140, 1, thumb))

    expect(onThumbnailTap).not.toHaveBeenCalled()
  })
})
