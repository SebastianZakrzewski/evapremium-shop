"use client"

import Image from "next/image"
import { RotateCcw } from "lucide-react"

type ProductSetGalleryProps = {
  images: string[]
  selectedImage: string
  onSelect: (imagePath: string) => void
  title?: string
  className?: string
}

export const ProductSetGallery = ({
  images,
  selectedImage,
  onSelect,
  title = "Galeria zestawu",
  className = "",
}: ProductSetGalleryProps) => {
  if (images.length === 0) return null

  return (
    <div
      className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 ${className}`.trim()}
    >
      <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
        <RotateCcw className="w-3 h-3" aria-hidden />
        {title}
      </h4>
      <div
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
        role="list"
        aria-label={title}
      >
        {images.map((imagePath) => {
          const isSelected = selectedImage === imagePath
          return (
            <button
              key={imagePath}
              type="button"
              role="listitem"
              onClick={() => onSelect(imagePath)}
              className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 flex-shrink-0 ${
                isSelected
                  ? "border-red-500 shadow-lg shadow-red-500/20 scale-105"
                  : "border-transparent opacity-60 hover:opacity-100 hover:border-white/20"
              }`}
              aria-label="Wybierz zdjęcie zestawu"
              aria-current={isSelected}
            >
              <Image
                src={imagePath}
                alt=""
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
