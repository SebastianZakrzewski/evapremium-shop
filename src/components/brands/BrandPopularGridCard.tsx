"use client"



import React, { useState } from "react"

import Image from "next/image"

import { Brand } from "@/entities/car"

import {

  BRAND_GRID_SIZES_COMPACT,

  isBrandPhotoFile,

  isModeleBrandPhoto,

  shouldServeBrandImageUnoptimized,

} from "@/shared/brands"



interface BrandPopularGridCardProps {

  brand: Brand

  isClicked?: boolean

  compact?: boolean

  onClick: (brand: Brand) => void

}



export default function BrandPopularGridCard({

  brand,

  isClicked = false,

  compact = false,

  onClick,

}: BrandPopularGridCardProps) {

  const [imageError, setImageError] = useState(false)

  const isImage = isBrandPhotoFile(brand.logo)

  const isBrandImage = isModeleBrandPhoto(brand.logo)

  const unoptimized = shouldServeBrandImageUnoptimized(brand.logo)



  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {

    if (e.key === "Enter" || e.key === " ") {

      e.preventDefault()

      onClick(brand)

    }

  }



  return (

    <div

      className={`

        relative w-full

        ${compact ? "aspect-[4/5] rounded-md" : "aspect-[4/5] rounded-lg"}

        overflow-hidden

        ${compact ? "border border-white/15" : "border-2 border-white/20"}

        bg-gradient-to-br from-gray-800 to-gray-900

        cursor-pointer select-none

        transition-all duration-300

        ${isClicked ? "scale-95 opacity-70" : "hover:border-white/40"}

      `}

      onClick={() => onClick(brand)}

      role="button"

      tabIndex={0}

      aria-label={`Wybierz markę ${brand.name}`}

      onKeyDown={handleKeyDown}

    >

      <div className={`absolute top-1 left-1 z-10 border-white/40 rounded-tl-sm ${compact ? "h-2.5 w-2.5 border-l border-t" : "h-4 w-4 border-l-2 border-t-2"}`} />

      <div className={`absolute top-1 right-1 z-10 border-white/40 rounded-tr-sm ${compact ? "h-2.5 w-2.5 border-r border-t" : "h-4 w-4 border-r-2 border-t-2"}`} />

      <div className={`absolute bottom-1 left-1 z-10 border-white/40 rounded-bl-sm ${compact ? "h-2.5 w-2.5 border-b border-l" : "h-4 w-4 border-b-2 border-l-2"}`} />

      <div className={`absolute bottom-1 right-1 z-10 border-white/40 rounded-br-sm ${compact ? "h-2.5 w-2.5 border-b border-r" : "h-4 w-4 border-b-2 border-r-2"}`} />



      {isImage && !imageError ? (

        <Image

          src={brand.logo}

          alt={`${brand.name} logo`}

          fill

          className={isBrandImage ? "object-cover object-center" : compact ? "object-contain p-2" : "object-contain p-4"}

          sizes={BRAND_GRID_SIZES_COMPACT}

          quality={100}

          unoptimized={unoptimized}

          onError={() => setImageError(true)}

        />

      ) : imageError ? (

        <div className="absolute inset-0 flex items-center justify-center bg-white/5">

          <span className="text-3xl font-bold text-white/30 select-none">

            {brand.name.charAt(0)}

          </span>

        </div>

      ) : null}



      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />



      <div className="absolute inset-0 flex items-center justify-center p-2 z-10">

        <h3 className={`text-white font-bold text-center leading-tight drop-shadow-lg ${compact ? "text-xs sm:text-sm" : "text-sm sm:text-base"}`}>

          {brand.name}

        </h3>

      </div>

    </div>

  )

}


