"use client"

import { useEffect } from "react"

export const FontsReady = () => {
  useEffect(() => {
    const enable = () => {
      document.documentElement.classList.add("fonts-ready")
    }

    if (document.readyState === "complete") {
      enable()
      return
    }

    window.addEventListener("load", enable, { once: true })
    return () => window.removeEventListener("load", enable)
  }, [])

  return null
}
