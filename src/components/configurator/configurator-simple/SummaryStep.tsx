"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getColorInfo } from "@/lib/color-mapping";
import { getMatImagePath } from "@/lib/image-mapping";
import { getMatTypeForDynamicPreview } from "./rugPreviewConfig";
import {
  getMatProductSubtitleLabel,
  getMatProductTitleLabel,
} from "@/shared/mat-set-labels";
import type { ConfiguratorState } from "@/features/car-configurator/utils/configuratorState";
import { useAccessories } from "@/features/accessories/hooks/useAccessories";
import { resolveConfiguratorBrandImage } from "@/features/car-configurator/utils/resolveConfiguratorBrandImage";
import { shouldServeBrandImageUnoptimized } from "@/shared/brands";
import { Plus, CheckCircle2, ShoppingCart } from "lucide-react";
import { formatPricePln, formatPriceValue } from "@/lib/utils/formatPrice";
import {
  CELL_STRUCTURE_DIAMONDS_ICON_SRC,
  CELL_STRUCTURE_HONEY_ICON_SRC,
} from "@/components/configurator/configurator-v2/structure/cellStructurePresentation";

interface SummaryStepProps {
  config: ConfiguratorState;
  priceBreakdown?: {
    basePrice: number;
    discount: number;
    shippingCost: number;
    totalPrice: number;
  };
  onPrevious: () => void;
  onAddToCart: () => void;
  isAddingToCart: boolean;
  cartActionError?: string | null;
  stickyMobileActions?: boolean;
}

const structureNames: Record<string, string> = {
  diamonds: "Romby",
  honey: "Plaster miodu",
};

