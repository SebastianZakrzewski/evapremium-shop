"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PricingService } from "@/lib/services/PricingService";
import { LowestPrice30DaysNotice } from "./LowestPrice30DaysNotice";

interface MatTypeVariantStepProps {
  config: {
    matType: "3d-with-rims" | "classic";
    variant: "" | "front" | "basic" | "premium" | "complete";
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
    description: "2 dyw. (przód)",
    image: "/konfigurator/zestaw/przod.png",
  },
  {
    id: "basic" as const,
    name: "Podstawowy",
    description: "5 dyw. (przód + tył)",
    image: "/konfigurator/zestaw/pt.png",
  },
  {
    id: "premium" as const,
    name: "Premium",
    description: "5 dyw. (przód + tył + bagażnik)",
    image: "/konfigurator/zestaw/ptb.png",
  },
  {
    id: "complete" as const,
    name: "Bagażnik",
    description: "1 dyw. (mata bagażnik)",
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
    const oldPrice = price.basePrice;
    return { displayPrice, oldPrice, hasDiscount: price.discount > 0 };
  };

  return (
    <div className="space-y-3">
      {/* Typ dywaników */}
      <div>
        <h3 className="text-sm font-semibold mb-1.5 text-white">Typ dywaników</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 [&>*]:min-w-[150px] items-stretch">
          {matTypes.map((type) => (
            <Card
              key={type.id}
              onClick={() => onUpdate({ matType: type.id })}
              className={`
                p-2.5 md:p-3 cursor-pointer transition-all duration-300 min-h-[64px] active:scale-[0.98]
                rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50
                ${config.matType === type.id
                  ? 'border-red-500 bg-red-500/10 ring-2 ring-red-500/30 shadow-md shadow-red-500/10 scale-[1.01]'
                  : 'border-white/10 bg-[#111] hover:border-white/20 hover:bg-white/5 hover:shadow-sm'
                }
              `}
            >
              <h4 className="text-sm font-semibold mb-0.5 leading-tight text-white">{type.name}</h4>
              <p className="text-gray-200 text-xs leading-relaxed">{type.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Wariant zestawu */}
      {config.matType && (
        <div>
          <h3 className="text-sm font-semibold mb-1.5 text-white/90">Wariant zestawu</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 [&>*]:min-w-[150px] [&>*]:min-h-0 items-stretch">
            {variants.map((variant) => {
              const { displayPrice, oldPrice, hasDiscount } = getVariantPricing(variant.id);
              const isSelected = config.variant === variant.id;
              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => onUpdate({ variant: variant.id })}
                  className={`
                    p-2.5 md:p-3 cursor-pointer transition-all duration-300 flex flex-col items-center gap-2 h-full w-full text-center
                    rounded-xl border border-white/10 bg-[#111] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50
                    ${isSelected
                      ? 'border-red-500 bg-red-500/10 ring-2 ring-red-500/30 shadow-md shadow-red-500/10'
                      : 'hover:border-white/20 hover:bg-white/5 active:scale-[0.98]'
                    }
                  `}
                >
                  <div className="w-full space-y-0.5">
                    <h4 className="text-sm font-semibold leading-tight text-white">{variant.name}</h4>
                    <p className="text-xs leading-snug text-gray-300">{variant.description}</p>
                  </div>
                  <div className="flex justify-center flex-shrink-0">
                    <div className="w-fit max-w-full rounded-2xl overflow-hidden bg-white/5">
                      <Image
                        src={variant.image}
                        alt={variant.name}
                        width={120}
                        height={80}
                        className="block h-auto w-auto max-h-[80px] md:max-h-[96px] object-contain"
                        sizes="(max-width: 768px) 50vw, 120px"
                      />
                    </div>
                  </div>
                  <div className="w-full space-y-0.5 border-t border-white/5 pt-2">
                    <span className="text-[10px] uppercase tracking-wide text-gray-400">Cena</span>
                    <div className="flex flex-wrap items-baseline justify-center gap-1">
                      {hasDiscount && (
                        <span className="text-xs text-gray-400 line-through">
                          {oldPrice.toFixed(2)} zł
                        </span>
                      )}
                      <span className="text-sm font-bold text-white">
                        {displayPrice.toFixed(2)} zł
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <LowestPrice30DaysNotice />
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4">
        <Button
          onClick={onPrevious}
          variant="outline"
          className="flex-1 sm:flex-initial px-4 py-2.5 min-h-[40px] md:min-h-[36px] border-white/10 hover:bg-white/5 text-xs font-medium transition-all duration-200 active:scale-95"
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
            className="w-full sm:w-auto px-4 py-2.5 min-h-[40px] md:min-h-[36px] bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium transition-all duration-200 shadow-md shadow-red-600/20 hover:shadow-lg hover:shadow-red-600/30 active:scale-95"
          >
            Dalej
          </Button>
        </div>
      </div>
    </div>
  );
}
