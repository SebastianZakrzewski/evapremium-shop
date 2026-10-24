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
    className={`flex w-full items-center gap-3 rounded-xl border-2 px-3 py-3 text-left transition-colors ${
      selected
        ? "border-red-600 bg-red-600/10"
        : "border-white/15 bg-transparent hover:border-white/40"
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
      <span className="block text-sm font-medium leading-snug text-white">
        {title}
      </span>
      {subtitle && (
        <span className="mt-0.5 block text-xs leading-snug text-white/60">
          {subtitle}
        </span>
      )}
    </span>
    {priceAfterDiscount != null && priceAfterDiscount > 0 && (
      <span className="shrink-0 text-sm font-semibold tabular-nums text-white">
        {formatPricePln(priceAfterDiscount)}
      </span>
    )}
  </button>
)
