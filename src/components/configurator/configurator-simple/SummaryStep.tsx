"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getColorInfo } from "@/lib/color-mapping";
import { getMatImagePath } from "@/lib/image-mapping";
import type { ConfiguratorState } from "@/features/car-configurator/utils/configuratorState";
import { useAccessories } from "@/features/accessories/hooks/useAccessories";
import { Plus, CheckCircle2, ShoppingCart } from "lucide-react";
import { Brand } from "@/entities/car";
import { formatPricePln, formatPriceValue } from "@/lib/utils/formatPrice";

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
}

const variantNames: Record<string, string> = {
  front: "Starter",
  basic: "Podstawowy",
  premium: "Premium",
  complete: "Bagażnik",
};

const matTypeNames: Record<string, string> = {
  "3d-with-rims": "3D z rantami",
  classic: "3D bez rantów",
  single: "Komplet jednocenowy",
};

const structureNames: Record<string, string> = {
  diamonds: "Romby",
  honey: "Plaster miodu",
};

import { useBrands } from "@/features/brands/hooks/useBrands";

export function SummaryStep({
  config,
  priceBreakdown,
  onPrevious,
  onAddToCart,
  isAddingToCart,
}: SummaryStepProps) {
  const { accessories } = useAccessories();
  
  // Pobierz marki używając hooka useBrands
  const { brands } = useBrands();
  
  // Znajdź wybraną podpiętkę
  const selectedPodpietka = useMemo(() => {
    if (!config.selectedPodpietka) return null;
    return accessories.find(acc => acc.id === config.selectedPodpietka) || null;
  }, [accessories, config.selectedPodpietka]);
  
  // Pobierz logo marki
  const brandLogo = useMemo(() => {
    if (!config.brand || !brands.length) return null;
    const brand = brands.find(b => b.name.toLowerCase() === config.brand.toLowerCase());
    return brand?.logo || null;
  }, [config.brand, brands]);
  
  // Generuj miniaturkę dywanika
  const matThumbnail = useMemo(() => {
    if (!config.structure || !config.color || !config.edgeColor) return null;
    const matType = config.matType === '3d-with-rims' ? '3d' : 'classic';
    return getMatImagePath(
      matType,
      config.structure as 'diamonds' | 'honey',
      config.color,
      config.edgeColor
    );
  }, [config.matType, config.structure, config.color, config.edgeColor]);
  
  // Ścieżka do miniaturki struktury
  const structureThumbnail = useMemo(() => {
    if (!config.structure) return null;
    return config.structure === 'diamonds' 
      ? '/images/konfigurator/struktura komorek/romby.png'
      : '/images/konfigurator/struktura komorek/plaster.png';
  }, [config.structure]);
  
  if (!priceBreakdown) {
    return null;
  }
  
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Configuration Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white/90 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
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
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-red-400">
                    <span className="text-xs">🚗</span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-0.5">Samochód</p>
                <p className="text-white font-semibold">{config.brand} {config.model}</p>
                <p className="text-sm text-gray-400">{config.year} • {config.bodyType}</p>
              </div>
            </div>

            {/* Product Details */}
            <div className="p-3 border-b border-white/5 flex items-start gap-3">
              <div className="relative w-12 h-12 md:w-14 md:h-14 bg-white/5 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                {matThumbnail ? (
                  <Image
                    src={matThumbnail}
                    alt={`${matTypeNames[config.matType]} - ${variantNames[config.variant]}`}
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
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-0.5">Produkt</p>
                <p className="text-white font-medium">{matTypeNames[config.matType]}</p>
                <p className="text-sm text-gray-400">{variantNames[config.variant]}</p>
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
                    className="object-contain p-1.5"
                    sizes="56px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-yellow-400">
                    <span className="text-xs">⚙️</span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-0.5">Wykończenie</p>
                <p className="text-white font-medium mb-1">{structureNames[config.structure]}</p>
                <div className="flex gap-3 mt-2">
                  <div className="flex items-center gap-2 bg-black/20 px-2 py-1 rounded-md border border-white/5">
                    <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: getColorInfo(config.color).color }} />
                    <span className="text-xs text-gray-400">{getColorInfo(config.color).name}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-black/20 px-2 py-1 rounded-md border border-white/5">
                    <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: getColorInfo(config.edgeColor).color }} />
                    <span className="text-xs text-gray-400">{getColorInfo(config.edgeColor).name}</span>
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

        {/* Pricing Summary */}
        <div className="flex flex-col h-full">
          <h3 className="text-lg font-semibold text-white/90 flex items-center gap-2 mb-4">
            <ShoppingCart className="w-5 h-5 text-red-500" />
            Podsumowanie
          </h3>
          
          <div className="flex-1 bg-[#111]/30 backdrop-blur-sm border border-white/5/80 rounded-2xl p-4 shadow-md flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -translate-y-16 translate-x-16 group-hover:bg-red-500/10 transition-colors duration-700"></div>
            
            <div className="space-y-3 relative z-10">
              <div className="flex justify-between items-center text-gray-400">
                <span>Cena zestawu</span>
                <div className="flex items-center gap-2">
                  {priceBreakdown.discount > 0 ? (
                    <>
                      <span className="text-gray-400 line-through text-sm">
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
                <div className="flex justify-between text-green-400 bg-green-500/5 px-2 py-1 rounded">
                  <span>Rabat ({Math.round((priceBreakdown.discount / priceBreakdown.basePrice) * 100)}%)</span>
                  <span>-{formatPriceValue(priceBreakdown.discount)} zł</span>
                </div>
              )}
              
              {selectedPodpietka && (
                <div className="flex justify-between text-gray-400 bg-white/5 px-2 py-1 rounded">
                  <span className="text-sm">Podpiętka</span>
                  <span className="text-sm font-medium">{formatPricePln(selectedPodpietka.price)}</span>
                </div>
              )}
            </div>

            <div className="pt-6 mt-6 border-t border-white/10 relative z-10">
              <div className="flex justify-between items-end mb-1">
                <span className="text-gray-400 font-medium">Do zapłaty</span>
                <div className="flex flex-col items-end gap-0.5">
                  <div className="flex items-baseline gap-2">
                    {priceBreakdown.discount > 0 && (
                      <span className="text-base text-gray-400 line-through font-medium">
                        {formatPricePln(priceBreakdown.basePrice + (selectedPodpietka?.price || 0))}
                      </span>
                    )}
                    <span className="text-3xl font-bold text-white tracking-tight">
                      {formatPricePln(priceBreakdown.totalPrice + (selectedPodpietka?.price || 0))}
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
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/5">
        <Button
          onClick={onPrevious}
          variant="outline"
          className="flex-1 h-10 py-2 border-white/10 hover:bg-white/5 hover:text-white text-gray-400 transition-all duration-300"
        >
          Wróć do edycji
        </Button>
        <Button
          onClick={onAddToCart}
          disabled={isAddingToCart}
          className="flex-[2] h-10 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold shadow-lg shadow-red-900/20 hover:shadow-red-900/40 transition-all duration-300 transform hover:-translate-y-0.5"
        >
          {isAddingToCart ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Przetwarzanie...</span>
            </div>
          ) : (
            <span className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Zamawiam
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
