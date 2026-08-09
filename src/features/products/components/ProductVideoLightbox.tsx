"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion, type PanInfo } from "framer-motion"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import type { ProductVideo } from "../data/productVideos"

export type ProductVideoLightboxProps = {
  isOpen: boolean
  videos: ProductVideo[]
  currentIndex: number
  onIndexChange: (index: number) => void
  onClose: () => void
}

const SWIPE_OFFSET_THRESHOLD = 48

export const ProductVideoLightbox = ({
  isOpen,
  videos,
  currentIndex,
  onIndexChange,
  onClose,
}: ProductVideoLightboxProps) => {
  const [mounted, setMounted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const itemCount = videos.length
  const safeIndex =
    itemCount > 0 ? ((currentIndex % itemCount) + itemCount) % itemCount : 0
  const current = itemCount > 0 ? videos[safeIndex] : null
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

  useEffect(() => {
    if (!isOpen) {
      const el = videoRef.current
      if (el) {
        el.pause()
        el.muted = true
      }
      return
    }

    const el = videoRef.current
    if (!el) return

    const playWithSound = () => {
      el.muted = false
      el.defaultMuted = false
      el.volume = 1
      try {
        el.currentTime = 0
      } catch {
        // Ignore seek errors before metadata is ready
      }
      return el.play()
    }

    const tryPlayWithSound = () => {
      playWithSound().catch(() => {
        // Retry once after the next frame — still within open gesture window on most browsers
        requestAnimationFrame(() => {
          playWithSound().catch(() => undefined)
        })
      })
    }

    if (el.readyState >= 2) {
      tryPlayWithSound()
    } else {
      el.addEventListener("loadeddata", tryPlayWithSound, { once: true })
      el.addEventListener("canplay", tryPlayWithSound, { once: true })
    }

    return () => {
      el.pause()
      el.removeEventListener("loadeddata", tryPlayWithSound)
      el.removeEventListener("canplay", tryPlayWithSound)
    }
  }, [isOpen, safeIndex])

  if (!mounted || !current) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="product-video-lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-3 backdrop-blur-[2px] sm:p-4 md:p-8"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`Powiększony film: ${current.title}`}
          data-testid="product-video-lightbox"
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onClose()
            }}
            className="fixed top-4 right-4 z-[210] flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/20 bg-black/80 text-white backdrop-blur-sm transition-colors hover:border-red-500/50 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/50"
            aria-label="Zamknij powiększony film"
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </button>

          {canNavigate && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  goToPrevious()
                }}
                className="fixed left-2 top-1/2 z-[210] flex min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/80 text-white backdrop-blur-sm transition-colors hover:border-red-500/50 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 md:left-4"
                aria-label="Poprzedni film"
              >
                <ChevronLeft className="h-7 w-7" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  goToNext()
                }}
                className="fixed right-2 top-1/2 z-[210] flex min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/80 text-white backdrop-blur-sm transition-colors hover:border-red-500/50 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 md:right-4"
                aria-label="Następny film"
              >
                <ChevronRight className="h-7 w-7" aria-hidden="true" />
              </button>
            </>
          )}

          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-[205] flex w-full max-w-md flex-col items-center px-10 md:max-w-lg md:px-14"
            onClick={(event) => event.stopPropagation()}
          >
            <motion.div
              drag={canNavigate ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.12}
              onDragEnd={handleDragEnd}
              className="relative w-full max-h-[78vh] overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl aspect-[9/16]"
            >
              <video
                key={current.id}
                ref={videoRef}
                className="h-full w-full object-contain bg-black"
                src={current.src}
                poster={current.poster}
                controls
                loop
                playsInline
                autoPlay
                preload="auto"
                aria-label={current.alt}
              />

              {canNavigate && (
                <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/10 bg-black/70 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  {safeIndex + 1} / {itemCount}
                </div>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
