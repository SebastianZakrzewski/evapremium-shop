"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { TESLA_LAYOUT, teslaImageAspectRatio } from "../tokens"

export type GallerySlide = {
  id: string
  src: string
  alt: string
  group: "car" | "mat"
}

type TeslaPinnedGalleryProps = {
  slides: GallerySlide[]
  preferredId: string | null
  resetKey: string
}

/**
 * The pinned frame uses unoptimized next/image so the request URL is the
 * file itself. Preload and decode that same URL; the optimizer URL would
 * miss this cache and flash white on a cold load.
 */
export const preloadPinnedImage = (src: string): Promise<boolean> => {
  if (typeof window === "undefined" || !src) return Promise.resolve(false)
  const image = new window.Image()
  image.src = src
  if (typeof image.decode === "function") {
    return image.decode().then(
      () => true,
      () => false,
    )
  }
  return new Promise((resolve) => {
    image.onload = () => resolve(true)
    image.onerror = () => resolve(false)
  })
}

export const TeslaPinnedGallery = ({
  slides,
  preferredId,
  resetKey,
}: TeslaPinnedGalleryProps) => {
  const [index, setIndex] = useState(0)
  const [baseSrc, setBaseSrc] = useState<string | null>(null)
  const [baseAlt, setBaseAlt] = useState("")
  const [fadeSrc, setFadeSrc] = useState<string | null>(null)
  const [fadeAlt, setFadeAlt] = useState("")
  const [fadeIn, setFadeIn] = useState(false)
  const override = useRef(false)
  const baseRef = useRef<string | null>(null)
  const touchStart = useRef<number | null>(null)
  const shownSrc = fadeIn && fadeSrc ? fadeSrc : baseSrc

  useEffect(() => {
    slides.forEach((slide) => {
      void preloadPinnedImage(slide.src)
    })
  }, [slides])

  useEffect(() => {
    override.current = false
  }, [resetKey])

  useEffect(() => {
    if (override.current || slides.length === 0) return
    const preferred = slides.findIndex((slide) => slide.id === preferredId)
    const next = preferred >= 0 ? preferred : 0
    setIndex((current) => (current === next ? current : next))
  }, [preferredId, slides])

  const active = slides[index] ?? slides[0]

  useEffect(() => {
    const nextSrc = active?.src
    const nextAlt = active?.alt ?? ""
    if (!nextSrc) return undefined
    let cancelled = false
    void preloadPinnedImage(nextSrc).then((ready) => {
      if (!ready || cancelled) return
      const current = baseRef.current
      if (!current || current === nextSrc) {
        baseRef.current = nextSrc
        setBaseSrc(nextSrc)
        setBaseAlt(nextAlt)
        return
      }
      setFadeSrc(nextSrc)
      setFadeAlt(nextAlt)
      setFadeIn(false)
      requestAnimationFrame(() => {
        if (!cancelled) setFadeIn(true)
      })
      window.setTimeout(() => {
        if (cancelled) return
        baseRef.current = nextSrc
        setBaseSrc(nextSrc)
        setBaseAlt(nextAlt)
        setFadeSrc(null)
        setFadeIn(false)
      }, TESLA_LAYOUT.crossfadeMs)
    })
    return () => {
      cancelled = true
    }
  }, [active?.alt, active?.src])

  const go = (delta: number) => {
    if (slides.length < 2) return
    override.current = true
    setIndex((current) => (current + delta + slides.length) % slides.length)
  }

  return (
    <div className="bg-white" data-pinned-src={shownSrc ?? ""} data-target-src={active?.src ?? ""}>
      <div
        className="relative w-full overflow-hidden bg-white max-lg:h-[236px] lg:aspect-[390/236]"
        style={baseSrc ? undefined : { aspectRatio: teslaImageAspectRatio }}
        onTouchStart={(event) => {
          touchStart.current = event.changedTouches[0]?.clientX ?? null
        }}
        onTouchEnd={(event) => {
          const start = touchStart.current
          const end = event.changedTouches[0]?.clientX
          touchStart.current = null
          if (start == null || end == null) return
          if (Math.abs(end - start) < 30) return
          go(end < start ? 1 : -1)
        }}
      >
        {baseSrc ? (
          <Image
            src={baseSrc}
            alt={baseAlt}
            fill
            unoptimized
            priority
            sizes="(max-width: 1024px) 100vw, 62vw"
            className="object-contain"
          />
        ) : null}
        {fadeSrc ? (
          <Image
            src={fadeSrc}
            alt={fadeAlt}
            fill
            unoptimized
            sizes="(max-width: 1024px) 100vw, 62vw"
            className="object-contain"
            style={{
              opacity: fadeIn ? 1 : 0,
              transition: `opacity ${TESLA_LAYOUT.crossfadeMs}ms ease`,
            }}
          />
        ) : null}
        {slides.length > 1 ? (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-2 z-10 flex items-center justify-center"
            role="tablist"
            aria-label="Galeria"
            style={{ gap: 6 }}
          >
            {slides.map((slide, slideIndex) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Zdjęcie ${slideIndex + 1}`}
                aria-current={slideIndex === index}
                onClick={() => {
                  override.current = true
                  setIndex(slideIndex)
                }}
                className="pointer-events-auto rounded-full p-0"
                style={{
                  width: TESLA_LAYOUT.dotSize,
                  height: TESLA_LAYOUT.dotSize,
                  minWidth: TESLA_LAYOUT.dotSize,
                  minHeight: TESLA_LAYOUT.dotSize,
                  backgroundColor: slideIndex === index ? TESLA_LAYOUT.text : "rgba(23,26,32,0.28)",
                }}
              />
            ))}
          </div>
        ) : null}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-8"
          style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0), #fff)" }}
        />
      </div>
    </div>
  )
}
