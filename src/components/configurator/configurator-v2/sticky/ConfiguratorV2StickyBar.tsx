"use client"

import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
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
  /** desktop: w kolumnie opcji; mobile: fixed na dole ekranu */
  variant?: "column" | "fixed"
}

export const ConfiguratorV2StickyBar = ({
  priceBreakdown,
  accessoryPrice = 0,
  isConfigComplete,
  showSummaryCta,
  onGoToSummary,
  onPriceClick,
  variant = "fixed",
}: ConfiguratorV2StickyBarProps) => {
  const totalWithAccessories = priceBreakdown.totalPrice + accessoryPrice
  const hasPrice = priceBreakdown.totalPrice > 0

  const positionClass =
    variant === "column"
      ? "relative w-full"
      : "relative w-full"

  return (
    <div
      className={`${positionClass} border-t border-white/10 bg-black/95 backdrop-blur-xl`}
      data-variant={variant}
    >
      <div className="px-3 lg:px-6 xl:px-10 py-2 lg:py-3 flex items-center justify-between gap-2.5 lg:gap-4">
        <button
          type="button"
          onClick={onPriceClick}
          disabled={!hasPrice}
          className="flex flex-col items-start text-left disabled:opacity-50 min-w-0"
          aria-label="Rozbij cenę"
        >
          {hasPrice ? (
            <>
              <div className="flex items-baseline gap-1.5 lg:gap-2">
                <span className="text-lg lg:text-2xl font-bold text-green-400 tabular-nums">
                  {formatPricePln(totalWithAccessories)}
                </span>
                {onPriceClick && (
                  <ChevronDown className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-gray-400 shrink-0" />
                )}
              </div>
              {priceBreakdown.discount > 0 && (
                <span className="text-[11px] lg:text-xs text-green-400 leading-tight">
                  Rabat: -{formatPriceValue(priceBreakdown.discount)} zł
                </span>
              )}
              {!isConfigComplete && (
                <span className="hidden sm:block text-[10px] text-gray-400 mt-0.5">
                  Uzupełnij konfigurację
                </span>
              )}
            </>
          ) : (
            <span className="text-xs lg:text-sm text-gray-400 leading-tight">
              Wybierz wariant aby zobaczyć cenę
            </span>
          )}
        </button>

        {showSummaryCta && (
          <Button
            type="button"
            onClick={onGoToSummary}
            disabled={!isConfigComplete}
            className="min-h-[40px] lg:min-h-[48px] min-w-[7.5rem] lg:min-w-[180px] px-3 lg:px-4 bg-red-600 hover:bg-red-700 text-white font-semibold shrink-0 rounded-md disabled:opacity-50"
            aria-label="Podsumowanie zamówienia"
          >
            <span className="text-xs lg:text-sm">
              <span className="lg:hidden">Podsumowanie</span>
              <span className="hidden lg:inline">Podsumowanie zamówienia</span>
            </span>
          </Button>
        )}
      </div>
    </div>
  )
}
