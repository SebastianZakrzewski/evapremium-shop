"use client"

import React, { useEffect, useState } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, EffectCoverflow, Navigation, Pagination } from "swiper/modules"

import "swiper/css"
import "swiper/css/effect-coverflow"
import "swiper/css/pagination"
import "swiper/css/navigation"

import { BrandCard } from "@/components/ui/BrandCard"
import { Brand } from "@/entities/car"
import { getBrandsCarouselBehavior } from "@/components/brands/carouselBehavior"

interface BrandsScrollingCarouselProps {
  brands: Brand[]
  onBrandClick: (brand: Brand) => void
  clickedCardId: number | null
}

const swiperStyles = `
  .brands-scrolling-swiper {
    width: 100%;
    padding-bottom: 16px !important;
    touch-action: pan-y;
  }

  .brands-scrolling-swiper .swiper-slide {
    width: 228px;
    will-change: transform;
    backface-visibility: hidden;
  }

  @media (min-width: 640px) {
    .brands-scrolling-swiper .swiper-slide {
      width: 240px;
    }
  }

  @media (min-width: 1024px) {
    .brands-scrolling-swiper .swiper-slide {
      width: 288px;
    }
  }

  .brands-scrolling-swiper .swiper-3d .swiper-slide-shadow-left,
  .brands-scrolling-swiper .swiper-3d .swiper-slide-shadow-right {
    background-image: none;
    background: none;
  }

  /* Ukryj strzałki na mobile */
  @media (max-width: 639px) {
    .brands-scrolling-swiper .swiper-button-prev,
    .brands-scrolling-swiper .swiper-button-next {
      display: none;
    }

    .brands-scrolling-swiper .swiper-wrapper {
      transition-timing-function: linear;
    }
  }

  .brands-scrolling-swiper .swiper-button-prev,
  .brands-scrolling-swiper .swiper-button-next {
    color: #ef4444;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    width: 44px;
    height: 44px;
    top: 42%;
  }

  .brands-scrolling-swiper .swiper-button-prev::after,
  .brands-scrolling-swiper .swiper-button-next::after {
    font-size: 18px;
    font-weight: bold;
  }

  .brands-scrolling-swiper .swiper-button-prev:hover,
  .brands-scrolling-swiper .swiper-button-next:hover {
    background: rgba(239, 68, 68, 0.2);
  }
`

export default function BrandsScrollingCarousel({
  brands,
  onBrandClick,
  clickedCardId,
}: BrandsScrollingCarouselProps) {
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
  const carouselBehavior = getBrandsCarouselBehavior({
    isMobile,
    prefersReducedMotion,
    totalItems: brands.length,
  })

  if (brands.length === 0) return null

  return (
    <div className="w-full">
      <style>{swiperStyles}</style>
      <Swiper
        className="brands-scrolling-swiper"
        spaceBetween={isMobile ? 14 : 40}
        speed={isMobile ? 430 : carouselBehavior.speed}
        breakpoints={{
          640: { spaceBetween: 36 },
          768: { spaceBetween: 56 },
          1024: { spaceBetween: 72 },
        }}
        autoplay={{
          delay: isMobile ? 3000 : carouselBehavior.autoplayDelay + 300,
          disableOnInteraction: false,
          pauseOnMouseEnter: !isMobile,
        }}
        effect={carouselBehavior.effect}
        grabCursor={!isMobile}
        centeredSlides={carouselBehavior.centeredSlides}
        loop={carouselBehavior.loop}
        slidesPerView={carouselBehavior.slidesPerView}
        touchRatio={1}
        touchAngle={45}
        simulateTouch={true}
        allowTouchMove={true}
        watchSlidesProgress
        observer
        observeParents
        updateOnWindowResize
        threshold={isMobile ? 4 : 8}
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: isMobile ? 0 : 100,
          modifier: 2,
          slideShadows: false,
        }}
        pagination={false}
        navigation={!isMobile}
        modules={[EffectCoverflow, Autoplay, Pagination, Navigation]}
      >
        {brands.map((brand) => (
          <SwiperSlide key={brand.id}>
            <div
              className="cursor-pointer select-none"
              onClick={() => onBrandClick(brand)}
              role="button"
              tabIndex={0}
              aria-label={`Wybierz markę ${brand.name}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  onBrandClick(brand)
                }
              }}
            >
              <BrandCard
                brand={brand}
                className={clickedCardId === brand.id ? "scale-95 opacity-70" : ""}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
