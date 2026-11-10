"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

type BelowFoldProps = {
  children: ReactNode
  minHeight?: string
}

export const BelowFold = ({ children, minHeight = "32rem" }: BelowFoldProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container || typeof IntersectionObserver === "undefined") {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return
        }
        setIsVisible(true)
        observer.disconnect()
      },
      { rootMargin: "160px" },
    )
    observer.observe(container)

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} style={isVisible ? undefined : { minHeight }}>
      {isVisible ? children : null}
    </div>
  )
}
