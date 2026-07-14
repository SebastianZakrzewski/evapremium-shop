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
  onSelect,
}: ConfiguratorV2ImageOptionCardProps) => {
  const showPrice =
    priceAfterDiscount != null && priceAfterDiscount > 0

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`group flex w-fit max-w-[10rem] flex-col items-center rounded-lg border px-2 py-2 text-center transition-all duration-200 ${
        inline ? "" : "mx-auto"
      } ${
        selected
          ? "border-red-500/90 bg-red-500/[0.08] ring-1 ring-red-500/25 shadow-sm shadow-red-500/10"
          : "border-white/10 bg-[#0c0c0c] hover:border-white/20 hover:bg-white/[0.03]"
      }`}
    >
      <div
        className={`mb-1.5 inline-flex w-fit items-center justify-center rounded-md p-1 transition-colors ${
          selected
            ? "bg-white/[0.1] ring-1 ring-white/10"
            : "bg-white/[0.07] group-hover:bg-white/[0.09]"
        }`}
      >
        <Image
          src={imageSrc}
          alt={imageAlt || title}
          width={160}
          height={112}
          className="h-24 w-auto max-w-[9rem] object-contain drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)]"
        />
      </div>

      <p className="line-clamp-1 max-w-[9rem] text-[11px] font-semibold leading-tight text-white">
        {title}
      </p>
      {description && (
        <p className="mt-0.5 line-clamp-2 max-w-[9rem] text-[9px] leading-snug text-gray-400">
          {description}
        </p>
      )}

      {showPrice && (
        <div className="mt-1.5 w-full min-w-[5.5rem] border-t border-white/5 pt-1">
          <div className="flex flex-col items-center gap-0.5">
            {discount > 0 && basePrice != null && (
              <span className="text-[9px] text-gray-500 line-through tabular-nums leading-none">
                {formatPricePln(basePrice)}
              </span>
            )}
            <span className="text-[11px] font-semibold text-white tabular-nums leading-none">
              {formatPricePln(priceAfterDiscount)}
            </span>
          </div>
        </div>
      )}
    </button>
  )
}
