"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PricingService } from "@/lib/services/PricingService";

interface VariantStepProps {
  config: {
    matType: "3d-with-rims" | "classic";
    variant: "front" | "basic" | "premium" | "complete";
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
    description: "2 dywaniki (tylko przód)",
    image: "/konfigurator/zestaw/przod.png",
  },
  {
    id: "basic" as const,
    name: "Podstawowy",
    description: "5 dywaników (przód + tył + ochrona na środek)",
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
    name: "Mata do Bagażnika",
    description: "1 dywanik - Mata do Bagażnika",
    image: "/konfigurator/zestaw/mata.png",
  },
];

export function VariantStep({ config, onUpdate, onNext, onPrevious, priceBreakdown }: VariantStepProps) {
  const getVariantPrice = (variantId: string) => {
    const price = PricingService.calculateConfiguratorPrice(config.matType, variantId as any);
    // Dla 'classic' + 'front' wyświetlaj cenę bez wysyłki (232 zł)
    if (config.matType === 'classic' && variantId === 'front') {
      return price.priceAfterDiscount || (price.totalPrice - price.shippingCost); // Cena bez wysyłki
    }
    return price.totalPrice;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-2 gap-2 md:gap-4">
        {variants.map((variant) => {
          const variantPrice = getVariantPrice(variant.id);
          return (
            <Card
              key={variant.id}
              onClick={() => onUpdate({ variant: variant.id })}
              className={`
                p-2 md:p-4 cursor-pointer transition-all duration-300 md:flex md:flex-col md:h-full
                ${config.variant === variant.id
                  ? 'border-red-500 bg-red-500/10 ring-2 ring-red-500/30 shadow-md shadow-red-500/10 scale-[1.01]'
                  : 'border-neutral-700 bg-neutral-800 hover:border-neutral-600 hover:bg-neutral-750 hover:shadow-sm'
                }
              `}
            >
              <div className="space-y-1.5 md:space-y-2 md:flex md:flex-col md:h-full">
                <div className="md:flex-shrink-0">
                  <h3 className="text-xs md:text-lg font-semibold mb-0.5 md:mb-1 leading-tight">{variant.name}</h3>
                  <p className="text-gray-300 text-[10px] md:text-xs leading-tight md:leading-relaxed line-clamp-2 md:line-clamp-none">{variant.description}</p>
                </div>
                <div className="aspect-video bg-gradient-to-br from-neutral-700 to-neutral-800 rounded-md md:rounded-lg overflow-hidden border border-neutral-700 relative md:flex-1 md:min-h-0">
                  <Image
                    src={variant.image}
                    alt={variant.name}
                    fill
                    className="object-contain p-1 md:p-0"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                <div className="pt-1.5 md:pt-2 border-t border-neutral-700 md:flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-[10px] md:text-xs">Cena:</span>
                    <span className="text-xs md:text-lg font-bold text-white">
                      {variantPrice.toFixed(2)} zł
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4">
        <Button
          onClick={onPrevious}
          variant="outline"
          className="px-6 py-2.5 min-h-[40px] border-neutral-700 hover:bg-neutral-800 text-sm font-medium transition-all duration-200"
        >
          Wstecz
        </Button>
        <div className="flex flex-col items-end gap-2">
          {!config.variant && (
            <p className="text-xs text-gray-400 text-right">Wybierz wariant zestawu aby kontynuować</p>
          )}
          <Button
            onClick={onNext}
            disabled={!config.variant}
            className="px-6 py-2.5 min-h-[40px] bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all duration-200 shadow-md shadow-red-600/20 hover:shadow-lg hover:shadow-red-600/30"
          >
            Dalej
          </Button>
        </div>
      </div>
    </div>
  );
}

