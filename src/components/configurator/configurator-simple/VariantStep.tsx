"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PricingService } from "@/lib/services/PricingService";

interface VariantStepProps {
  config: {
    matType: "3d-with-rims" | "classic";
    variant: "" | "front" | "basic" | "premium" | "complete";
  };
  onUpdate: (updates: { variant?: "front" | "basic" | "premium" | "complete" }) => void;
  onNext: () => void;
  onPrevious: () => void;
  priceBreakdown?: {
    basePrice: number;
    discount: number;
    shippingCost: number;
    totalPrice: number;
  };
}

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
    description: "5 dyw. (przód + tył + ochrona na środek)",
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

export function VariantStep({ config, onUpdate, onNext, onPrevious, priceBreakdown }: VariantStepProps) {
  const getVariantPricing = (variantId: string) => {
    const price = PricingService.calculateConfiguratorPrice(config.matType, variantId as any);
    const isClassicFront = config.matType === 'classic' && variantId === 'front';
    const displayPrice = isClassicFront
      ? price.priceAfterDiscount || (price.totalPrice - price.shippingCost)
      : price.totalPrice;
    const oldPrice = isClassicFront ? price.basePrice : price.basePrice + price.shippingCost;
    return { displayPrice, oldPrice, hasDiscount: price.discount > 0 };
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-2 md:gap-3 [&>*]:min-w-[150px] [&>*]:min-h-0 items-stretch">
        {variants.map((variant) => {
          const { displayPrice, oldPrice, hasDiscount } = getVariantPricing(variant.id);
          const isSelected = config.variant === variant.id;
          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => onUpdate({ variant: variant.id })}
              className={`
                p-2.5 md:p-3 cursor-pointer transition-all duration-300 flex flex-col h-full w-full text-left
                rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50
                ${isSelected
                  ? 'ring-2 ring-red-500/50 ring-offset-2 ring-offset-black scale-[1.01]'
                  : 'hover:opacity-90 active:scale-[0.98]'
                }
              `}
            >
              {/* Nagłówek – stała wysokość, skrócone opisy mieszczą się w 2 liniach */}
              <div className="h-[46px] md:h-[52px] flex-shrink-0 flex flex-col justify-center min-h-0">
                <h3 className="text-sm md:text-base font-semibold leading-tight truncate text-white">{variant.name}</h3>
                <p className="text-gray-200 text-xs md:text-sm leading-tight line-clamp-2">{variant.description}</p>
              </div>
              {/* Zdjęcie – stała wysokość, zapobiega nachodzeniu na cenę */}
              <div className="w-full h-[80px] md:h-[96px] flex-shrink-0 mt-1.5 rounded-2xl overflow-hidden bg-white/5 relative">
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                  <Image
                    src={variant.image}
                    alt={variant.name}
                    fill
                    className="object-contain p-1 md:p-2 rounded-2xl"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                  />
                </div>
              </div>
              {/* Cena – stała wysokość, zawsze na dole */}
              <div className="h-[42px] flex-shrink-0 pt-1.5 mt-auto flex flex-col justify-end gap-0.5">
                <span className="text-gray-400 text-xs">Cena</span>
                <div className="flex items-baseline gap-1.5 flex-nowrap">
                  {hasDiscount && (
                    <span className="text-xs text-gray-400 line-through whitespace-nowrap">
                      {oldPrice.toFixed(2)} zł
                    </span>
                  )}
                  <span className="text-sm md:text-base font-bold text-white whitespace-nowrap">
                    {displayPrice.toFixed(2)} zł
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 justify-end pt-3">
        <Button
          onClick={onPrevious}
          variant="outline"
          className="flex-1 sm:flex-initial px-4 py-2.5 min-h-[40px] md:min-h-[36px] border-white/10 hover:bg-white/5 text-xs font-medium transition-all duration-200 active:scale-95"
        >
          Wstecz
        </Button>
        <div className="flex flex-col items-end gap-1.5 flex-1 sm:flex-initial">
          {!config.variant && (
            <p className="text-[10px] text-gray-400 text-right">Wybierz wariant zestawu aby kontynuować</p>
          )}
          <Button
            onClick={onNext}
            disabled={!config.variant}
            className="w-full sm:w-auto px-4 py-2.5 min-h-[40px] md:min-h-[36px] bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium transition-all duration-200 shadow-md shadow-red-600/20 hover:shadow-lg hover:shadow-red-600/30 active:scale-95"
          >
            Dalej
          </Button>
        </div>
      </div>
    </div>
  );
}

