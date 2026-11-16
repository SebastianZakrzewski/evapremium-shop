"use client"

import { useEffect, useRef, useState } from "react"
import Image, { getImageProps } from "next/image"
import { TESLA_LAYOUT, teslaImageAspectRatio } from "../tokens"
import { TeslaPreviewLightbox } from "./TeslaPreviewLightbox"

export const PINNED_IMAGE_SIZES = "(max-width: 1024px) 100vw, 62vw"
export const PINNED_IMAGE_QUALITY = 75

/**
 * The exact optimizer URL the pinned <Image> requests for this viewport.
 * getImageProps builds the same srcSet; we pick the candidate the browser
 * would (smallest width at or above CSS width × devicePixelRatio).
 */
export const optimizedPinnedSrc = (src: string): string => {
  if (!src || src.startsWith("data:") || src.startsWith("blob:")) return src
  const { props } = getImageProps({
    alt: "",
    src,
    fill: true,
    sizes: PINNED_IMAGE_SIZES,
    quality: PINNED_IMAGE_QUALITY,
  })
  if (typeof window === "undefined" || !props.srcSet) return props.src
  const viewport = window.innerWidth
  const slot = viewport <= 1024 ? viewport : Math.round(viewport * 0.62)
  const target = Math.ceil(slot * (window.devicePixelRatio || 1))
  const candidates = props.srcSet
    .split(",")
    .map((part) => {
      const [url, descriptor] = part.trim().split(/\s+/)
      const width = Number.parseInt(descriptor ?? "", 10)
      return { url, width }
    })
    .filter((candidate) => candidate.url && Number.isFinite(candidate.width))
    .sort((left, right) => left.width - right.width)
  const match = candidates.find((candidate) => candidate.width >= target) ?? candidates.at(-1)
  return match?.url ?? props.src
}

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

/** Decode the same optimizer URL the pinned frame will request. */
export const preloadPinnedImage = (src: string): Promise<boolean> => {
  if (typeof window === "undefined" || !src) return Promise.resolve(false)
  const image = new window.Image()
  image.src = optimizedPinnedSrc(src)
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
  const [zoomed, setZoomed] = useState(false)
  const override = useRef(false)
  const baseRef = useRef<string | null>(null)
  const touchStart = useRef<number | null>(null)
  const suppressZoomClick = useRef(false)
  const shownSrc = fadeIn && fadeSrc ? fadeSrc : baseSrc

  useEffect(() => {
    const activeSrc = slides[index]?.src
    const rest = slides.map((slide) => slide.src).filter((src) => src && src !== activeSrc)
    let cancelled = false
    void (async () => {
      if (activeSrc) await preloadPinnedImage(activeSrc)
      for (const src of rest) {
        if (cancelled) return
        await preloadPinnedImage(src)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [index, slides])

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
    if (!baseRef.current) {
      baseRef.current = nextSrc
      setBaseSrc(nextSrc)
      setBaseAlt(nextAlt)
      return undefined
    }
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

  const lcpSrcRef = useRef<string | null>(null)
  if (baseSrc && !lcpSrcRef.current) lcpSrcRef.current = baseSrc
  const carSrc = slides.find((slide) => slide.group === "car")?.src ?? null
  const prioritySrc = carSrc ?? lcpSrcRef.current
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
          const delta = Math.abs(end - start)
          suppressZoomClick.current = delta > 10
          if (delta < 30) return
          go(end < start ? 1 : -1)
        }}
      >
        {baseSrc ? (
          <Image
            src={baseSrc}
            alt={baseAlt}
            fill
            sizes={PINNED_IMAGE_SIZES}
            quality={PINNED_IMAGE_QUALITY}
            preload={baseSrc === prioritySrc}
            fetchPriority={baseSrc === prioritySrc ? "high" : "auto"}
            className="pointer-events-none object-contain"
          />
        ) : null}
        {fadeSrc ? (
          <Image
            src={fadeSrc}
            alt={fadeAlt}
            fill
            sizes={PINNED_IMAGE_SIZES}
            quality={PINNED_IMAGE_QUALITY}
            preload={fadeSrc === prioritySrc}
            fetchPriority={fadeSrc === prioritySrc ? "high" : "low"}
            className="pointer-events-none object-contain"
            style={{
              opacity: fadeIn ? 1 : 0,
              transition: `opacity ${TESLA_LAYOUT.crossfadeMs}ms ease`,
            }}
          />
        ) : null}
        <button
          type="button"
          className="absolute inset-0 z-[1] lg:hidden"
          aria-label="Powiększ podgląd"
          onClick={() => {
            if (suppressZoomClick.current) {
              suppressZoomClick.current = false
              return
            }
            if (active?.src) setZoomed(true)
          }}
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
      <TeslaPreviewLightbox
        open={zoomed}
        src={active?.src ?? ""}
        alt={active?.alt ?? "Podgląd"}
        onClose={() => setZoomed(false)}
      />
    </div>
  )
}
