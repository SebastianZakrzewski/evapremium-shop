"use client"

import { ShoppingCart, ChevronDown } from "lucide-react"
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
  isReadyForCart: boolean
  isAddingToCart: boolean
  onAddToCart: () => void
  onPriceClick?: () => void
  /** desktop: w kolumnie opcji; mobile: fixed na dole ekranu */
  variant?: "column" | "fixed"
}

export const ConfiguratorV2StickyBar = ({
  priceBreakdown,
  accessoryPrice = 0,
  isReadyForCart,
  isAddingToCart,
  onAddToCart,
  onPriceClick,
  variant = "fixed",
}: ConfiguratorV2StickyBarProps) => {
  const totalWithAccessories = priceBreakdown.totalPrice + accessoryPrice
  const hasPrice = priceBreakdown.totalPrice > 0

  const positionClass =
    variant === "column"
      ? "relative"
      : "fixed bottom-0 left-0 right-0 z-40 pb-safe"

  return (
    <div
      className={`${positionClass} border-t border-white/10 bg-black/95 backdrop-blur-xl`}
      data-variant={variant}
    >
      <div className="px-4 lg:px-6 xl:px-10 py-3 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onPriceClick}
          disabled={!hasPrice}
          className="flex flex-col items-start text-left disabled:opacity-50 min-w-0"
          aria-label="Rozbij cenę"
        >
          {hasPrice ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-xl lg:text-2xl font-bold text-white tabular-nums">
                  {formatPricePln(totalWithAccessories)}
                </span>
                {onPriceClick && (
                  <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                )}
              </div>
              {priceBreakdown.discount > 0 && (
                <span className="text-xs text-green-400">
                  Rabat: -{formatPriceValue(priceBreakdown.discount)} zł
                </span>
              )}
              {!isReadyForCart && (
                <span className="text-[10px] text-gray-400 mt-0.5">
                  Uzupełnij konfigurację
                </span>
              )}
            </>
          ) : (
            <span className="text-sm text-gray-400">
              Wybierz wariant aby zobaczyć cenę
            </span>
          )}
        </button>

        <Button
          type="button"
          onClick={onAddToCart}
          disabled={!isReadyForCart || isAddingToCart}
          className="min-h-[48px] min-w-[140px] lg:min-w-[160px] bg-red-600 hover:bg-red-700 text-white font-semibold shrink-0 rounded-md"
          aria-label="Dodaj do koszyka"
        >
          {isAddingToCart ? (
            <span className="flex items-center gap-2 text-sm">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Dodawanie...
            </span>
          ) : (
            <span className="flex items-center gap-2 text-sm">
              <ShoppingCart className="w-4 h-4" />
              Do koszyka
            </span>
          )}
        </Button>
      </div>
    </div>
  )
}
