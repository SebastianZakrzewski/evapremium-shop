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
  const [isMediaReady, setIsMediaReady] = useState(false)
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
    setIsMediaReady(false)
  }, [isOpen, safeIndex])

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

    let cancelled = false

    const playWithSound = async () => {
      if (cancelled) return

      el.muted = false
      el.defaultMuted = false
      el.volume = 1

      // Avoid seek flash — only restart if the clip already progressed
      if (el.currentTime > 0.15) {
        await new Promise<void>((resolve) => {
          const handleSeeked = () => {
            el.removeEventListener("seeked", handleSeeked)
            resolve()
          }
          el.addEventListener("seeked", handleSeeked)
          try {
            el.currentTime = 0
          } catch {
            el.removeEventListener("seeked", handleSeeked)
            resolve()
          }
        })
      }

      if (cancelled) return

      try {
        await el.play()
        if (!cancelled) {
          setIsMediaReady(true)
        }
      } catch {
        if (cancelled) return
        requestAnimationFrame(() => {
          if (cancelled) return
          el.play()
            .then(() => {
              if (!cancelled) setIsMediaReady(true)
            })
            .catch(() => undefined)
        })
      }
    }

    const handleCanPlay = () => {
      void playWithSound()
    }

    if (el.readyState >= 3) {
      void playWithSound()
    } else {
      el.addEventListener("canplay", handleCanPlay, { once: true })
    }

    return () => {
      cancelled = true
      el.pause()
      el.removeEventListener("canplay", handleCanPlay)
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
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black p-0 md:bg-black/40 md:p-8 md:backdrop-blur-[2px]"
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="relative z-[205] flex h-full w-full flex-col items-center md:h-auto md:max-w-md md:px-14 lg:max-w-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <motion.div
              drag={canNavigate ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.12}
              onDragEnd={handleDragEnd}
              className="relative h-full w-full overflow-hidden bg-black shadow-2xl md:aspect-[9/16] md:h-auto md:max-h-[78vh] md:rounded-2xl md:border md:border-white/10"
            >
              <video
                key={current.id}
                ref={videoRef}
                className={`h-full w-full bg-black object-cover transition-opacity duration-150 md:object-contain ${
                  isMediaReady ? "opacity-100" : "opacity-0"
                }`}
                controls
                loop
                playsInline
                preload="auto"
                poster={current.poster}
                aria-label={current.alt}
                onPlaying={() => setIsMediaReady(true)}
              >
                <source src={current.src} type="video/mp4" />
              </video>

              {canNavigate && (
                <div className="pointer-events-none absolute bottom-16 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/10 bg-black/70 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm md:bottom-3">
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
