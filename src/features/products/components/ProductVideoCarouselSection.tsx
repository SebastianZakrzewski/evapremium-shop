"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Play, Pause } from "lucide-react"
import { Swiper, SwiperSlide } from "swiper/react"
import type { Swiper as SwiperInstance } from "swiper"
import { Navigation, Pagination } from "swiper/modules"

import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"

import { productVideos, type ProductVideo } from "../data/productVideos"
import { ProductVideoLightbox } from "./ProductVideoLightbox"

const swiperStyles = `
  .product-videos-swiper {
    width: 100%;
    padding-bottom: 56px !important;
  }

  .product-videos-swiper .swiper-slide {
    width: 220px;
  }

  @media (min-width: 768px) {
    .product-videos-swiper .swiper-slide {
      width: 260px;
    }
  }

  .product-videos-swiper .swiper-pagination-bullet {
    background: #ef4444;
    opacity: 0.5;
  }

  .product-videos-swiper .swiper-pagination-bullet-active {
    background: #ef4444;
    opacity: 1;
  }

  .product-videos-swiper .swiper-button-prev,
  .product-videos-swiper .swiper-button-next {
    color: #ffffff;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    width: 44px;
    height: 44px;
    top: 42%;
  }

  .product-videos-swiper .swiper-button-prev::after,
  .product-videos-swiper .swiper-button-next::after {
    font-size: 18px;
    font-weight: bold;
  }

  .product-videos-swiper .swiper-button-prev:hover,
  .product-videos-swiper .swiper-button-next:hover {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
  }

  .product-videos-swiper .swiper-button-prev:focus-visible,
  .product-videos-swiper .swiper-button-next:focus-visible {
    outline: 2px solid rgba(239, 68, 68, 0.5);
    outline-offset: 2px;
  }

  @media (max-width: 767px) {
    .product-videos-swiper .swiper-button-prev,
    .product-videos-swiper .swiper-button-next {
      display: none;
    }
  }
`

type VideoCardProps = {
  video: ProductVideo
  isActive: boolean
  isSectionVisible: boolean
  prefersReducedMotion: boolean
  onExpand: () => void
}

const FIRST_FRAME_TIME = 0.05

const CLICK_MOVE_THRESHOLD_PX = 8

const seekToFirstFrame = (el: HTMLVideoElement) => {
  try {
    if (Number.isFinite(el.duration) && el.duration > 0) {
      el.currentTime = Math.min(FIRST_FRAME_TIME, el.duration * 0.01)
      return
    }
    el.currentTime = FIRST_FRAME_TIME
  } catch {
    // Ignore seek errors before metadata is ready
  }
}

const captureFirstFrame = (el: HTMLVideoElement): string | null => {
  try {
    if (!el.videoWidth || !el.videoHeight) return null
    const canvas = document.createElement("canvas")
    canvas.width = el.videoWidth
    canvas.height = el.videoHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) return null
    ctx.drawImage(el, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL("image/jpeg", 0.82)
  } catch {
    return null
  }
}

