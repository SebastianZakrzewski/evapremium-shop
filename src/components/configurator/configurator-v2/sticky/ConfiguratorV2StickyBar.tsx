"use client"

import Link from "next/link"
import { ArrowLeft, ChevronDown } from "lucide-react"
import { formatPricePln, formatPriceValue } from "@/lib/utils/formatPrice"

export type PriceBreakdown = {
  basePrice: number
  discount: number
  priceAfterDiscount: number
  totalPrice: number
}

type ConfiguratorV2StickyBarProps = {
  priceBreakdown: PriceBreakdown
  accessoryPrice?: number
  isConfigComplete: boolean
  showSummaryCta: boolean
  onGoToSummary: () => void
  onPriceClick?: () => void
  productLabel?: string
  /** header: pasek górny desktopu; fixed: dół mobile; column: zgodność testów */
  variant?: "column" | "fixed" | "header"
}

const summaryButtonClassName =
  "inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-40"

const quietButtonClassName =
  "inline-flex h-11 max-w-[11rem] shrink-0 items-center justify-center truncate rounded-full bg-white/10 px-4 text-sm font-medium text-white hover:bg-white/15 disabled:opacity-40"

export const ConfiguratorV2StickyBar = ({
  priceBreakdown,
  accessoryPrice = 0,
  isConfigComplete,
  showSummaryCta,
  onGoToSummary,
  onPriceClick,
  productLabel,
  variant = "fixed",
}: ConfiguratorV2StickyBarProps) => {
  const totalWithAccessories = priceBreakdown.totalPrice + accessoryPrice
  const hasPrice = priceBreakdown.totalPrice > 0
  const isHeader = variant === "header"

  const priceBlock = (
    <button
      type="button"
      onClick={onPriceClick}
      disabled={!hasPrice}
      className={`flex min-w-0 flex-col text-left disabled:opacity-50 ${
        isHeader ? "items-end" : "items-start"
      }`}
      aria-label="Rozbij cenę"
    >
      {hasPrice ? (
        <>
          <span className="flex items-center gap-1.5">
            <span className="text-lg font-semibold tabular-nums text-white lg:text-xl">
              {formatPricePln(totalWithAccessories)}
            </span>
            {onPriceClick && (
              <ChevronDown className="h-4 w-4 shrink-0 text-white/50" aria-hidden />
            )}
          </span>
          {priceBreakdown.discount > 0 && (
            <span className="text-[11px] leading-tight text-white/60">
              Rabat: -{formatPriceValue(priceBreakdown.discount)} zł
            </span>
          )}
          {!isConfigComplete && (
            <span className="mt-0.5 hidden text-[10px] leading-tight text-white/45 sm:block">
              Uzupełnij konfigurację
            </span>
          )}
        </>
      ) : (
        <span className="text-xs leading-tight text-white/50 lg:text-sm">
          Wybierz wariant aby zobaczyć cenę
        </span>
      )}
    </button>
  )

  const primaryCta = showSummaryCta ? (
    <button
      type="button"
      onClick={onGoToSummary}
      disabled={!isConfigComplete}
      className={summaryButtonClassName}
      aria-label="Podsumowanie zamówienia"
    >
      <span className="lg:hidden">Podsumowanie</span>
      <span className="hidden lg:inline">Podsumowanie zamówienia</span>
    </button>
  ) : null

  if (isHeader) {
    return (
      <div
        className="relative flex w-full items-center justify-between gap-4 bg-black px-4 py-3 xl:px-6"
        data-variant={variant}
      >
        <Link
          href="/modele"
          aria-label="Zmień model"
          className="inline-flex items-center gap-2 text-sm text-white hover:text-white/80"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          <span>Zmień model</span>
        </Link>
        <div className="flex min-w-0 items-center justify-end gap-3">
          {priceBlock}
          {showSummaryCta && (
            <button
              type="button"
              onClick={onGoToSummary}
              disabled={!isConfigComplete}
              className={quietButtonClassName}
            >
              Podsumowanie
            </button>
          )}
          {primaryCta}
        </div>
      </div>
    )
  }

  return (
    <div
      className="relative w-full border-t border-white/10 bg-black/95 backdrop-blur-xl"
      data-variant={variant}
    >
      <div className="flex items-center justify-between gap-2.5 px-3 py-2.5 lg:gap-4 lg:px-6 lg:py-3">
        {priceBlock}
        <div className="flex min-w-0 items-center justify-end gap-2">
          {variant === "fixed" && productLabel && (
            <span className="max-w-[34vw] truncate rounded-full bg-white/10 px-3 py-2 text-sm text-white sm:max-w-[11rem] sm:px-4">
              {productLabel}
            </span>
          )}
          {primaryCta}
        </div>
      </div>
    </div>
  )
}
