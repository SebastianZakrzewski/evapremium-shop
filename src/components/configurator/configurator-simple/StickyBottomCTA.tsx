"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ChevronUp, ZoomIn } from "lucide-react";
import Image from "next/image";
import { getColorInfo } from "@/lib/color-mapping";

interface StickyBottomCTAProps {
  priceBreakdown: {
    basePrice: number;
    discount: number;
    shippingCost: number;
    totalPrice: number;
  };
  config: {
    brand: string;
    model: string;
    color?: string;
    edgeColor?: string;
    matType?: string;
  };
  dynamicPreviewPath?: string;
  productPreviewPath?: string | null;
  hasFullPreview: boolean;
  currentStep: number;
  totalSteps: number;
  isAddingToCart: boolean;
  onAddToCart: () => void;
  onPreviewClick?: () => void;
}

export function StickyBottomCTA({
  priceBreakdown,
  config,
  dynamicPreviewPath,
  productPreviewPath,
  hasFullPreview,
  currentStep,
  totalSteps,
  isAddingToCart,
  onAddToCart,
  onPreviewClick,
}: StickyBottomCTAProps) {
  const [showPriceBreakdown, setShowPriceBreakdown] = React.useState(false);
  const [isHidden, setIsHidden] = React.useState(false);
  const progress = (currentStep / totalSteps) * 100;

  // Calculate total with potential accessories (podpietka)
  const totalPrice = priceBreakdown.totalPrice;

  // Hide component when adding to cart
  const handleAddToCart = () => {
    setIsHidden(true);
    onAddToCart();
  };

  // Show component again when cart modal closes
  React.useEffect(() => {
    const handleCartModalStateChange = (event: CustomEvent) => {
      const { isOpen } = event.detail;
      // If cart modal closes and component was hidden, show it again
      if (!isOpen && isHidden) {
        setIsHidden(false);
      }
    };

    window.addEventListener('cartModalStateChange', handleCartModalStateChange as EventListener);
    
    return () => {
      window.removeEventListener('cartModalStateChange', handleCartModalStateChange as EventListener);
    };
  }, [isHidden]);

  // Don't render if hidden
  if (isHidden) {
    return null;
  }

  return (
    <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-t border-white/10 shadow-2xl pb-safe transition-transform duration-300 ${
      isHidden ? 'translate-y-full' : 'animate-in slide-in-from-bottom-full'
    }`}>
      {/* Progress Bar */}
      <div className="h-1 bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main Content */}
      <div className="px-4 py-3">
        {/* Preview Thumbnail Row */}
        {(dynamicPreviewPath || productPreviewPath) && (
          <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/5">
            <button
              onClick={onPreviewClick}
              className="relative w-20 h-20 bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-xl border-2 border-red-500/30 overflow-hidden shadow-lg flex-shrink-0 active:scale-95 transition-all hover:border-red-500/50 hover:shadow-red-500/20 group"
            >
              <Image
                src={hasFullPreview && dynamicPreviewPath ? dynamicPreviewPath : (productPreviewPath || '')}
                alt="Podgląd"
                fill
                className="object-contain p-2.5"
                sizes="80px"
              />
              {/* Zoom icon overlay - subtle hint */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <ZoomIn className="w-5 h-5 text-white" />
              </div>
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-semibold text-white truncate">
                  {config.brand} {config.model}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                {hasFullPreview && config.color && config.edgeColor ? (
                  <span className="truncate">
                    {getColorInfo(config.color).name} / {getColorInfo(config.edgeColor).name}
                  </span>
                ) : (
                  <span>Konfiguruj...</span>
                )}
              </div>
              <button
                onClick={onPreviewClick}
                className="text-[10px] text-red-400 hover:text-red-300 font-medium flex items-center gap-1 active:opacity-70 transition-opacity"
              >
                <ZoomIn className="w-3 h-3" />
                <span>Dotknij aby powiększyć</span>
              </button>
            </div>
          </div>
        )}

        {/* Price and CTA Row */}
        <div className="flex items-center gap-3">
          {/* Price Section - tylko jeśli wybrano wariant (step 3) */}
          {currentStep >= 3 ? (
            <div className="flex-1 min-w-0">
              <button
                onClick={() => setShowPriceBreakdown(!showPriceBreakdown)}
                className="w-full text-left active:opacity-70 transition-opacity"
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-gray-400">Cena:</span>
                  {priceBreakdown.discount > 0 && (
                    <span className="text-sm text-gray-400 line-through">
                      {(priceBreakdown.basePrice).toFixed(2)} zł
                    </span>
                  )}
                  <span className="text-xl font-bold text-white">
                    {totalPrice.toFixed(2)} zł
                  </span>
                  <ChevronUp
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                      showPriceBreakdown ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                {priceBreakdown.discount > 0 && (
                  <div className="text-xs text-green-400 mt-0.5">
                    Rabat: -{priceBreakdown.discount.toFixed(2)} zł
                  </div>
                )}
              </button>

              {/* Expandable Price Breakdown */}
              {showPriceBreakdown && (
                <div className="mt-2 p-2 bg-[#111] rounded-lg border border-white/5 space-y-1 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Cena bazowa</span>
                    <span className="text-white">{priceBreakdown.basePrice.toFixed(2)} zł</span>
                  </div>
                  {priceBreakdown.discount > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Rabat</span>
                      <span className="text-green-400">-{priceBreakdown.discount.toFixed(2)} zł</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-400">
                Wybierz zestaw aby zobaczyć cenę
              </div>
            </div>
          )}

          {/* CTA Button */}
          <Button
            onClick={handleAddToCart}
            disabled={isAddingToCart || currentStep < totalSteps}
            className="min-h-[48px] min-w-[140px] bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold shadow-lg shadow-red-900/30 hover:shadow-red-900/50 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAddingToCart ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="text-sm">Dodawanie...</span>
              </div>
            ) : currentStep < totalSteps ? (
              <span className="text-sm">Kontynuuj</span>
            ) : (
              <span className="flex items-center gap-2 text-sm">
                <ShoppingCart className="w-4 h-4" />
                Do koszyka
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

