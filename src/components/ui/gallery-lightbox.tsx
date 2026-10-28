"use client"

import { useCallback, useEffect, useState } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { AnimatePresence, motion, type PanInfo } from "framer-motion"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

export type GalleryLightboxItem = {
  src: string
  alt: string
  title?: string
  description?: string
}

export type GalleryLightboxProps = {
  isOpen: boolean
  items: GalleryLightboxItem[]
  currentIndex: number
  onIndexChange: (index: number) => void
  onClose: () => void
}

const SWIPE_OFFSET_THRESHOLD = 48

export const GalleryLightbox = ({
  isOpen,
  items,
  currentIndex,
  onIndexChange,
  onClose,
}: GalleryLightboxProps) => {
  const [mounted, setMounted] = useState(false)

  const itemCount = items.length
  const safeIndex =
    itemCount > 0 ? ((currentIndex % itemCount) + itemCount) % itemCount : 0
  const current = itemCount > 0 ? items[safeIndex] : null
  const canNavigate = itemCount > 1

  const goToPrevious = useCallback(() => {
    if (!canNavigate) return
    onIndexChange((safeIndex - 1 + itemCount) % itemCount)
  }, [canNavigate, safeIndex, itemCount, onIndexChange])

  const goToNext = useCallback(() => {
    if (!canNavigate) return
    onIndexChange((safeIndex + 1) % itemCount)
  }, [canNavigate, safeIndex, itemCount, onIndexChange])

  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (!canNavigate) return
      if (info.offset.x <= -SWIPE_OFFSET_THRESHOLD) {
        goToNext()
        return
      }
      if (info.offset.x >= SWIPE_OFFSET_THRESHOLD) {
        goToPrevious()
      }
    },
    [canNavigate, goToNext, goToPrevious]
  )

  useEffect(() => {
    setMounted(true)
  }, [])

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
        event.preventDefault()
        goToPrevious()
      }
      if (event.key === "ArrowRight") {
        event.preventDefault()
        goToNext()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose, goToPrevious, goToNext])

  if (!mounted || !current) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="gallery-lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black md:bg-black/95 md:backdrop-blur-xl"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={current.title ?? current.alt}
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onClose()
            }}
            className="fixed top-[max(1rem,env(safe-area-inset-top))] right-4 z-[210] flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/20 bg-black/80 text-white backdrop-blur-sm transition-colors hover:border-red-500/50 hover:bg-red-600"
            aria-label="Zamknij podgląd"
          >
            <X className="h-6 w-6" aria-hidden />
          </button>

          {canNavigate && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  goToPrevious()
                }}
                className="fixed left-2 top-1/2 z-[210] flex min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/80 text-white backdrop-blur-sm transition-colors hover:border-red-500/50 hover:bg-red-600 md:left-4"
                aria-label="Poprzednie zdjęcie"
              >
                <ChevronLeft className="h-7 w-7" aria-hidden />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  goToNext()
                }}
                className="fixed right-2 top-1/2 z-[210] flex min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/80 text-white backdrop-blur-sm transition-colors hover:border-red-500/50 hover:bg-red-600 md:right-4"
                aria-label="Następne zdjęcie"
              >
                <ChevronRight className="h-7 w-7" aria-hidden />
              </button>
            </>
          )}

          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-[205] flex h-dvh w-full max-w-none flex-col md:h-[96dvh] md:w-[min(96vw,1920px)]"
            onClick={(event) => event.stopPropagation()}
          >
            <motion.div
              drag={canNavigate ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.12}
              onDragEnd={handleDragEnd}
              className="relative min-h-0 w-full flex-1 touch-pan-y overflow-hidden bg-black md:rounded-2xl md:border md:border-white/10 md:shadow-2xl"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={current.src}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={current.src}
                    alt={current.alt}
                    fill
                    className="object-contain"
                    sizes="100vw"
                    quality={90}
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {canNavigate && (
                <div className="pointer-events-none absolute top-[max(1.15rem,env(safe-area-inset-top))] left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/10 bg-black/70 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  {safeIndex + 1} / {itemCount}
                </div>
              )}
            </motion.div>

            {(current.title || current.description) && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black via-black/70 to-transparent px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-16 md:rounded-b-2xl md:px-8 md:pb-8">
                {current.title && (
                  <h3 className="text-lg font-bold text-white md:text-2xl">
                    {current.title}
                  </h3>
                )}
                {current.description && (
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-gray-300 md:text-base">
                    {current.description}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
