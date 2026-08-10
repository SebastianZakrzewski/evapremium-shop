import { describe, expect, it, vi } from "vitest"
import { renderHook } from "@testing-library/react"
import { useHorizontalSwipe } from "./useHorizontalSwipe"

const createPointerEvent = (
  type: "pointerdown" | "pointerup",
  clientX: number,
  clientY: number,
  pointerId = 1,
): React.PointerEvent<HTMLElement> => {
  const target = {
    setPointerCapture: vi.fn(),
    releasePointerCapture: vi.fn(),
  }

  return {
    type,
    button: 0,
    pointerId,
    clientX,
    clientY,
    currentTarget: target,
    preventDefault: vi.fn(),
  } as unknown as React.PointerEvent<HTMLElement>
}

describe("useHorizontalSwipe", () => {
  it("calls onSwipeLeft for left drag", () => {
    const onSwipeLeft = vi.fn()
    const onSwipeRight = vi.fn()
    const { result } = renderHook(() =>
      useHorizontalSwipe({ onSwipeLeft, onSwipeRight }),
    )

    result.current.onPointerDown(createPointerEvent("pointerdown", 200, 100))
    result.current.onPointerUp(createPointerEvent("pointerup", 120, 105))

    expect(onSwipeLeft).toHaveBeenCalledTimes(1)
    expect(onSwipeRight).not.toHaveBeenCalled()
  })

  it("calls onSwipeRight for right drag", () => {
    const onSwipeLeft = vi.fn()
    const onSwipeRight = vi.fn()
    const { result } = renderHook(() =>
      useHorizontalSwipe({ onSwipeLeft, onSwipeRight }),
    )

    result.current.onPointerDown(createPointerEvent("pointerdown", 120, 100))
    result.current.onPointerUp(createPointerEvent("pointerup", 220, 102))

    expect(onSwipeRight).toHaveBeenCalledTimes(1)
    expect(onSwipeLeft).not.toHaveBeenCalled()
  })

  it("ignores mostly vertical gestures", () => {
    const onSwipeLeft = vi.fn()
    const { result } = renderHook(() =>
      useHorizontalSwipe({ onSwipeLeft }),
    )

    result.current.onPointerDown(createPointerEvent("pointerdown", 200, 100))
    result.current.onPointerUp(createPointerEvent("pointerup", 230, 220))

    expect(onSwipeLeft).not.toHaveBeenCalled()
  })
})
