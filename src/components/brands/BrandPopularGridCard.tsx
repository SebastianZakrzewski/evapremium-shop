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

  onClick: (brand: Brand) => void

}



export default function BrandPopularGridCard({

  brand,

  isClicked = false,

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

        relative aspect-[4/5] w-full

        rounded-lg overflow-hidden

        border-2 border-white/20

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

      <div className="absolute top-1 left-1 w-4 h-4 border-t-2 border-l-2 border-white/40 rounded-tl-sm z-10" />

      <div className="absolute top-1 right-1 w-4 h-4 border-t-2 border-r-2 border-white/40 rounded-tr-sm z-10" />

      <div className="absolute bottom-1 left-1 w-4 h-4 border-b-2 border-l-2 border-white/40 rounded-bl-sm z-10" />

      <div className="absolute bottom-1 right-1 w-4 h-4 border-b-2 border-r-2 border-white/40 rounded-br-sm z-10" />



      {isImage && !imageError ? (

        <Image

          src={brand.logo}

          alt={`${brand.name} logo`}

          fill

          className={isBrandImage ? "object-cover object-center" : "object-contain p-4"}

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

        <h3 className="text-white font-bold text-center text-sm sm:text-base leading-tight drop-shadow-lg">

          {brand.name}

        </h3>

      </div>

    </div>

  )

}


