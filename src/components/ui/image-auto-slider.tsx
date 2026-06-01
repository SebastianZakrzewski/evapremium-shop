"use client"

import React, { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { GalleryLightbox } from "@/components/ui/gallery-lightbox"

export interface SliderImage {
  src: string
  alt: string
  title?: string
  description?: string
}

interface ImageAutoSliderProps {
  images: SliderImage[]
  /** Animation duration in seconds — lower = faster scroll. Default: 30 */
  speed?: number
  /** Aspect ratio class for each tile, e.g. "aspect-square". Default: fixed 256×256. */
  tileClassName?: string
  className?: string
}

export const ImageAutoSlider = ({
  images,
  speed = 30,
  tileClassName,
  className,
}: ImageAutoSliderProps) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const mobileMediaQuery = window.matchMedia("(max-width: 767px)")
    const reducedMotionMediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")

    const handleSettingsChange = () => {
      setIsMobile(mobileMediaQuery.matches)
      setPrefersReducedMotion(reducedMotionMediaQuery.matches)
    }

    handleSettingsChange()
    mobileMediaQuery.addEventListener("change", handleSettingsChange)
    reducedMotionMediaQuery.addEventListener("change", handleSettingsChange)

    return () => {
      mobileMediaQuery.removeEventListener("change", handleSettingsChange)
      reducedMotionMediaQuery.removeEventListener("change", handleSettingsChange)
    }
  }, [])

  const duplicated = useMemo(() => [...images, ...images], [images])

  const tileSize = tileClassName ?? "w-48 h-48 md:w-64 md:h-64 lg:w-72 lg:h-72"
  const eagerSlidesCount = isMobile ? 2 : 4
  const animationDuration = prefersReducedMotion ? speed * 1.6 : speed

  return (
    <>
      <div className={`w-full overflow-hidden gallery-slider-mask ${className ?? ""}`}>
        <div
          className="gallery-slider-track flex w-max gap-4 animate-scroll-right-seamless"
          style={{ animationDuration: `${animationDuration}s` }}
        >
          {duplicated.map((image, index) => (
            <button
              key={`${image.src}-${index}`}
              type="button"
              onClick={() => setLightboxIndex(index % images.length)}
              aria-label={`Otwórz zdjęcie: ${image.title ?? image.alt}`}
              className={`
                flex-shrink-0 ${tileSize}
                relative rounded-xl overflow-hidden
                shadow-2xl shadow-black/50
                border border-white/10
                hover:border-red-500/40
                transition-[border-color,box-shadow] duration-300
                hover:shadow-red-900/30
                focus:outline-none focus:ring-2 focus:ring-red-500/60
                cursor-pointer
              `}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 192px, (max-width: 1024px) 256px, 288px"
                quality={90}
                loading={index < eagerSlidesCount ? "eager" : "lazy"}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
              {image.title && (
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 hover:translate-y-0 hover:opacity-100 transition-all duration-300">
                  <p className="text-white text-sm font-semibold line-clamp-1 drop-shadow-lg">
                    {image.title}
                  </p>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <GalleryLightbox
        isOpen={lightboxIndex !== null}
        items={images}
        currentIndex={lightboxIndex ?? 0}
        onIndexChange={setLightboxIndex}
        onClose={() => setLightboxIndex(null)}
      />
    </>
  )
}
