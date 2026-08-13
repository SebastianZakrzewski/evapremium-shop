import { useCallback, useRef } from "react"
import type { PointerEvent as ReactPointerEvent } from "react"

const DEFAULT_DRAG_THRESHOLD_PX = 4

type PointerCaptureElement = {
  setPointerCapture?: (pointerId: number) => void
  releasePointerCapture?: (pointerId: number) => void
}

type UseHorizontalDragScrollOptions = {
  onThumbnailTap?: (id: string) => void
  dragThresholdPx?: number
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

const getGalleryThumbId = (target: EventTarget | null): string | null => {
  const element = (target as HTMLElement | null)?.closest<HTMLElement>(
    "[data-gallery-thumb-id]",
  )

  return element?.dataset.galleryThumbId ?? null
}

export const useHorizontalDragScroll = ({
  onThumbnailTap,
  dragThresholdPx = DEFAULT_DRAG_THRESHOLD_PX,
}: UseHorizontalDragScrollOptions = {}) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const pointerIdRef = useRef<number | null>(null)
  const startXRef = useRef(0)
  const startScrollLeftRef = useRef(0)
  const didDragRef = useRef(false)
  const pressedThumbIdRef = useRef<string | null>(null)

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.button !== 0 || !scrollRef.current) return

      pointerIdRef.current = event.pointerId
      startXRef.current = event.clientX
      startScrollLeftRef.current = scrollRef.current.scrollLeft
      didDragRef.current = false
      pressedThumbIdRef.current = getGalleryThumbId(event.target)
      setPointerCaptureSafe(event.currentTarget, event.pointerId)
    },
    [],
  )

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (pointerIdRef.current !== event.pointerId || !scrollRef.current) return

      const deltaX = event.clientX - startXRef.current
      if (Math.abs(deltaX) > dragThresholdPx) {
        didDragRef.current = true
      }

      scrollRef.current.scrollLeft = startScrollLeftRef.current - deltaX
      event.preventDefault()
    },
    [dragThresholdPx],
  )

  const endDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (pointerIdRef.current !== event.pointerId) return

      releasePointerCaptureSafe(event.currentTarget, event.pointerId)

      if (!didDragRef.current && pressedThumbIdRef.current) {
        onThumbnailTap?.(pressedThumbIdRef.current)
      }

      pointerIdRef.current = null
      pressedThumbIdRef.current = null
    },
    [onThumbnailTap],
  )

  return {
    scrollRef,
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
  }
}
