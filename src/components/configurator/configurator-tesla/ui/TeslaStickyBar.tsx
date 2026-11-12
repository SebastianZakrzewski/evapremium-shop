"use client"

import { useEffect, useState } from "react"
import { formatPricePln } from "@/lib/utils/formatPrice"
import { TESLA_LAYOUT } from "../tokens"

const useMaxWidth = (width: number): boolean => {
  const [matches, setMatches] = useState(false)
  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${width}px)`)
    const sync = () => setMatches(query.matches)
    sync()
    query.addEventListener("change", sync)
    return () => query.removeEventListener("change", sync)
  }, [width])
  return matches
}

type TeslaStickyBarProps = {
  total: number
  disabled: boolean
  hint: string | null
  pending?: boolean
  inCart?: boolean
  onPriceClick: () => void
  onAddToCart: () => void
}

export const TeslaStickyBar = ({
  total,
  disabled,
  hint,
  pending = false,
  inCart = false,
  onPriceClick,
  onAddToCart,
}: TeslaStickyBarProps) => {
  const narrow = useMaxWidth(375)
  const cartLabel = narrow ? "W koszyku · Do koszyka" : "W koszyku · Przejdź do koszyka"
  return (
  <div
    className="border-t bg-white lg:flex lg:h-full lg:items-center lg:!min-h-0 lg:!p-0"
    style={{
      borderColor: TESLA_LAYOUT.border,
      minHeight: TESLA_LAYOUT.stickyBarMinHeight,
      padding: `${TESLA_LAYOUT.stickyBarPaddingTop}px ${TESLA_LAYOUT.stickyBarPaddingX}px calc(${TESLA_LAYOUT.stickyBarPaddingTop}px + env(safe-area-inset-bottom))`,
    }}
  >
    {hint ? (
      <p
        id="configurator-cta-hint"
        className="mb-2 lg:hidden"
        style={{
          fontSize: TESLA_LAYOUT.captionSize,
          lineHeight: `${TESLA_LAYOUT.captionLine}px`,
          color: TESLA_LAYOUT.muted,
        }}
      >
        {hint}
      </p>
    ) : null}
    <div className="mx-auto flex w-full items-center gap-3 lg:max-w-7xl lg:justify-between lg:px-8">
      <div className="flex min-w-0 items-center gap-4">
        <button
          type="button"
          onClick={onPriceClick}
          disabled={total <= 0}
          className="flex shrink-0 items-center gap-1 whitespace-nowrap text-left font-medium disabled:opacity-40"
          style={{
            fontSize: TESLA_LAYOUT.priceFontSize,
            lineHeight: `${TESLA_LAYOUT.priceLineHeight}px`,
            color: TESLA_LAYOUT.text,
          }}
          aria-label="Pokaż szczegóły ceny"
        >
          <span className="whitespace-nowrap">{total > 0 ? formatPricePln(total) : "—"}</span>
          <span aria-hidden>⌄</span>
        </button>
        {hint ? (
          <p
            className="hidden truncate lg:block"
            style={{
              fontSize: TESLA_LAYOUT.captionSize,
              lineHeight: `${TESLA_LAYOUT.captionLine}px`,
              color: TESLA_LAYOUT.muted,
            }}
          >
            {hint}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onAddToCart}
        aria-describedby={hint ? "configurator-cta-hint" : undefined}
        className="min-w-0 flex-1 whitespace-nowrap font-medium text-white lg:w-80 lg:flex-none"
        style={{
          height: TESLA_LAYOUT.buttonHeight,
          borderRadius: TESLA_LAYOUT.buttonRadius,
          backgroundColor: TESLA_LAYOUT.cta,
          padding: "0 10px",
          fontSize: 13,
          opacity: disabled || pending ? 0.55 : 1,
        }}
      >
        {pending ? "Dodawanie…" : inCart ? cartLabel : "Dodaj do koszyka"}
      </button>
    </div>
  </div>
  )
}
