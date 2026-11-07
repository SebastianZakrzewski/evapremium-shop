"use client"

import { useEffect, useRef } from "react"
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

    // Opening the configurator, including a direct URL and the moment vehicle
    // data finishes loading, must leave the options pane at the top. Scrolling
    // to the next empty field is only for an explicit control (summary, back).
    hasScrolledRef.current = true
  }, [isReady, scrollTargetId])
}
