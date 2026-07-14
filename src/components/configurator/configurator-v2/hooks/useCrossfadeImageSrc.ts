"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export const CROSSFADE_IMAGE_MS = 380

type LayerSlot = {
  src: string
  opacity: number
}

type DualLayerState = {
  front: LayerSlot
  back: LayerSlot
}

const createInitialState = (src: string): DualLayerState => ({
  front: { src, opacity: 1 },
  back: { src, opacity: 0 },
})

export const useCrossfadeImageSrc = (
  targetSrc: string,
  durationMs = CROSSFADE_IMAGE_MS,
) => {
  const [layers, setLayers] = useState<DualLayerState>(() =>
    createInitialState(targetSrc),
  )
  const displayedSrcRef = useRef(targetSrc)
  const requestIdRef = useRef(0)
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const commitTransition = useCallback(
    (nextSrc: string, requestId: number) => {
      if (requestId !== requestIdRef.current) return

      setLayers((prev) => ({
        front: { ...prev.front, opacity: 0 },
        back: { src: nextSrc, opacity: 1 },
      }))
      displayedSrcRef.current = nextSrc

      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current)
      }

      transitionTimerRef.current = setTimeout(() => {
        if (requestId !== requestIdRef.current) return
        setLayers({
          front: { src: nextSrc, opacity: 1 },
          back: { src: nextSrc, opacity: 0 },
        })
      }, durationMs + 40)
    },
    [durationMs],
  )

  useEffect(() => {
    if (targetSrc === displayedSrcRef.current) return

    const requestId = ++requestIdRef.current
    const img = new window.Image()

    let started = false
    const startTransition = () => {
      if (started || requestId !== requestIdRef.current) return
      started = true

      setLayers((prev) => ({
        front: prev.front,
        back: { src: targetSrc, opacity: 0 },
      }))

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          commitTransition(targetSrc, requestId)
        })
      })
    }

    img.onload = startTransition
    img.onerror = startTransition
    img.src = targetSrc

    if (img.complete) {
      startTransition()
    }

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [targetSrc, commitTransition])

  useEffect(
    () => () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current)
      }
    },
    [],
  )

  return {
    front: layers.front,
    back: layers.back,
    durationMs,
  }
}
