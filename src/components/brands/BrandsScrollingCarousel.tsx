"use client"

import React from "react"
import { Brand } from "@/entities/car"
import BrandPopularGridCard from "@/components/brands/BrandPopularGridCard"

interface BrandsScrollingCarouselProps {
  brands: Brand[]
  onBrandClick: (brand: Brand) => void
  clickedCardId: number | null
}

export default function BrandsScrollingCarousel({
  brands,
  onBrandClick,
  clickedCardId,
}: BrandsScrollingCarouselProps) {
  if (brands.length === 0) return null

  const visibleBrands = brands.slice(0, 12)

  return (
    <div className="w-full px-2">
      <div className="grid grid-cols-3 gap-2">
        {visibleBrands.map((brand) => (
          <BrandPopularGridCard
            key={brand.id}
            brand={brand}
            isClicked={clickedCardId === brand.id}
            onClick={onBrandClick}
          />
        ))}
      </div>

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
  )
}
