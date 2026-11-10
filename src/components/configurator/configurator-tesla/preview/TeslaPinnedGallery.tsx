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

const preload = (src: string) => {
  if (typeof window === "undefined" || !src) return
  const image = new window.Image()
  image.src = src
}

export const TeslaPinnedGallery = ({
  slides,
  preferredId,
  resetKey,
}: TeslaPinnedGalleryProps) => {
  const [index, setIndex] = useState(0)
  const [previousSrc, setPreviousSrc] = useState<string | null>(null)
  const override = useRef(false)
  const touchStart = useRef<number | null>(null)

  useEffect(() => {
    slides.forEach((slide) => preload(slide.src))
  }, [slides])

  useEffect(() => {
    override.current = false
  }, [resetKey])

  useEffect(() => {
    if (override.current || slides.length === 0) return
    const preferred = slides.findIndex((slide) => slide.id === preferredId)
    const next = preferred >= 0 ? preferred : 0
    setIndex((current) => {
      if (current === next) return current
      const leaving = slides[current]
      if (leaving) setPreviousSrc(leaving.src)
      return next
    })
  }, [preferredId, slides])

  const active = slides[index] ?? slides[0]
  const go = (delta: number) => {
    if (slides.length < 2) return
    override.current = true
    setIndex((current) => {
      const next = (current + delta + slides.length) % slides.length
      const leaving = slides[current]
      if (leaving) setPreviousSrc(leaving.src)
      return next
    })
  }

  if (!active) {
    return (
      <div
        className="w-full bg-white"
        style={{ aspectRatio: teslaImageAspectRatio }}
        aria-hidden
      />
    )
  }

  return (
    <div className="bg-white" data-pinned-src={active.src}>
      <div
        className="relative w-full overflow-hidden bg-white max-lg:h-[236px] lg:aspect-[390/236]"
        onTouchStart={(event) => {
          touchStart.current = event.changedTouches[0]?.clientX ?? null
        }}
        onTouchEnd={(event) => {
          const start = touchStart.current
          const end = event.changedTouches[0]?.clientX
          touchStart.current = null
          if (start == null || end == null) return
          const delta = end - start
          if (Math.abs(delta) < 30) return
          go(delta < 0 ? 1 : -1)
        }}
      >
        {previousSrc && previousSrc !== active.src ? (
          <Image
            src={previousSrc}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 62vw"
            className="object-contain"
            style={{ opacity: 0, transition: `opacity ${TESLA_LAYOUT.crossfadeMs}ms ease` }}
          />
        ) : null}
        <Image
          key={active.src}
          src={active.src}
          alt={active.alt}
          fill
          priority={active.group === "car"}
          sizes="(max-width: 1024px) 100vw, 62vw"
          className="object-contain"
          style={{ transition: `opacity ${TESLA_LAYOUT.crossfadeMs}ms ease` }}
        />
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
                  setPreviousSrc(active.src)
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
