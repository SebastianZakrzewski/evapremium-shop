"use client"

import { useEffect, useState } from "react"
import { mobilePreviewViewportHeight } from "../preview/fitPreviewFrame"

const readMobilePreviewViewportHeight = () => {
  if (typeof window === "undefined") return 900
  return mobilePreviewViewportHeight({
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    screenWidth: window.screen?.width ?? 0,
    screenHeight: window.screen?.height ?? 0,
  })
}

export const useImageNaturalSize = (src: string) => {
  const [size, setSize] = useState<{ width: number; height: number } | null>(null)

  useEffect(() => {
    let cancelled = false
    setSize(null)
    const image = new window.Image()
    image.onload = () => {
      if (cancelled || image.naturalWidth <= 0 || image.naturalHeight <= 0) return
      setSize({ width: image.naturalWidth, height: image.naturalHeight })
    }
    image.onerror = () => {
      if (!cancelled) setSize(null)
    }
    image.src = src

    return () => {
      cancelled = true
    }
  }, [src])

  return size
}

export const useMobilePreviewViewportHeight = () => {
  const [height, setHeight] = useState(readMobilePreviewViewportHeight)

  useEffect(() => {
    const update = () => {
      setHeight(readMobilePreviewViewportHeight())
    }

    update()
    window.addEventListener("resize", update)
    window.addEventListener("orientationchange", update)
    return () => {
      window.removeEventListener("resize", update)
      window.removeEventListener("orientationchange", update)
    }
  }, [])

  return height
}
