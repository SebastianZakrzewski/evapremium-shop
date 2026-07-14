"use client"

import { formatPricePln } from "@/lib/utils/formatPrice"

type TeslaTrimCardProps = {
  title: string
  description?: string
  priceLabel?: string
  priceAfterDiscount?: number
  selected: boolean
  onSelect: () => void
}

export const TeslaTrimCard = ({
  title,
  description,
  priceLabel,
  priceAfterDiscount,
  selected,
  onSelect,
}: TeslaTrimCardProps) => (
  <button
    type="button"
    onClick={onSelect}
    aria-pressed={selected}
    className={`w-full text-left rounded-md px-4 py-3.5 transition-all duration-150 flex items-start justify-between gap-4 ${
      selected
        ? "border-2 border-white bg-white/[0.06] shadow-sm"
        : "border border-white/20 bg-transparent hover:border-white/35 hover:bg-white/[0.03]"
    }`}
  >
    <div className="min-w-0">
      <p className="text-[15px] font-medium text-white leading-snug">{title}</p>
      {description && (
        <p className="text-sm text-gray-400 mt-0.5 leading-snug">{description}</p>
      )}
    </div>
    {(priceLabel || priceAfterDiscount !== undefined) && (
      <div className="shrink-0 text-right">
        <p className="text-[15px] font-medium text-white whitespace-nowrap">
          {priceLabel ??
            (priceAfterDiscount !== undefined ? formatPricePln(priceAfterDiscount) : "")}
        </p>
      </div>
    )}
  </button>
)
