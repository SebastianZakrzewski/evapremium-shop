"use client"

import Image from "next/image"
import { formatPricePln } from "@/lib/utils/formatPrice"

type ConfiguratorV2ImageOptionCardProps = {
  selected: boolean
  title: string
  description?: string
  imageSrc: string
  imageAlt?: string
  basePrice?: number
  priceAfterDiscount?: number
  discount?: number
  inline?: boolean
  imageUnoptimized?: boolean
  imageFit?: "contain" | "cover"
  onSelect: () => void
}

/** Minimalna szerokość komórki siatki — dopasowana do zwartych kart */
export const CONFIGURATOR_V2_IMAGE_CARD_MIN_WIDTH = "8.5rem"

export const ConfiguratorV2ImageOptionCard = ({
  selected,
  title,
  description,
  imageSrc,
  imageAlt = "",
  basePrice,
  priceAfterDiscount,
  discount = 0,
  inline = false,
  imageUnoptimized = false,
  imageFit = "contain",
  onSelect,
}: ConfiguratorV2ImageOptionCardProps) => {
  const showPrice = priceAfterDiscount != null && priceAfterDiscount > 0

  const imageClassName =
    imageFit === "cover"
      ? "h-24 w-24 rounded-lg object-cover"
      : "h-24 w-auto max-w-[9rem] object-contain"

  const imageWidth = 160
  const imageHeight = imageFit === "cover" ? 160 : 112

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex flex-col rounded-2xl px-2 py-2 text-left transition-colors ${
        inline ? "w-[8.75rem]" : "w-full"
      } ${
        selected
          ? "bg-[#1c1c1e] ring-1 ring-inset ring-red-500"
          : "bg-[#1c1c1e]/70 hover:bg-[#2c2c2e]"
      }`}
    >
      <span className="mb-2 flex h-24 items-center justify-center overflow-hidden rounded-xl bg-black/35">
        <Image
          src={imageSrc}
          alt={imageAlt || title}
          width={imageWidth}
          height={imageHeight}
          unoptimized={imageUnoptimized}
          className={imageClassName}
        />
      </span>

      <span className="flex w-full items-start justify-between gap-2">
        <span className="min-w-0">
          <span className="line-clamp-2 block text-xs font-medium leading-tight tracking-tight text-white">
            {title}
          </span>
          {description && (
            <span className="mt-0.5 line-clamp-2 block text-[10px] leading-snug text-white/45">
              {description}
            </span>
          )}
        </span>
        {showPrice && (
          <span className="shrink-0 text-right">
            {discount > 0 && basePrice != null && (
              <span className="block text-[10px] text-white/35 line-through tabular-nums">
                {formatPricePln(basePrice)}
              </span>
            )}
            <span className="block text-xs font-medium tabular-nums text-white/80">
              {formatPricePln(priceAfterDiscount)}
            </span>
          </span>
        )}
      </span>
    </button>
  )
}
