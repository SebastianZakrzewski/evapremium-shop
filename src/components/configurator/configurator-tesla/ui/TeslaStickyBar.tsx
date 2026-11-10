"use client"

import { formatPricePln } from "@/lib/utils/formatPrice"
import { TESLA_LAYOUT } from "../tokens"

type TeslaStickyBarProps = {
  total: number
  disabled: boolean
  hint: string | null
  pending?: boolean
  onPriceClick: () => void
  onAddToCart: () => void
}

export const TeslaStickyBar = ({
  total,
  disabled,
  hint,
  pending = false,
  onPriceClick,
  onAddToCart,
}: TeslaStickyBarProps) => (
  <div
    className="border-t bg-white"
    style={{
      borderColor: TESLA_LAYOUT.border,
      minHeight: TESLA_LAYOUT.stickyBarMinHeight,
      padding: `${TESLA_LAYOUT.stickyBarPaddingTop}px ${TESLA_LAYOUT.stickyBarPaddingX}px calc(${TESLA_LAYOUT.stickyBarPaddingTop}px + env(safe-area-inset-bottom))`,
    }}
  >
    {hint ? (
      <p
        id="configurator-cta-hint"
        className="mb-2"
        style={{
          fontSize: TESLA_LAYOUT.captionSize,
          lineHeight: `${TESLA_LAYOUT.captionLine}px`,
          color: TESLA_LAYOUT.muted,
        }}
      >
        {hint}
      </p>
    ) : null}
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onPriceClick}
        disabled={total <= 0}
        className="flex min-w-0 flex-1 items-center gap-1 text-left font-medium disabled:opacity-40"
        style={{
          fontSize: TESLA_LAYOUT.priceFontSize,
          lineHeight: `${TESLA_LAYOUT.priceLineHeight}px`,
          color: TESLA_LAYOUT.text,
        }}
        aria-label="Pokaż szczegóły ceny"
      >
        <span>{total > 0 ? formatPricePln(total) : "—"}</span>
        <span aria-hidden>⌄</span>
      </button>
      <button
        type="button"
        onClick={onAddToCart}
        aria-describedby={hint ? "configurator-cta-hint" : undefined}
        className="shrink-0 font-medium text-white"
        style={{
          height: TESLA_LAYOUT.buttonHeight,
          borderRadius: TESLA_LAYOUT.buttonRadius,
          backgroundColor: TESLA_LAYOUT.cta,
          padding: "0 18px",
          fontSize: TESLA_LAYOUT.bodySize,
          opacity: disabled || pending ? 0.55 : 1,
        }}
      >
        {pending ? "Dodawanie…" : "Dodaj do koszyka"}
      </button>
    </div>
  </div>
)
