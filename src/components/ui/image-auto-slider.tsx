"use client"

import React, { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

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

const SliderModal = ({
  image,
  onClose,
}: {
  image: SliderImage
  onClose: () => void
}) => {
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4 md:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={image.title ?? image.alt}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative max-w-5xl max-h-[90vh] w-full h-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 z-10 text-white hover:text-red-500 transition-colors duration-200 p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-white/10"
          aria-label="Zamknij podgląd obrazu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="relative flex-1 rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-contain"
            sizes="(max-width: 1200px) 100vw, 1200px"
            quality={100}
            priority
            unoptimized
          />
        </div>

        {(image.title || image.description) && (
          <div className="mt-6 bg-black border border-white/10 rounded-xl p-6 backdrop-blur-md">
            {image.title && (
              <h3 className="text-2xl font-bold text-white mb-2">{image.title}</h3>
            )}
            {image.description && (
              <p className="text-white font-medium">{image.description}</p>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

SliderModal.displayName = "SliderModal"

export const ImageAutoSlider = ({
  images,
  speed = 30,
  tileClassName,
  className,
}: ImageAutoSliderProps) => {
  const [activeImage, setActiveImage] = useState<SliderImage | null>(null)
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
          className="flex gap-4 w-max animate-scroll-right-seamless"
          style={{ animationDuration: `${animationDuration}s` }}
        >
          {duplicated.map((image, index) => (
            <button
              key={`${image.src}-${index}`}
              type="button"
              onClick={() => setActiveImage(image)}
              aria-label={`Otwórz zdjęcie: ${image.title ?? image.alt}`}
              className={`
                flex-shrink-0 ${tileSize}
                relative rounded-xl overflow-hidden
                shadow-2xl shadow-black/50
                border border-white/10
                hover:border-red-500/40
                transition-all duration-300
                hover:scale-[1.04] hover:shadow-red-900/30
                focus:outline-none focus:ring-2 focus:ring-red-500/60
                cursor-pointer
              `}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-500 hover:scale-110 brightness-105"
                sizes="(max-width: 768px) 200px, (max-width: 1024px) 272px, 304px"
                quality={100}
                loading={index < eagerSlidesCount ? "eager" : "lazy"}
                unoptimized
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

      <AnimatePresence>
        {activeImage && (
          <SliderModal image={activeImage} onClose={() => setActiveImage(null)} />
        )}
      </AnimatePresence>
    </>
  )
}
