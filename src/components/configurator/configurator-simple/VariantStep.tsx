"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PricingService } from "@/lib/services/PricingService";
import { formatPricePln } from "@/lib/utils/formatPrice";
import { LowestPrice30DaysNotice } from "./LowestPrice30DaysNotice";

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
    priceAfterDiscount: number;
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
    const oldPrice = price.basePrice;
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
                p-2.5 md:p-3 cursor-pointer transition-all duration-300 flex flex-col items-center gap-2 h-full w-full text-center
                rounded-xl border border-white/10 bg-[#111] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50
                ${isSelected
                  ? 'border-red-500 bg-red-500/10 ring-2 ring-red-500/30 shadow-md shadow-red-500/10'
                  : 'hover:border-white/20 hover:bg-white/5 active:scale-[0.98]'
                }
              `}
            >
              <div className="w-full space-y-0.5">
                <h3 className="text-sm font-semibold leading-tight text-white">{variant.name}</h3>
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
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 120px"
                  />
                </div>
              </div>
              <div className="w-full space-y-0.5 border-t border-white/5 pt-2">
                <span className="text-[10px] uppercase tracking-wide text-gray-400">Cena</span>
                <div className="flex flex-wrap items-baseline justify-center gap-1">
                  {hasDiscount && (
                    <span className="text-xs text-gray-400 line-through">
                      {formatPricePln(oldPrice)}
                    </span>
                  )}
                  <span className="text-sm font-bold text-white">
                    {formatPricePln(displayPrice)}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <LowestPrice30DaysNotice
        priceAfterDiscount={priceBreakdown?.priceAfterDiscount || priceBreakdown?.totalPrice}
        regularPrice={priceBreakdown?.basePrice}
      />

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
