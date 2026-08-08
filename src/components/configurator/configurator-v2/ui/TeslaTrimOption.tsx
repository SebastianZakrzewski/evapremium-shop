"use client"

import { formatPricePln } from "@/lib/utils/formatPrice"

type TeslaTrimOptionProps = {
  selected: boolean
  title: string
  subtitle?: string
  priceAfterDiscount?: number
  onSelect: () => void
}

export const TeslaTrimOption = ({
  selected,
  title,
  subtitle,
  priceAfterDiscount,
  onSelect,
}: TeslaTrimOptionProps) => (
  <button
    type="button"
    onClick={onSelect}
    aria-pressed={selected}
    className={`w-full rounded-lg border px-3 py-2.5 text-left transition-all duration-200 ${
      selected
        ? "border-red-500/90 bg-red-500/[0.08] ring-1 ring-red-500/25"
        : "border-white/10 bg-[#0c0c0c] hover:border-white/20 hover:bg-white/[0.03]"
    }`}
  >
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3 min-w-0">
        <span
          className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 transition-colors ${
            selected ? "border-red-500 bg-red-500" : "border-white/40 bg-transparent"
          }`}
          aria-hidden
        />
        <div className="min-w-0">
          <p className="text-sm font-medium text-white leading-snug">{title}</p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-gray-400 leading-snug">{subtitle}</p>
          )}
        </div>
      </div>
      {priceAfterDiscount != null && priceAfterDiscount > 0 && (
        <span className="shrink-0 text-sm font-semibold text-green-400 tabular-nums">
          {formatPricePln(priceAfterDiscount)}
        </span>
      )}
    </div>
  </button>
)
