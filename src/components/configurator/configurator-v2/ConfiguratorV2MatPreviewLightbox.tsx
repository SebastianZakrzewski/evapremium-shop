"use client"

import { useCallback, useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion, type PanInfo } from "framer-motion"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { getMatPreviewCanvasClass } from "./matPreviewCanvas"
import { ConfiguratorV2CrossfadeImage } from "./ui/ConfiguratorV2CrossfadeImage"

const SWIPE_CLOSE_THRESHOLD_PX = 72

type ConfiguratorV2MatPreviewLightboxProps = {
  isOpen: boolean
  imageSrc: string
  alt: string
  onClose: () => void
  galleryImages?: string[]
  initialIndex?: number
  onGalleryIndexChange?: (index: number) => void
}

export const ConfiguratorV2MatPreviewLightbox = ({
  isOpen,
  imageSrc,
  alt,
  onClose,
  galleryImages = [],
  initialIndex = 0,
  onGalleryIndexChange,
}: ConfiguratorV2MatPreviewLightboxProps) => {
  const [mounted, setMounted] = useState(false)
  const [activeIndex, setActiveIndex] = useState(initialIndex)

  const hasGallery = galleryImages.length > 1
  const resolvedImageSrc = hasGallery
    ? galleryImages[activeIndex] ?? imageSrc
    : imageSrc
  const canvasClass = getMatPreviewCanvasClass(resolvedImageSrc)

  const handlePrevious = useCallback(() => {
    if (!hasGallery) return
    const nextIndex =
      (activeIndex - 1 + galleryImages.length) % galleryImages.length
    setActiveIndex(nextIndex)
    onGalleryIndexChange?.(nextIndex)
  }, [activeIndex, galleryImages.length, hasGallery, onGalleryIndexChange])

  const handleNext = useCallback(() => {
    if (!hasGallery) return
    const nextIndex = (activeIndex + 1) % galleryImages.length
    setActiveIndex(nextIndex)
    onGalleryIndexChange?.(nextIndex)
  }, [activeIndex, galleryImages.length, hasGallery, onGalleryIndexChange])

  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (info.offset.y >= SWIPE_CLOSE_THRESHOLD_PX) {
        onClose()
      }
    },
    [onClose],
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    setActiveIndex(initialIndex)
  }, [initialIndex, isOpen])

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
        return
      }
      if (event.key === "ArrowLeft") {
        handlePrevious()
      }
      if (event.key === "ArrowRight") {
        handleNext()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleNext, handlePrevious, isOpen, onClose])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="configurator-v2-mat-preview-lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex flex-col bg-black"
          role="dialog"
          aria-modal="true"
          aria-label={`Powiększony podgląd: ${alt}`}
          onClick={onClose}
        >
          <div
            className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 p-4 pt-safe lg:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            {hasGallery && (
              <p className="text-sm text-white/70">
                {activeIndex + 1} / {galleryImages.length}
              </p>
            )}
            <button
              type="button"
              onClick={onClose}
              className="ml-auto flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/20 bg-black/80 text-white backdrop-blur-sm transition-colors hover:border-red-500/50 hover:bg-red-600"
              aria-label="Zamknij podgląd"
            >
              <X className="h-6 w-6" aria-hidden />
            </button>
          </div>

          {hasGallery && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  handlePrevious()
                }}
                className="absolute left-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-white/20 bg-black/70 p-3 text-white hover:border-red-500/50 lg:flex"
                aria-label="Poprzednie zdjęcie"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  handleNext()
                }}
                className="absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-white/20 bg-black/70 p-3 text-white hover:border-red-500/50 lg:flex"
                aria-label="Następne zdjęcie"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <motion.button
            type="button"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.18}
            onDragEnd={handleDragEnd}
            onTap={onClose}
            className={`relative mt-0 flex min-h-0 flex-1 w-full cursor-zoom-out overflow-hidden ${canvasClass}`}
            aria-label="Zamknij powiększony podgląd"
          >
            <ConfiguratorV2CrossfadeImage
              imageSrc={resolvedImageSrc}
              alt={alt}
              canvasClassName={canvasClass}
              priority
            />
          </motion.button>

          <p className="pointer-events-none shrink-0 px-4 pb-safe pt-3 text-center text-xs text-white/65 lg:hidden">
            {hasGallery
              ? "Przesuń w dół, aby zamknąć • strzałki zmieniają zdjęcie"
              : "Dotknij obrazu lub przesuń w dół, aby zamknąć"}
          </p>
          <p className="pointer-events-none hidden shrink-0 px-6 pb-6 pt-4 text-center text-sm text-white/55 lg:block">
            {hasGallery
              ? "Kliknij obraz lub naciśnij Escape, aby zamknąć • strzałki zmieniają zdjęcie"
              : "Kliknij obraz lub naciśnij Escape, aby zamknąć"}
          </p>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

/** @deprecated Use ConfiguratorV2MatPreviewLightbox */
export const ConfiguratorV2MobilePreviewLightbox = ConfiguratorV2MatPreviewLightbox
