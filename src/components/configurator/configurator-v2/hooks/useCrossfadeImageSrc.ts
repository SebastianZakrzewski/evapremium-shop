"use client"

import { useEffect, useRef, useState } from "react"

export const CROSSFADE_IMAGE_MS = 520

type SlotIndex = 0 | 1

type SlotSources = [string, string]

const createInitialSlots = (src: string): SlotSources => [src, src]

const waitForNextPaint = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve())
    })
  })

const preloadImage = (src: string): Promise<void> =>
  new Promise((resolve) => {
    const img = new window.Image()
    const finish = () => resolve()
    img.onload = finish
    img.onerror = finish
    img.src = src
    if (img.complete) {
      if (img.decode) {
        void img.decode().then(finish).catch(finish)
        return
      }
      finish()
    }
  })

export const useCrossfadeImageSrc = (
  targetSrc: string,
  durationMs = CROSSFADE_IMAGE_MS,
) => {
  const [slotSources, setSlotSources] = useState<SlotSources>(() =>
    createInitialSlots(targetSrc),
  )
  const [visibleSlot, setVisibleSlot] = useState<SlotIndex>(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const displayedSrcRef = useRef(targetSrc)
  const latestTargetRef = useRef(targetSrc)
  const visibleSlotRef = useRef<SlotIndex>(0)
  const requestIdRef = useRef(0)
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isAnimatingRef = useRef(false)

  useEffect(() => {
    visibleSlotRef.current = visibleSlot
  }, [visibleSlot])

  useEffect(() => {
    latestTargetRef.current = targetSrc

    const scheduleNextTransition = () => {
      if (latestTargetRef.current === displayedSrcRef.current) return
      if (isAnimatingRef.current) return

      const requestId = ++requestIdRef.current
      void runTransition(latestTargetRef.current, requestId)
    }

    const runTransition = async (nextSrc: string, requestId: number) => {
      if (requestId !== requestIdRef.current) return
      if (nextSrc === displayedSrcRef.current) {
        scheduleNextTransition()
        return
      }
      if (isAnimatingRef.current) return

      const hiddenSlot = (visibleSlotRef.current === 0 ? 1 : 0) as SlotIndex

      await preloadImage(nextSrc)
      if (requestId !== requestIdRef.current) return

      setSlotSources((prev) => {
        const next: SlotSources = [...prev]
        next[hiddenSlot] = nextSrc
        return next
      })

      await waitForNextPaint()
      if (requestId !== requestIdRef.current) return

      isAnimatingRef.current = true
      setIsAnimating(true)

      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current)
      }

      transitionTimerRef.current = setTimeout(() => {
        if (requestId !== requestIdRef.current) return

        visibleSlotRef.current = hiddenSlot
        displayedSrcRef.current = nextSrc
        setVisibleSlot(hiddenSlot)
        isAnimatingRef.current = false
        setIsAnimating(false)
        transitionTimerRef.current = null

        scheduleNextTransition()
      }, durationMs + 32)
    }

    scheduleNextTransition()
  }, [durationMs, targetSrc])

  useEffect(
    () => () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current)
      }
      requestIdRef.current += 1
      isAnimatingRef.current = false
    },
    [],
  )

  const getSlotOpacity = (slot: SlotIndex): number => {
    const isCurrentlyVisible = visibleSlot === slot
    if (!isAnimating) {
      return isCurrentlyVisible ? 1 : 0
    }
    return isCurrentlyVisible ? 0 : 1
  }

  return {
    layers: [
      {
        src: slotSources[0],
        opacity: getSlotOpacity(0),
        zIndex: 1,
      },
      {
        src: slotSources[1],
        opacity: getSlotOpacity(1),
        zIndex: 2,
      },
    ] as const,
    durationMs,
  }
}
