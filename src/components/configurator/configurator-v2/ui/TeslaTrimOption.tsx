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
    className={`flex min-h-11 w-full items-center gap-3 rounded-2xl border bg-[#FDFDFD] px-3.5 py-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 ${
      selected
        ? "border-2 border-neutral-950"
        : "border-neutral-300 hover:border-neutral-500"
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
      <span className="block text-sm font-medium leading-snug tracking-tight text-neutral-950">
        {title}
      </span>
      {subtitle && (
        <span className="mt-0.5 block text-xs leading-snug text-neutral-600">
          {subtitle}
        </span>
      )}
    </span>
    {priceAfterDiscount != null && priceAfterDiscount > 0 && (
      <span className="shrink-0 rounded-md bg-black px-1.5 py-0.5 text-sm font-medium tabular-nums text-white/80">
        {formatPricePln(priceAfterDiscount)}
      </span>
    )}
  </button>
)
