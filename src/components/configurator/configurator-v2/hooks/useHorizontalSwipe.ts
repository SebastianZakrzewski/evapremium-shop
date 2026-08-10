import { useCallback, useRef } from "react"
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react"

const MIN_SWIPE_DISTANCE_PX = 48

type PointerCaptureElement = {
  setPointerCapture?: (pointerId: number) => void
  releasePointerCapture?: (pointerId: number) => void
}

type UseHorizontalSwipeOptions = {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  enabled?: boolean
}

const setPointerCaptureSafe = (
  element: PointerCaptureElement,
  pointerId: number,
) => {
  try {
    element.setPointerCapture?.(pointerId)
  } catch {
    // Ignore unsupported capture targets in tests or legacy browsers.
  }
}

const releasePointerCaptureSafe = (
  element: PointerCaptureElement,
  pointerId: number,
) => {
  try {
    element.releasePointerCapture?.(pointerId)
  } catch {
    // Ignore if capture was already released.
  }
}

export const useHorizontalSwipe = ({
  onSwipeLeft,
  onSwipeRight,
  enabled = true,
}: UseHorizontalSwipeOptions) => {
  const pointerIdRef = useRef<number | null>(null)
  const startXRef = useRef<number | null>(null)
  const startYRef = useRef<number | null>(null)
  const suppressClickRef = useRef(false)

  const resetGesture = useCallback(() => {
    pointerIdRef.current = null
    startXRef.current = null
    startYRef.current = null
  }, [])

  const resolveSwipe = useCallback(
    (clientX: number, clientY: number) => {
      if (startXRef.current === null || startYRef.current === null) return

      const deltaX = clientX - startXRef.current
      const deltaY = clientY - startYRef.current

      if (
        Math.abs(deltaX) < MIN_SWIPE_DISTANCE_PX ||
        Math.abs(deltaX) <= Math.abs(deltaY)
      ) {
        return
      }

      suppressClickRef.current = true

      if (deltaX < 0) {
        onSwipeLeft?.()
        return
      }

      onSwipeRight?.()
    },
    [onSwipeLeft, onSwipeRight],
  )

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!enabled || event.button !== 0) return

      pointerIdRef.current = event.pointerId
      startXRef.current = event.clientX
      startYRef.current = event.clientY
      setPointerCaptureSafe(event.currentTarget, event.pointerId)
    },
    [enabled],
  )

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!enabled || pointerIdRef.current !== event.pointerId) return
      if (startXRef.current === null || startYRef.current === null) return

      const deltaX = event.clientX - startXRef.current
      const deltaY = event.clientY - startYRef.current

      if (
        Math.abs(deltaX) >= MIN_SWIPE_DISTANCE_PX &&
        Math.abs(deltaX) > Math.abs(deltaY)
      ) {
        event.preventDefault()
      }
    },
    [enabled],
  )

  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!enabled || pointerIdRef.current !== event.pointerId) return

      releasePointerCaptureSafe(event.currentTarget, event.pointerId)
      resolveSwipe(event.clientX, event.clientY)
      resetGesture()
    },
    [enabled, resetGesture, resolveSwipe],
  )

  const handlePointerCancel = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (pointerIdRef.current !== event.pointerId) return
      releasePointerCaptureSafe(event.currentTarget, event.pointerId)
      resetGesture()
    },
    [resetGesture],
  )

  const consumeSuppressedClick = useCallback(() => {
    if (!suppressClickRef.current) return false
    suppressClickRef.current = false
    return true
  }, [])

  const dragStyle: CSSProperties | undefined = enabled
    ? { touchAction: "none" }
    : undefined

  return {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onPointerCancel: handlePointerCancel,
    consumeSuppressedClick,
    dragStyle,
  }
}
