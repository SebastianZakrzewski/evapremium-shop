"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PricingService } from "@/lib/services/PricingService";

interface MatTypeVariantStepProps {
  config: {
    matType: "3d-with-rims" | "classic";
    variant: "front" | "basic" | "premium" | "complete";
  };
  onUpdate: (updates: { matType?: "3d-with-rims" | "classic"; variant?: "front" | "basic" | "premium" | "complete" }) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const matTypes = [
  {
    id: "3d-with-rims" as const,
    name: "3D z rantami",
    description: "Wysokie ranty chroniące przed brudem",
  },
  {
    id: "classic" as const,
    name: "3D bez rantów",
    description: "Standardowe bez wysokich rantów",
  },
];

const variants = [
  {
    id: "front" as const,
    name: "Starter",
    description: "2 dywaniki (tylko przód)",
    image: "/konfigurator/zestaw/przod.png",
  },
  {
    id: "basic" as const,
    name: "Podstawowy",
    description: "5 dywaników (przód + tył)",
    image: "/konfigurator/zestaw/pt.png",
  },
  {
    id: "premium" as const,
    name: "Premium",
    description: "5 dywaników (przód + tył + bagażnik)",
    image: "/konfigurator/zestaw/ptb.png",
  },
  {
    id: "complete" as const,
    name: "Bagażnik",
    description: "1 dywanik - Mata do Bagażnika",
    image: "/konfigurator/zestaw/mata.png",
  },
];

export function MatTypeVariantStep({ config, onUpdate, onNext, onPrevious }: MatTypeVariantStepProps) {
  const getVariantPricing = (variantId: string) => {
    const price = PricingService.calculateConfiguratorPrice(config.matType || "3d-with-rims", variantId as any);
    const isClassicFront = config.matType === 'classic' && variantId === 'front';
    const displayPrice = isClassicFront
      ? price.priceAfterDiscount || (price.totalPrice - price.shippingCost)
      : price.totalPrice;
    const oldPrice = isClassicFront ? price.basePrice : price.basePrice + price.shippingCost;
    return { displayPrice, oldPrice, hasDiscount: price.discount > 0 };
  };

  return (
    <div className="space-y-6">
      {/* Typ dywaników */}
      <div>
        <h3 className="text-base font-semibold mb-2 text-white/90">Typ dywaników</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 [&>*]:min-w-[150px]">
          {matTypes.map((type) => (
            <Card
              key={type.id}
              onClick={() => onUpdate({ matType: type.id })}
              className={`
                p-3 cursor-pointer transition-all duration-300 min-h-[80px] active:scale-[0.98]
                ${config.matType === type.id
                  ? 'border-red-500 bg-red-500/10 ring-2 ring-red-500/30 shadow-md shadow-red-500/10 scale-[1.01]'
                  : 'border-white/10 bg-[#111] hover:border-white/20 hover:bg-white/5 hover:shadow-sm'
                }
              `}
            >
              <h4 className="text-base font-semibold mb-1 leading-tight">{type.name}</h4>
              <p className="text-gray-300 text-xs leading-relaxed">{type.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Wariant zestawu */}
      {config.matType && (
        <div>
          <h3 className="text-base font-semibold mb-2 text-white/90">Wariant zestawu</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 [&>*]:min-w-[150px] [&>*]:min-h-0 items-stretch">
            {variants.map((variant) => {
              const { displayPrice, oldPrice, hasDiscount } = getVariantPricing(variant.id);
              return (
                <Card
                  key={variant.id}
                  onClick={() => onUpdate({ variant: variant.id })}
                  className={`
                    p-2 md:p-3 cursor-pointer transition-all duration-300 grid grid-rows-[auto_1fr_auto] h-full
                    ${config.variant === variant.id
                      ? 'border-red-500 bg-red-500/10 ring-2 ring-red-500/30 shadow-md shadow-red-500/10 scale-[1.01]'
                      : 'border-white/10 bg-[#111] hover:border-white/20 hover:bg-white/5 hover:shadow-sm active:scale-[0.98]'
                    }
                  `}
                >
                  {/* Nagłówek – stała wysokość, 2 linie opisu */}
                  <div className="h-[52px] md:h-[56px] flex-shrink-0 flex flex-col justify-center min-h-0">
                    <h4 className="text-xs md:text-base font-semibold leading-tight truncate">{variant.name}</h4>
                    <p className="text-gray-300 text-[10px] md:text-xs leading-tight line-clamp-2">{variant.description}</p>
                  </div>
                  {/* Zdjęcie – wypełnia środkową przestrzeń */}
                  <div className="w-full min-h-[100px] md:min-h-[120px] mt-2 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded md:rounded-md overflow-hidden border border-white/10 relative">
                    <Image
                      src={variant.image}
                      alt={variant.name}
                      fill
                      className="object-contain p-0.5 md:p-2"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                  {/* Cena – stała wysokość, zawsze na dole karty */}
                  <div className="h-[48px] flex-shrink-0 mt-auto pt-2 border-t border-white/10 flex flex-col justify-end gap-0.5">
                    <span className="text-gray-400 text-[10px] md:text-xs">Cena</span>
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      {hasDiscount && (
                        <span className="text-[10px] md:text-xs text-gray-500 line-through whitespace-nowrap">
                          {oldPrice.toFixed(2)} zł
                        </span>
                      )}
                      <span className="text-xs md:text-base font-bold text-white whitespace-nowrap">
                        {displayPrice.toFixed(2)} zł
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4">
        <Button
          onClick={onPrevious}
          variant="outline"
          className="flex-1 sm:flex-initial px-6 py-3 min-h-[44px] md:min-h-[40px] border-white/10 hover:bg-white/5 text-sm font-medium transition-all duration-200 active:scale-95"
        >
          Wstecz
        </Button>
        <div className="flex flex-col items-end gap-2 flex-1 sm:flex-initial">
          {(!config.matType || !config.variant) && (
            <p className="text-xs text-gray-400 text-right">Wybierz typ i wariant aby kontynuować</p>
          )}
          <Button
            onClick={onNext}
            disabled={!config.matType || !config.variant}
            className="w-full sm:w-auto px-6 py-3 min-h-[44px] md:min-h-[40px] bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all duration-200 shadow-md shadow-red-600/20 hover:shadow-lg hover:shadow-red-600/30 active:scale-95"
          >
            Dalej
          </Button>
        </div>
      </div>
    </div>
  );
}

