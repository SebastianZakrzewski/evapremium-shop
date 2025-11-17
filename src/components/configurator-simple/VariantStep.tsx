"use client";

import React from "react";
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
  priceBreakdown: {
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
  },
  {
    id: "basic" as const,
    name: "Podstawowy",
    description: "5 dywaników (przód + tył + ochrona na tunel środkowy)",
  },
  {
    id: "premium" as const,
    name: "Premium",
    description: "5 dywaników (przód + tył + bagażnik)",
  },
  {
    id: "complete" as const,
    name: "Mata do Bagażnika",
    description: "1 dywanik - Mata do Bagażnika",
  },
];

export function VariantStep({ config, onUpdate, onNext, onPrevious, priceBreakdown }: VariantStepProps) {
  const getVariantPrice = (variantId: string) => {
    const price = PricingService.calculateConfiguratorPrice(config.matType, variantId as any);
    return price.totalPrice;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        {variants.map((variant) => {
          const variantPrice = getVariantPrice(variant.id);
          return (
            <Card
              key={variant.id}
              onClick={() => onUpdate({ variant: variant.id })}
              className={`
                p-4 md:p-5 cursor-pointer transition-all duration-300
                ${config.variant === variant.id
                  ? 'border-red-500 bg-red-500/10 ring-2 ring-red-500/30 shadow-md shadow-red-500/10 scale-[1.01]'
                  : 'border-neutral-700 bg-neutral-800 hover:border-neutral-600 hover:bg-neutral-750 hover:shadow-sm'
                }
              `}
            >
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg md:text-xl font-semibold mb-1.5 leading-tight">{variant.name}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{variant.description}</p>
                </div>
                <div className="pt-3 border-t border-neutral-700">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Cena:</span>
                    <span className="text-lg md:text-xl font-bold text-red-500">
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
        <Button
          onClick={onNext}
          disabled={!config.variant}
          className="px-6 py-2.5 min-h-[40px] bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all duration-200 shadow-md shadow-red-600/20 hover:shadow-lg hover:shadow-red-600/30"
        >
          Dalej
        </Button>
      </div>
    </div>
  );
}

