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
import { useMatModelPreviews } from "@/features/mat-model-previews";
import { Plus, CheckCircle2, ShoppingCart } from "lucide-react";
import { formatBrandDisplayName } from "@/shared/vehicle/displayLabels";
import { formatPricePln, formatPriceValue } from "@/lib/utils/formatPrice";
import {
  getPodpietkaMountingFee,
  getPodpietkaMountingLabel,
  getPodpietkaTotalPrice,
} from "@/features/car-configurator/domain/podpietkaMounting";
import { matFinishTotal, selectedMatFinishes } from "@/features/car-configurator/domain/matFinishes";
import {
  CELL_STRUCTURE_DIAMONDS_ICON_SRC,
  CELL_STRUCTURE_HONEY_ICON_SRC,
} from "@/components/configurator/configurator-v2/structure/cellStructurePresentation";

type SummarySurface = "dark" | "light"

const summaryStyles = {
  dark: {
    heading: "text-white/90",
    muted: "text-gray-400",
    strong: "text-white",
    total: "text-green-400",
    priceCard:
      "flex-1 min-w-0 max-w-full bg-[#111]/30 backdrop-blur-sm border border-white/5 rounded-2xl p-3 md:p-4 shadow-md flex flex-col justify-between relative overflow-hidden group",
    glow: "absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -translate-y-16 translate-x-16 group-hover:bg-red-500/10 transition-colors duration-700",
    discount: "flex justify-between text-green-400 bg-green-500/5 px-2 py-1 rounded text-sm",
    extraRow: "flex justify-between text-gray-400 bg-white/5 px-2 py-1 rounded text-sm",
    divider: "pt-4 md:pt-6 mt-4 md:mt-6 border-t border-white/10 relative z-10",
    savings: "text-xs text-green-400 font-medium",
    configCard:
      "min-w-0 max-w-full bg-[#111] border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm",
    rowBorder: "border-white/5",
    thumb:
      "relative w-12 h-12 md:w-14 md:h-14 bg-white/5 rounded-lg overflow-hidden flex-shrink-0 border border-white/10",
    chip: "flex items-center gap-2 bg-black/20 px-2 py-1 rounded-md border border-white/5 max-w-full",
    swatch: "w-3 h-3 rounded-full border border-white/20 shrink-0",
    addon: "p-3 flex items-start gap-3 bg-red-500/5",
    addonLabel: "text-xs text-red-400/80 uppercase tracking-wider font-medium mb-0.5",
    actions: "flex flex-col gap-3 md:gap-4 pt-4 border-t border-white/5 lg:border-t",
    sticky:
      "fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-black/95 backdrop-blur-xl px-4 py-3 pb-safe lg:static lg:z-auto lg:border-0 lg:bg-transparent lg:backdrop-blur-none lg:px-0 lg:py-0",
    error: "w-full text-sm text-red-400 bg-red-950/30 border border-red-500/20 rounded-lg px-3 py-2",
    back: "h-11 min-h-11 flex-1 px-2 text-[12px] leading-tight border-white/10 hover:bg-white/5 hover:text-white text-gray-400 transition-all duration-300 sm:h-12 sm:min-h-[48px] sm:px-4 sm:text-base",
    cart: "h-11 min-h-11 flex-1 px-2 text-[12px] leading-tight bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold shadow-lg shadow-red-900/20 hover:shadow-red-900/40 transition-all duration-300 sm:h-12 sm:min-h-[48px] sm:flex-[2] sm:px-4 sm:text-base sm:transform sm:hover:-translate-y-0.5",
  },
  light: {
    heading: "text-neutral-950",
    muted: "text-neutral-600",
    strong: "text-neutral-950",
    total: "text-green-600",
    priceCard:
      "flex-1 min-w-0 max-w-full bg-[#FFFFFF] border border-neutral-300 rounded-2xl p-3 md:p-4 shadow-sm flex flex-col justify-between relative overflow-hidden",
    glow: "hidden",
    discount: "flex justify-between text-green-700 bg-green-50 px-2 py-1 rounded text-sm",
    extraRow: "flex justify-between text-neutral-700 bg-neutral-100 px-2 py-1 rounded text-sm",
    divider: "pt-4 md:pt-6 mt-4 md:mt-6 border-t border-neutral-200 relative z-10",
    savings: "text-xs text-green-700 font-medium",
    configCard:
      "min-w-0 max-w-full bg-[#FFFFFF] border border-neutral-300 rounded-2xl overflow-hidden",
    rowBorder: "border-neutral-200",
    thumb:
      "relative w-12 h-12 md:w-14 md:h-14 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0 border border-neutral-300",
    chip: "flex items-center gap-2 bg-neutral-100 px-2 py-1 rounded-md border border-neutral-200 max-w-full",
    swatch: "w-3 h-3 rounded-full border border-neutral-300 shrink-0",
    addon: "p-3 flex items-start gap-3 bg-red-50",
    addonLabel: "text-xs text-red-600 uppercase tracking-wider font-medium mb-0.5",
    actions: "flex flex-col gap-3 md:gap-4 pt-4 border-t border-neutral-200 lg:border-t",
    sticky:
      "fixed inset-x-0 bottom-0 z-30 border-t border-neutral-300 bg-[#FFFFFF]/95 backdrop-blur-xl px-4 py-3 pb-safe lg:static lg:z-auto lg:border-0 lg:bg-transparent lg:backdrop-blur-none lg:px-0 lg:py-0",
    error: "w-full text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2",
    back: "h-11 min-h-11 flex-1 px-2 text-[12px] leading-tight border-neutral-300 bg-[#FFFFFF] text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950 transition-all duration-300 sm:h-12 sm:min-h-[48px] sm:px-4 sm:text-base",
    cart: "h-11 min-h-11 flex-1 px-2 text-[12px] leading-tight bg-red-600 hover:bg-red-500 text-white font-medium transition-colors sm:h-12 sm:min-h-[48px] sm:flex-[2] sm:px-4 sm:text-base",
  },
} as const