const ProductVideoCard = ({
  video,
  isActive,
  isSectionVisible,
  prefersReducedMotion,
  onExpand,
}: VideoCardProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasVideoError, setHasVideoError] = useState(false)
  const [firstFrameSrc, setFirstFrameSrc] = useState<string | null>(null)

  const handleCaptureFirstFrame = useCallback(() => {
    const el = videoRef.current
    if (!el || firstFrameSrc) return

    const frame = captureFirstFrame(el)
    if (frame) {
      setFirstFrameSrc(frame)
    }
  }, [firstFrameSrc])

  const handleLoadedData = () => {
    const el = videoRef.current
    if (!el) return

    const onSeeked = () => {
      handleCaptureFirstFrame()
      el.removeEventListener("seeked", onSeeked)
    }

    el.addEventListener("seeked", onSeeked)
    seekToFirstFrame(el)
  }

  useEffect(() => {
    const el = videoRef.current
    if (!el || hasVideoError) {
      setIsPlaying(false)
      return
    }

    const shouldPlay = isActive && isSectionVisible && !prefersReducedMotion

    if (!shouldPlay) {
      el.pause()
      seekToFirstFrame(el)
      setIsPlaying(false)
      return
    }

    const playPromise = el.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false))
    }
  }, [isActive, isSectionVisible, hasVideoError, prefersReducedMotion])

  const handlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
    pointerStartRef.current = { x: event.clientX, y: event.clientY }
  }

  const handlePointerUp = (event: React.PointerEvent<HTMLElement>) => {
    const start = pointerStartRef.current
    pointerStartRef.current = null
    if (!start) return

    const dx = Math.abs(event.clientX - start.x)
    const dy = Math.abs(event.clientY - start.y)
    if (dx > CLICK_MOVE_THRESHOLD_PX || dy > CLICK_MOVE_THRESHOLD_PX) return

    onExpand()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      onExpand()
    }
  }

  const handleVideoError = () => {
    setHasVideoError(true)
    setIsPlaying(false)
  }

  const showStaticFirstFrame = !isPlaying && (Boolean(firstFrameSrc) || hasVideoError)

  return (
    <article
      data-testid="product-video-card"
      role="button"
      tabIndex={0}
      aria-label={`Powiększ film: ${video.title}`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onKeyDown={handleKeyDown}
      className="relative w-full aspect-[9/16] rounded-xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50 bg-black cursor-pointer hover:border-red-500/40 transition-[border-color] duration-300 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-black"
    >
      {!hasVideoError && (
        <video
          ref={videoRef}
          className={`absolute inset-0 h-full w-full object-cover pointer-events-none ${isPlaying ? "opacity-100" : "opacity-0"}`}
          src={`${video.src}#t=${FIRST_FRAME_TIME}`}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          onLoadedData={handleLoadedData}
          onError={handleVideoError}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}

      {showStaticFirstFrame && (
        <img
          src={firstFrameSrc ?? video.poster}
          alt=""
          className="absolute inset-0 h-full w-full object-cover pointer-events-none"
        />
      )}

      {!isPlaying && !firstFrameSrc && !hasVideoError && (
        <div className="absolute inset-0 bg-black pointer-events-none" aria-hidden="true" />
      )}

      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-black/60 border border-white/20 text-white pointer-events-none min-h-[44px] min-w-[44px]"
        aria-hidden="true"
      >
        {isPlaying ? (
          <Pause className="w-5 h-5" />
        ) : (
          <Play className="w-5 h-5 ml-0.5" />
        )}
      </div>
    </article>
  )
}

export default function ProductVideoCarouselSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [isSectionVisible, setIsSectionVisible] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const sectionRef = useRef<HTMLElement>(null)

  const isLightboxOpen = lightboxIndex !== null

  useEffect(() => {
    if (typeof window === "undefined") return

    const reducedMotionMediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    const handleSettingsChange = () => {
      setPrefersReducedMotion(reducedMotionMediaQuery.matches)
    }

    handleSettingsChange()
    reducedMotionMediaQuery.addEventListener("change", handleSettingsChange)

    return () => {
      reducedMotionMediaQuery.removeEventListener("change", handleSettingsChange)
    }
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
        setIsSectionVisible(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  const handleSlideChange = useCallback((swiper: SwiperInstance) => {
    setActiveIndex(swiper.realIndex)
  }, [])

  const handleExpandVideo = useCallback((index: number) => {
    setLightboxIndex(index)
  }, [])

  const handleCloseLightbox = useCallback(() => {
    setLightboxIndex(null)
  }, [])

  return (
    <section
      ref={sectionRef}
      id="product-videos"
      data-section="product-videos"
      className="w-full bg-black py-10 md:py-14 relative overflow-hidden"
      role="region"
      aria-label="Premium w akcji - krótkie reklamy EVA Premium"
    >
      <style>{swiperStyles}</style>

      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-red-900/8 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-red-800/6 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        <div
          className={`text-center mb-12 md:mb-16 transition-all duration-1000 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 md:mb-6 leading-tight">
            Premium w <span className="text-red-500">akcji</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed px-2">
            Krótkie reklamy EVA Premium — zobacz jakość, która buduje zaufanie i zachęca do zakupu.
          </p>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6">
        <Swiper
          className="product-videos-swiper"
          modules={[Navigation, Pagination]}
          slidesPerView="auto"
          spaceBetween={16}
          centeredSlides
          loop={productVideos.length > 2}
          grabCursor
          pagination={{ clickable: true }}
          navigation
          onSlideChange={handleSlideChange}
          onSwiper={(swiper) => setActiveIndex(swiper.realIndex)}
          aria-label="Karuzela materiałów reklamowych EVA Premium"
        >
          {productVideos.map((video, index) => (
            <SwiperSlide key={video.id}>
              <ProductVideoCard
                video={video}
                isActive={productVideos[activeIndex]?.id === video.id}
                isSectionVisible={isSectionVisible && !isLightboxOpen}
                prefersReducedMotion={prefersReducedMotion}
                onExpand={() => handleExpandVideo(index)}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 mt-12 text-center">
        <Link
          href="/dywaniki"
          className="inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-4 text-sm md:text-base font-bold text-white transition-all duration-300 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-full shadow-xl shadow-red-900/30 hover:scale-105 hover:shadow-2xl hover:shadow-red-600/20 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-black min-h-[44px]"
          aria-label="Sprawdź dostępność dywaników dla Twojego auta"
        >
          Sprawdź Dostępność Dla Twojego Auta
        </Link>
      </div>

      <ProductVideoLightbox
        isOpen={isLightboxOpen}
        videos={productVideos}
        currentIndex={lightboxIndex ?? 0}
        onIndexChange={setLightboxIndex}
        onClose={handleCloseLightbox}
      />
    </section>
  )
}
