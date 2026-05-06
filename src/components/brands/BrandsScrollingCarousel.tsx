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

  // Na mobile pokazujemy tylko 12 marek (4 rzędy x 3 kolumny)
  const visibleBrandsOnMobile = brands.slice(0, 12)

  return (
    <div className="w-full">
      <style>{swiperStyles}</style>
      
      {/* Grid na mobile - uproszczony styl */}
      <div className="md:hidden px-2">
        <div className="grid grid-cols-3 gap-2">
          {visibleBrandsOnMobile.map((brand) => {
            const isImage = brand.logo.includes('.jpg') || 
                          brand.logo.includes('.png') || 
                          brand.logo.includes('.jpeg') || 
                          brand.logo.includes('.avif') || 
                          brand.logo.includes('.webp')
            
            return (
              <div
                key={brand.id}
                className={`
                  relative aspect-[4/5] w-full
                  rounded-lg overflow-hidden
                  border-2 border-white/20
                  bg-gradient-to-br from-gray-900 to-black
                  cursor-pointer select-none
                  transition-all duration-300
                  ${clickedCardId === brand.id ? "scale-95 opacity-70" : "hover:border-white/40"}
                `}
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
                {/* Corner brackets */}
                <div className="absolute top-1 left-1 w-4 h-4 border-t-2 border-l-2 border-white/40 rounded-tl-sm z-10" />
                <div className="absolute top-1 right-1 w-4 h-4 border-t-2 border-r-2 border-white/40 rounded-tr-sm z-10" />
                <div className="absolute bottom-1 left-1 w-4 h-4 border-b-2 border-l-2 border-white/40 rounded-bl-sm z-10" />
                <div className="absolute bottom-1 right-1 w-4 h-4 border-b-2 border-r-2 border-white/40 rounded-br-sm z-10" />
                
                {/* Background image */}
                {isImage && (
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
                
                {/* Brand name */}
                <div className="absolute inset-0 flex items-center justify-center p-2">
                  <h3 className="text-white font-bold text-center text-sm sm:text-base leading-tight drop-shadow-lg">
                    {brand.name}
                  </h3>
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Button "Sprawdź więcej marek" - tylko jeśli jest więcej niż 12 marek */}
        {brands.length > 12 && (
          <div className="mt-6 flex justify-center">
            <a
              href="/dywaniki"
              className="
                px-6 py-3 
                bg-red-600 hover:bg-red-700 
                text-white font-bold 
                rounded-lg 
                transition-all duration-300
                shadow-lg shadow-red-900/50
                hover:shadow-xl hover:shadow-red-900/70
                active:scale-95
              "
            >
              Sprawdź więcej marek
            </a>
          </div>
        )}
      </div>

      {/* Karuzela na desktop */}
      <div className="hidden md:block">
        <Swiper
          className="brands-scrolling-swiper"
          spaceBetween={40}
          speed={carouselBehavior.speed}
          breakpoints={{
            640: { spaceBetween: 36 },
            768: { spaceBetween: 56 },
            1024: { spaceBetween: 72 },
          }}
          autoplay={{
            delay: carouselBehavior.autoplayDelay + 300,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          effect={carouselBehavior.effect}
          grabCursor={true}
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
          threshold={8}
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 100,
            modifier: 2,
            slideShadows: false,
          }}
          pagination={false}
          navigation={true}
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
    </div>
  )
}
