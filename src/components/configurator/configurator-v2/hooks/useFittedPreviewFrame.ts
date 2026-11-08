"use client"

import { useEffect, useState } from "react"

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
  const [height, setHeight] = useState(() =>
    typeof window === "undefined" ? 900 : window.innerHeight,
  )

  useEffect(() => {
    const update = () => {
      setHeight(window.innerHeight)
    }

    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  return height
}
