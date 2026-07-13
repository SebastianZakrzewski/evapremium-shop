"use client"

import Image from "next/image"
import { formatPricePln } from "@/lib/utils/formatPrice"

type VariantOptionCardProps = {
  selected: boolean
  title: string
  description: string
  imageSrc: string
  basePrice: number
  priceAfterDiscount: number
  discount: number
  onSelect: () => void
}

export const VariantOptionCard = ({
  selected,
  title,
  description,
  imageSrc,
  basePrice,
  priceAfterDiscount,
  discount,
  onSelect,
}: VariantOptionCardProps) => (
  <button
    type="button"
    onClick={onSelect}
    className={`flex h-full min-h-[220px] w-full flex-col rounded-xl border bg-[#111] p-2.5 text-center transition md:min-h-[240px] md:p-3 ${
      selected
        ? "border-red-500 bg-red-500/10 ring-2 ring-red-500/30"
        : "border-white/10 hover:border-white/20 hover:bg-white/5"
    }`}
    aria-pressed={selected}
  >
    <div className="flex min-h-[3.25rem] flex-col justify-start">
      <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-white">
        {title}
      </h4>
      <p className="mt-1 line-clamp-2 min-h-[2rem] text-xs leading-snug text-gray-300">
        {description}
      </p>
    </div>

    <div className="flex flex-1 items-center justify-center py-2">
      <div className="flex h-[72px] w-full items-center justify-center rounded-lg bg-white/5 md:h-[88px]">
        <Image
          src={imageSrc}
          alt=""
          width={120}
          height={80}
          className="max-h-full max-w-[90%] object-contain"
        />
      </div>
    </div>

    <div className="mt-auto w-full border-t border-white/5 pt-2">
      <span className="text-[10px] uppercase tracking-wide text-gray-400">
        Cena
      </span>
      <div className="flex flex-wrap items-baseline justify-center gap-1">
        {discount > 0 && (
          <span className="text-xs text-gray-400 line-through">
            {formatPricePln(basePrice)}
          </span>
        )}
        <span className="text-sm font-bold text-white">
          {formatPricePln(priceAfterDiscount)}
        </span>
      </div>
    </div>
  </button>
)