interface SummaryStepProps {
  config: ConfiguratorState;
  surface?: SummarySurface;
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
  /** Primary model preview from listing / API (prefer over brand logo). */
  vehiclePreviewImage?: string | null;
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
  vehiclePreviewImage = null,
  surface = "dark",
}: SummaryStepProps) {
  const styles = summaryStyles[surface];
  const { accessories } = useAccessories();
  
  const selectedPodpietka = useMemo(() => {
    if (!config.selectedPodpietka) return null;
    return accessories.find(acc => acc.id === config.selectedPodpietka) || null;
  }, [accessories, config.selectedPodpietka]);

  const selectedFinishes = useMemo(
    () => selectedMatFinishes(accessories, config.selectedFinishIds),
    [accessories, config.selectedFinishIds],
  );
  const accessoryPrice = (selectedPodpietka
    ? getPodpietkaTotalPrice(selectedPodpietka.price, config.podpietkaMounting)
    : 0) + matFinishTotal(selectedFinishes);
  const accessoryMountingFee = getPodpietkaMountingFee(config.podpietkaMounting);
  
  const brandLogo = useMemo(
    () =>
      resolveConfiguratorBrandImage({
        brand: config.brand,
        brandKey: config.brandKey,
      }),
    [config.brand, config.brandKey],
  );

  const { previews: modelPreviews } = useMatModelPreviews({
    recordKey: config.recordKey || undefined,
    brandKey: config.brandKey || undefined,
    modelKey: config.modelKey || config.model || undefined,
    bodyTypeKey: config.bodyTypeKey || config.bodyType || undefined,
    enabled: Boolean(
      config.recordKey ||
        config.modelKey ||
        (config.brandKey && config.model),
    ),
  });

  const modelPreviewImage = useMemo(() => {
    const fromProp = vehiclePreviewImage?.trim() || null;
    if (fromProp) return fromProp;

    if (modelPreviews.length === 0) return null;
    const primary =
      modelPreviews.find((preview) => preview.is_primary) ?? modelPreviews[0];
    return primary?.image_url ?? null;
  }, [modelPreviews, vehiclePreviewImage]);

  const vehicleThumbnailSrc = modelPreviewImage || brandLogo;
  const usesModelPreviewPhoto = Boolean(modelPreviewImage);
  
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
    priceBreakdown.totalPrice + accessoryPrice;

  const actionsClassName = stickyMobileActions ? styles.sticky : ""

  return (
    <div
      className={`w-full min-w-0 max-w-full space-y-4 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ${
        stickyMobileActions ? "pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] lg:pb-0" : ""
      }`}
      data-mobile-summary={stickyMobileActions ? "true" : undefined}
    >
      <div
        className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-6"
        data-testid="summary-grid"
      >
        {/* Pricing Summary — first on mobile */}
        <div className="order-1 flex h-full min-w-0 flex-col md:order-2">
          <h3 className={`text-base md:text-lg font-semibold flex items-center gap-2 mb-3 md:mb-4 ${styles.heading}`}>
            <ShoppingCart className="w-5 h-5 text-red-500 shrink-0" />
            Podsumowanie
          </h3>
          
          <div className={styles.priceCard} data-testid="summary-price-card">
            <div className={styles.glow}></div>
            
            <div className="space-y-2.5 md:space-y-3 relative z-10 text-sm md:text-base">
              <div className={`flex justify-between items-center gap-3 ${styles.muted}`}>
                <span>Cena zestawu</span>
                <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
                  {priceBreakdown.discount > 0 ? (
                    <>
                      <span className={`line-through text-xs md:text-sm ${styles.muted}`}>
                        {formatPricePln(priceBreakdown.basePrice)}
                      </span>
                      <span className={`font-medium ${styles.strong}`}>
                        {formatPricePln(priceBreakdown.basePrice - priceBreakdown.discount)}
                      </span>
                    </>
                  ) : (
                    <span>{formatPricePln(priceBreakdown.basePrice)}</span>
                  )}
                </div>
              </div>
              
              {priceBreakdown.discount > 0 && (
                <div className={styles.discount}>
                  <span>Rabat ({Math.round((priceBreakdown.discount / priceBreakdown.basePrice) * 100)}%)</span>
                  <span>-{formatPriceValue(priceBreakdown.discount)} zł</span>
                </div>
              )}
              
              {selectedPodpietka && (
                <div className={styles.extraRow}>
                  <span>Podpiętka</span>
                  <span className="font-medium">{formatPricePln(selectedPodpietka.price)}</span>
                </div>
              )}

              {accessoryMountingFee > 0 && (
                <div className={styles.extraRow}>
                  <span>Montaż podpiętki</span>
                  <span className="font-medium">{formatPricePln(accessoryMountingFee)}</span>
                </div>
              )}

              {selectedFinishes.map((finish) => (
                <div key={finish.id} className={styles.extraRow}>
                  <span>{finish.name}</span>
                  <span className="font-medium">{formatPricePln(finish.price)}</span>
                </div>
              ))}
            </div>

            <div className={styles.divider}>
              <div className="mb-1 flex min-w-0 items-end justify-between gap-2">
                <span className={`shrink-0 font-medium text-sm md:text-base ${styles.muted}`}>Do zapłaty</span>
                <div className="flex min-w-0 flex-col items-end gap-0.5">
                  <div className="flex min-w-0 flex-col items-end">
                    {priceBreakdown.discount > 0 && (
                      <span className={`text-sm font-medium line-through ${styles.muted}`}>
                        {formatPricePln(priceBreakdown.basePrice + accessoryPrice)}
                      </span>
                    )}
                    <span className={`text-xl font-bold tracking-tight tabular-nums md:text-3xl ${styles.total}`}>
                      {formatPricePln(totalWithAccessories)}
                    </span>
                  </div>
                  {priceBreakdown.discount > 0 && (
                    <span className={styles.savings}>
                      Oszczędzasz {formatPriceValue(priceBreakdown.discount)} zł
                    </span>
                  )}
                </div>
              </div>
              <p className={`text-xs text-right ${styles.muted}`}>Zawiera podatek VAT</p>
            </div>
          </div>
        </div>

        {/* Configuration Details */}
        <div className="order-2 min-w-0 space-y-3 md:order-1 md:space-y-4">
          <h3 className={`text-base md:text-lg font-semibold flex items-center gap-2 ${styles.heading}`}>
            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
            Twoja konfiguracja
          </h3>
          
          <div className={styles.configCard} data-testid="summary-config-card">
            {/* Car Info */}
            <div className={`p-3 border-b flex items-start gap-3 ${styles.rowBorder}`}>
              <div className={styles.thumb}>
                {vehicleThumbnailSrc ? (
                  <Image
                    src={vehicleThumbnailSrc}
                    alt={
                      usesModelPreviewPhoto
                        ? `Podgląd dywaników ${formatBrandDisplayName(config.brand)} ${config.model}`
                        : formatBrandDisplayName(config.brand)
                    }
                    fill
                    className={
                      usesModelPreviewPhoto
                        ? "object-cover"
                        : "object-contain p-1.5"
                    }
                    sizes="56px"
                    unoptimized={
                      usesModelPreviewPhoto ||
                      shouldServeBrandImageUnoptimized(vehicleThumbnailSrc)
                    }
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-red-400">
                    <span className="text-xs">🚗</span>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-xs uppercase tracking-wider font-medium mb-0.5 ${styles.muted}`}>Samochód</p>
                <p className={`font-semibold text-sm md:text-base break-words ${styles.strong}`}>{formatBrandDisplayName(config.brand)} {config.model}</p>
                <p className={`text-xs md:text-sm ${styles.muted}`}>
                  {config.year} • {config.gearbox} • {config.bodyType}
                </p>
              </div>
            </div>

            {/* Product Details */}
            <div className={`p-3 border-b flex items-start gap-3 ${styles.rowBorder}`}>
              <div className={styles.thumb}>
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
                <p className={`text-xs uppercase tracking-wider font-medium mb-0.5 ${styles.muted}`}>Produkt</p>
                <p className={`font-medium text-sm md:text-base ${styles.strong}`}>{productTitle}</p>
                {productSubtitle ? (
                  <p className={`text-xs md:text-sm ${styles.muted}`}>{productSubtitle}</p>
                ) : null}
              </div>
            </div>

            {/* Structure & Colors */}
            <div className={`p-3 border-b flex items-start gap-3 ${styles.rowBorder}`}>
              <div className={styles.thumb}>
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
                <p className={`text-xs uppercase tracking-wider font-medium mb-0.5 ${styles.muted}`}>Wykończenie</p>
                <p className={`font-medium text-sm md:text-base mb-1 ${styles.strong}`}>{structureNames[config.structure]}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <div className={styles.chip}>
                    <div className={styles.swatch} style={{ backgroundColor: getColorInfo(config.color).color }} />
                    <span className={`text-xs truncate ${styles.muted}`}>{getColorInfo(config.color).name}</span>
                  </div>
                  <div className={styles.chip}>
                    <div className={styles.swatch} style={{ backgroundColor: getColorInfo(config.edgeColor).color }} />
                    <span className={`text-xs truncate ${styles.muted}`}>{getColorInfo(config.edgeColor).name}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Extras */}
            {selectedPodpietka && (
              <div className="space-y-2">
                {selectedPodpietka && (
                  <div className={styles.addon}>
                    <div className={styles.thumb}>
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
                      <p className={styles.addonLabel}>Dodatki</p>
                      <p className={`font-medium ${styles.strong}`}>{selectedPodpietka.name}</p>
                      {config.podpietkaColor && (
                        <p className={`text-xs mt-1 ${styles.muted}`}>Kolor: {config.podpietkaColor}</p>
                      )}
                      {config.podpietkaMounting && (
                        <p className={`text-xs mt-1 ${styles.muted}`}>
                          {getPodpietkaMountingLabel(config.podpietkaMounting)}
                        </p>
                      )}
                      <p className={`text-sm mt-1 ${styles.muted}`}>
                        {formatPriceValue(accessoryPrice)} PLN
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
        className={`${styles.actions} ${actionsClassName}`}
        data-testid={stickyMobileActions ? "summary-mobile-actions" : undefined}
      >
        {cartActionError && (
          <p
            role="alert"
            className={styles.error}
          >
            {cartActionError}
          </p>
        )}
        <div className="flex w-full min-w-0 flex-row gap-2 sm:gap-3 md:gap-4" data-testid="summary-action-row">
        <Button
          onClick={onPrevious}
          variant="outline"
          className={`${styles.back} min-w-0 basis-0 whitespace-normal`}
        >
          Wróć do edycji
        </Button>
        <Button
          onClick={onAddToCart}
          disabled={isAddingToCart}
          className={`${styles.cart} min-w-0 basis-0 whitespace-normal`}
        >
          {isAddingToCart ? (
            <div className="flex items-center justify-center gap-1.5">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Przetwarzanie...</span>
            </div>
          ) : (
            <span className="flex items-center justify-center gap-1.5">
              <ShoppingCart className="w-4 h-4 shrink-0" />
              Przejdź do koszyka
            </span>
          )}
        </Button>
        </div>
      </div>
    </div>
  );
}
