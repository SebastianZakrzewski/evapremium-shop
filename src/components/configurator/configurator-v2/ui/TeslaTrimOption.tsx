"use client"

import { formatPricePln } from "@/lib/utils/formatPrice"
import { MatTypeOptionIcon } from "../mat-type/MatTypeOptionIcon"

type TeslaTrimOptionProps = {
  selected: boolean
  title: string
  subtitle?: string
  iconSrc?: string
  iconAlt?: string
  priceAfterDiscount?: number
  onSelect: () => void
}

export const TeslaTrimOption = ({
  selected,
  title,
  subtitle,
  iconSrc,
  iconAlt = "",
  priceAfterDiscount,
  onSelect,
}: TeslaTrimOptionProps) => (
  <button
    type="button"
    onClick={onSelect}
    aria-pressed={selected}
    className={`flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left transition-colors ${
      selected
        ? "bg-[#1c1c1e] ring-1 ring-inset ring-red-500"
        : "bg-[#1c1c1e]/70 hover:bg-[#2c2c2e]"
    }`}
  >
    {iconSrc && (
      <MatTypeOptionIcon
        src={iconSrc}
        alt={iconAlt || title}
        selected={selected}
      />
    )}
    <span className="min-w-0 flex-1">
      <span className="block text-sm font-medium leading-snug tracking-tight text-white">
        {title}
      </span>
      {subtitle && (
        <span className="mt-0.5 block text-xs leading-snug text-white/55">
          {subtitle}
        </span>
      )}
    </span>
    {priceAfterDiscount != null && priceAfterDiscount > 0 && (
      <span className="shrink-0 text-sm font-medium tabular-nums text-white/80">
        {formatPricePln(priceAfterDiscount)}
      </span>
    )}
  </button>
)
