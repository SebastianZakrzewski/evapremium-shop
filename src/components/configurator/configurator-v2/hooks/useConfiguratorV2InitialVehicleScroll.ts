"use client"

import { useEffect, useRef } from "react"
import { scrollConfiguratorV2ToElementWhenReady } from "../utils/scrollConfiguratorV2ToElement"

const INITIAL_VEHICLE_SCROLL_DELAY_MS = 200

export const isConfiguratorV2MobileViewport = (): boolean => {
  if (typeof window === "undefined") return false
  return window.matchMedia("(max-width: 1023px)").matches
}

type UseConfiguratorV2InitialVehicleScrollOptions = {
  scrollTargetId: string | null
  isReady: boolean
}

export const useConfiguratorV2InitialVehicleScroll = ({
  scrollTargetId,
  isReady,
}: UseConfiguratorV2InitialVehicleScrollOptions) => {
  const hasScrolledRef = useRef(false)

  useEffect(() => {
    if (hasScrolledRef.current || !isReady || !scrollTargetId) return
    if (!isConfiguratorV2MobileViewport()) return

    const timeoutId = window.setTimeout(() => {
      if (hasScrolledRef.current || !scrollTargetId) return

      hasScrolledRef.current = true
      scrollConfiguratorV2ToElementWhenReady(scrollTargetId, {
        alignToContentStart: true,
        offset: 12,
      })
    }, INITIAL_VEHICLE_SCROLL_DELAY_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [isReady, scrollTargetId])
}
