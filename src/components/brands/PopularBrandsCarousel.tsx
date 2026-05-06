"use client"

import React, { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, EffectCoverflow, Navigation, Pagination } from "swiper/modules"
import { Car, Loader2 } from "lucide-react"

import "swiper/css"
import "swiper/css/effect-coverflow"
import "swiper/css/pagination"
import "swiper/css/navigation"

import { BrandCard } from "@/components/ui/BrandCard"
import { useBrands } from "@/features/brands/hooks/useBrands"
import { Brand } from "@/entities/car"

const swiperStyles = `
  .brands-swiper {
    width: 100%;
    padding-bottom: 56px !important;
  }

  .brands-swiper .swiper-slide {
    background-position: center;
    background-size: cover;
    width: 288px;
  }

  .brands-swiper .swiper-slide img {
    display: block;
    width: 100%;
  }

  .brands-swiper .swiper-3d .swiper-slide-shadow-left,
  .brands-swiper .swiper-3d .swiper-slide-shadow-right {
    background-image: none;
    background: none;
  }

  .brands-swiper .swiper-pagination-bullet {
    background: #ef4444;
    opacity: 0.5;
  }

  .brands-swiper .swiper-pagination-bullet-active {
    background: #ef4444;
    opacity: 1;
  }

  .brands-swiper .swiper-button-prev,
  .brands-swiper .swiper-button-next {
    color: #ef4444;
    background: rgba(0,0,0,0.5);
    border-radius: 50%;
    width: 44px;
    height: 44px;
    top: 42%;
  }

  .brands-swiper .swiper-button-prev::after,
  .brands-swiper .swiper-button-next::after {
    font-size: 18px;
    font-weight: bold;
  }

  .brands-swiper .swiper-button-prev:hover,
  .brands-swiper .swiper-button-next:hover {
    background: rgba(239,68,68,0.2);
  }
`

export default function PopularBrandsCarousel() {
  const router = useRouter()
  const { brands, isLoading, error: fetchError } = useBrands()
  const [failedImageIds, setFailedImageIds] = useState<Set<string>>(new Set())

  const handleImageError = useCallback((brandId: string) => {
    setFailedImageIds((prev) => new Set([...prev, brandId]))
  }, [])

  const handleBrandClick = (brand: Brand) => {
    router.push(`/modele/${encodeURIComponent(brand.name.toLowerCase())}`)
  }

  if (isLoading) {
    return (
      <section className="py-20 bg-black relative overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="w-12 h-12 text-red-500 animate-spin mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Popularne Marki Samochodów
            </h2>
            <p className="text-gray-400 text-lg">Ładowanie dostępnych marek...</p>
          </div>
        </div>
      </section>
    )
  }

  if (fetchError && brands.length === 0) {
    return (
      <section className="py-20 bg-black relative overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Car className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Popularne Marki Samochodów
            </h2>
            <p className="text-red-400 text-lg mb-4">
              Nie udało się pobrać marek samochodów
            </p>
            <p className="text-gray-400">
              Spróbuj odświeżyć stronę lub skontaktuj się z nami.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-black relative overflow-hidden">
      <style>{swiperStyles}</style>

      <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-black to-red-800/5" />

      <div className="container mx-auto px-4 relative z-10 mb-12">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Popularne Marki <span className="text-red-500">Samochodów</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Wybierz markę swojego auta i odkryj nasze precyzyjnie dopasowane
            dywaniki samochodowe. Oferujemy rozwiązania dla ponad{" "}
            {brands.length} marek samochodów.
          </p>
          {fetchError && (
            <p className="text-yellow-400 text-sm mt-2">
              ⚠️ Używamy ograniczonych danych (API tymczasowo niedostępne)
            </p>
          )}
        </div>
      </div>

      <div className="relative z-10 w-full">
        <Swiper
          key={`brands-swiper-${brands.filter((b) => !failedImageIds.has(String(b.id))).length}`}
          className="brands-swiper"
          spaceBetween={32}
          autoplay={{
            delay: 2000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          effect="coverflow"
          grabCursor={true}
          centeredSlides={true}
          loop={brands.filter((b) => !failedImageIds.has(String(b.id))).length > 3}
          slidesPerView="auto"
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 120,
            modifier: 2.5,
            slideShadows: false,
          }}
          pagination={{ clickable: true }}
          navigation={{
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          }}
          modules={[EffectCoverflow, Autoplay, Pagination, Navigation]}
        >
          {brands
            .filter((brand) => !failedImageIds.has(String(brand.id)))
            .map((brand) => (
              <SwiperSlide key={brand.id}>
                <div
                  className="cursor-pointer"
                  onClick={() => handleBrandClick(brand)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Wybierz markę ${brand.name}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      handleBrandClick(brand)
                    }
                  }}
                >
                  <BrandCard
                    brand={brand}
                    onImageError={() => handleImageError(String(brand.id))}
                  />
                </div>
              </SwiperSlide>
            ))}
        </Swiper>
      </div>

      <div className="container mx-auto px-4 relative z-10 mt-4">
        <div className="text-center">
          <p className="text-gray-400 text-sm">
            Kliknij na markę, aby zobaczyć dostępne modele i spersonalizować dywaniki
          </p>
        </div>
      </div>
    </section>
  )
}