export function SummaryStep({
  config,
  priceBreakdown,
  onPrevious,
  onAddToCart,
  isAddingToCart,
  cartActionError,
  stickyMobileActions = false,
}: SummaryStepProps) {
  const { accessories } = useAccessories();
  
  const selectedPodpietka = useMemo(() => {
    if (!config.selectedPodpietka) return null;
    return accessories.find(acc => acc.id === config.selectedPodpietka) || null;
  }, [accessories, config.selectedPodpietka]);
  
  const brandLogo = useMemo(
    () =>
      resolveConfiguratorBrandImage({
        brand: config.brand,
        brandKey: config.brandKey,
      }),
    [config.brand, config.brandKey],
  );
  
  // Generuj miniaturkę dywanika
  const matThumbnail = useMemo(() => {
    if (!config.structure || !config.color || !config.edgeColor) return null;
    const matType = getMatTypeForDynamicPreview(
      config.matType,
      config.pricingCategoryKey,
    );
    return getMatImagePath(
      matType,
      config.structure as 'diamonds' | 'honey',
      config.color,
      config.edgeColor
    );
  }, [
    config.matType,
    config.pricingCategoryKey,
    config.structure,
    config.color,
    config.edgeColor,
  ]);
  
  // Ścieżka do miniaturki struktury
  const structureThumbnail = useMemo(() => {
    if (!config.structure) return null;
    return config.structure === "diamonds"
      ? CELL_STRUCTURE_DIAMONDS_ICON_SRC
      : CELL_STRUCTURE_HONEY_ICON_SRC;
  }, [config.structure]);

  const labelContext = useMemo(
    () => ({
      setType: config.matType,
      setVariant: config.variant,
      pricingCategoryKey: config.pricingCategoryKey,
      bodyTypeKey: config.bodyTypeKey,
    }),
    [
      config.matType,
      config.variant,
      config.pricingCategoryKey,
      config.bodyTypeKey,
    ],
  );

  const productTitle = getMatProductTitleLabel(labelContext);
  const productSubtitle = getMatProductSubtitleLabel(labelContext);
  
  if (!priceBreakdown) {
    return null;
  }
  
  const totalWithAccessories =
    priceBreakdown.totalPrice + (selectedPodpietka?.price || 0);

  const actionsClassName = stickyMobileActions
    ? "fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-black/95 backdrop-blur-xl px-4 py-3 pb-safe lg:static lg:z-auto lg:border-0 lg:bg-transparent lg:backdrop-blur-none lg:px-0 lg:py-0"
    : "";

  return (
    <div
      className={`space-y-4 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ${
        stickyMobileActions ? "pb-[calc(5.75rem+env(safe-area-inset-bottom,0px))] lg:pb-0" : ""
      }`}
      data-mobile-summary={stickyMobileActions ? "true" : undefined}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Pricing Summary — first on mobile */}
        <div className="order-1 md:order-2 flex flex-col h-full">
          <h3 className="text-base md:text-lg font-semibold text-white/90 flex items-center gap-2 mb-3 md:mb-4">
            <ShoppingCart className="w-5 h-5 text-red-500 shrink-0" />
            Podsumowanie
          </h3>
          
          <div className="flex-1 bg-[#111]/30 backdrop-blur-sm border border-white/5 rounded-2xl p-3 md:p-4 shadow-md flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -translate-y-16 translate-x-16 group-hover:bg-red-500/10 transition-colors duration-700"></div>
            
            <div className="space-y-2.5 md:space-y-3 relative z-10 text-sm md:text-base">
              <div className="flex justify-between items-center gap-3 text-gray-400">
                <span>Cena zestawu</span>
                <div className="flex items-center gap-2 shrink-0">
                  {priceBreakdown.discount > 0 ? (
                    <>
                      <span className="text-gray-400 line-through text-xs md:text-sm">
                        {formatPricePln(priceBreakdown.basePrice)}
                      </span>
                      <span className="text-white font-medium">
                        {formatPricePln(priceBreakdown.basePrice - priceBreakdown.discount)}
                      </span>
                    </>
                  ) : (
                    <span>{formatPricePln(priceBreakdown.basePrice)}</span>
                  )}
                </div>
              </div>
              
              {priceBreakdown.discount > 0 && (
                <div className="flex justify-between text-green-400 bg-green-500/5 px-2 py-1 rounded text-sm">
                  <span>Rabat ({Math.round((priceBreakdown.discount / priceBreakdown.basePrice) * 100)}%)</span>
                  <span>-{formatPriceValue(priceBreakdown.discount)} zł</span>
                </div>
              )}
              
              {selectedPodpietka && (
                <div className="flex justify-between text-gray-400 bg-white/5 px-2 py-1 rounded text-sm">
                  <span>Podpiętka</span>
                  <span className="font-medium">{formatPricePln(selectedPodpietka.price)}</span>
                </div>
              )}
            </div>

            <div className="pt-4 md:pt-6 mt-4 md:mt-6 border-t border-white/10 relative z-10">
              <div className="flex justify-between items-end gap-3 mb-1">
                <span className="text-gray-400 font-medium text-sm md:text-base">Do zapłaty</span>
                <div className="flex flex-col items-end gap-0.5 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap justify-end">
                    {priceBreakdown.discount > 0 && (
                      <span className="text-sm md:text-base text-gray-400 line-through font-medium">
                        {formatPricePln(priceBreakdown.basePrice + (selectedPodpietka?.price || 0))}
                      </span>
                    )}
                    <span className="text-2xl md:text-3xl font-bold text-white tracking-tight tabular-nums">
                      {formatPricePln(totalWithAccessories)}
                    </span>
                  </div>
                  {priceBreakdown.discount > 0 && (
                    <span className="text-xs text-green-400 font-medium">
                      Oszczędzasz {formatPriceValue(priceBreakdown.discount)} zł
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-400 text-right">Zawiera podatek VAT</p>
            </div>
          </div>
        </div>

        {/* Configuration Details */}
        <div className="order-2 md:order-1 space-y-3 md:space-y-4">
          <h3 className="text-base md:text-lg font-semibold text-white/90 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
            Twoja konfiguracja
          </h3>
          
          <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
            {/* Car Info */}
            <div className="p-3 border-b border-white/5 flex items-start gap-3">
              <div className="relative w-12 h-12 md:w-14 md:h-14 bg-white/5 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                {brandLogo ? (
                  <Image
                    src={brandLogo}
                    alt={config.brand}
                    fill
                    className="object-contain p-1.5"
                    sizes="56px"
                    unoptimized={shouldServeBrandImageUnoptimized(brandLogo)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-red-400">
                    <span className="text-xs">🚗</span>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-0.5">Samochód</p>
                <p className="text-white font-semibold text-sm md:text-base break-words">{config.brand} {config.model}</p>
                <p className="text-xs md:text-sm text-gray-400">{config.year} • {config.bodyType}</p>
              </div>
            </div>

            {/* Product Details */}
            <div className="p-3 border-b border-white/5 flex items-start gap-3">
              <div className="relative w-12 h-12 md:w-14 md:h-14 bg-white/5 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                {matThumbnail ? (
                  <Image
                    src={matThumbnail}
                    alt={`${productTitle}${productSubtitle ? ` - ${productSubtitle}` : ""}`}
                    fill
                    className="object-contain p-1"
                    sizes="56px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-blue-400">
                    <span className="text-xs">🛡️</span>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-0.5">Produkt</p>
                <p className="text-white font-medium text-sm md:text-base">{productTitle}</p>
                {productSubtitle ? (
                  <p className="text-xs md:text-sm text-gray-400">{productSubtitle}</p>
                ) : null}
              </div>
            </div>

            {/* Structure & Colors */}
            <div className="p-3 border-b border-white/5 flex items-start gap-3">
              <div className="relative w-12 h-12 md:w-14 md:h-14 bg-white/5 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                {structureThumbnail ? (
                  <Image
                    src={structureThumbnail}
                    alt={structureNames[config.structure]}
                    fill
                    className="object-cover"
                    sizes="56px"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-yellow-400">
                    <span className="text-xs">⚙️</span>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-0.5">Wykończenie</p>
                <p className="text-white font-medium text-sm md:text-base mb-1">{structureNames[config.structure]}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <div className="flex items-center gap-2 bg-black/20 px-2 py-1 rounded-md border border-white/5 max-w-full">
                    <div className="w-3 h-3 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: getColorInfo(config.color).color }} />
                    <span className="text-xs text-gray-400 truncate">{getColorInfo(config.color).name}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-black/20 px-2 py-1 rounded-md border border-white/5 max-w-full">
                    <div className="w-3 h-3 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: getColorInfo(config.edgeColor).color }} />
                    <span className="text-xs text-gray-400 truncate">{getColorInfo(config.edgeColor).name}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Extras */}
            {selectedPodpietka && (
              <div className="space-y-2">
                {selectedPodpietka && (
                  <div className="p-3 flex items-start gap-3 bg-red-500/5">
                    <div className="relative w-12 h-12 md:w-14 md:h-14 bg-white/5 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                      {selectedPodpietka.images && selectedPodpietka.images.length > 0 ? (
                        <Image
                          src={selectedPodpietka.images[0]}
                          alt={selectedPodpietka.name}
                          fill
                          className="object-contain p-1.5"
                          sizes="56px"
                        />
                      ) : selectedPodpietka.imageSrc ? (
                        <Image
                          src={selectedPodpietka.imageSrc}
                          alt={selectedPodpietka.name}
                          fill
                          className="object-contain p-1.5"
                          sizes="56px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-red-400">
                          <Plus className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-red-400/80 uppercase tracking-wider font-medium mb-0.5">Dodatki</p>
                      <p className="text-white font-medium">{selectedPodpietka.name}</p>
                      {config.podpietkaColor && (
                        <p className="text-xs text-gray-400 mt-1">Kolor: {config.podpietkaColor}</p>
                      )}
                      <p className="text-sm text-gray-400 mt-1">
                        {formatPriceValue(selectedPodpietka.price)} PLN
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div
        className={`flex flex-col gap-3 md:gap-4 pt-4 border-t border-white/5 lg:border-t ${actionsClassName}`}
        data-testid={stickyMobileActions ? "summary-mobile-actions" : undefined}
      >
        {cartActionError && (
          <p
            role="alert"
            className="w-full text-sm text-red-400 bg-red-950/30 border border-red-500/20 rounded-lg px-3 py-2"
          >
            {cartActionError}
          </p>
        )}
        <div className="flex flex-col-reverse sm:flex-row gap-3 md:gap-4">
        <Button
          onClick={onPrevious}
          variant="outline"
          className="flex-1 min-h-[48px] py-2 border-white/10 hover:bg-white/5 hover:text-white text-gray-400 transition-all duration-300"
        >
          Wróć do edycji
        </Button>
        <Button
          onClick={onAddToCart}
          disabled={isAddingToCart}
          className="flex-1 sm:flex-[2] min-h-[48px] py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold shadow-lg shadow-red-900/20 hover:shadow-red-900/40 transition-all duration-300 sm:transform sm:hover:-translate-y-0.5"
        >
          {isAddingToCart ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Przetwarzanie...</span>
            </div>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Przejdź do koszyka
            </span>
          )}
        </Button>
        </div>
      </div>
    </div>
  );
}
