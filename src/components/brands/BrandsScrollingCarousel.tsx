"use client"

import React, { useState, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { BrandCard } from "@/components/ui/BrandCard"
import { Brand } from "@/entities/car"

interface BrandsScrollingCarouselProps {
  brands: Brand[]
  onBrandClick: (brand: Brand) => void
  clickedCardId: number | null
}

const CARD_WIDTH = 312
const SCROLL_DISTANCE = 400
const SCROLL_DURATION = 50

export default function BrandsScrollingCarousel({
  brands,
  onBrandClick,
  clickedCardId
}: BrandsScrollingCarouselProps) {
  const [isPaused, setIsPaused] = useState(false)
  const [carouselOffset, setCarouselOffset] = useState(0)

  const goToPrevious = useCallback(() => {
    setIsPaused(true)
    setCarouselOffset((prev) => prev + SCROLL_DISTANCE)
    setTimeout(() => setIsPaused(false), 2000)
  }, [])

  const goToNext = useCallback(() => {
    setIsPaused(true)
    setCarouselOffset((prev) => prev - SCROLL_DISTANCE)
    setTimeout(() => setIsPaused(false), 2000)
  }, [])

  const brandSets = useMemo(() => {
    const sets = ["first", "second", "third", "fourth"]
    return sets.map((setKey) =>
      brands.map((brand, index) => (
        <div
          key={`${setKey}-${brand.id}`}
          className="flex-shrink-0 mx-3 cursor-pointer relative group"
          style={{ width: CARD_WIDTH }}
          onClick={() => onBrandClick(brand)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              onBrandClick(brand)
            }
          }}
          aria-label={`Wybierz markę ${brand.name}`}
        >
          <div className="transform transition-transform duration-300 group-hover:scale-105">
            <BrandCard
              brand={brand}
              className={clickedCardId === brand.id ? "animate-click" : ""}
              isPriority={index < 3 && setKey === "first"}
            />
          </div>
        </div>
      ))
    )
  }, [brands, clickedCardId, onBrandClick])

  if (brands.length === 0) return null

  return (
    <div
      className="w-full overflow-hidden relative py-10"
    >
      {/* Strzałki - spójne z ProductGallery */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white p-3 md:p-4 rounded-full transition-all duration-300 min-w-[44px] min-h-[44px] flex items-center justify-center group"
        aria-label="Przewiń karuzelę w lewo"
      >
        <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white p-3 md:p-4 rounded-full transition-all duration-300 min-w-[44px] min-h-[44px] flex items-center justify-center group"
        aria-label="Przewiń karuzelę w prawo"
      >
        <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>

      <div className="overflow-hidden">
        <motion.div
          className="flex"
          style={{ width: "max-content" }}
          animate={
            isPaused
              ? { x: carouselOffset }
              : { x: [carouselOffset, carouselOffset - SCROLL_DISTANCE * 2] }
          }
          transition={
            isPaused
              ? { x: { duration: 0.5, ease: "easeOut" } }
              : {
                  x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: SCROLL_DURATION,
                    ease: "linear"
                  }
                }
          }
        >
          {brandSets.map((set, i) => (
            <React.Fragment key={i}>{set}</React.Fragment>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
