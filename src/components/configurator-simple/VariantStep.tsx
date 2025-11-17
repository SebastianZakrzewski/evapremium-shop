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
    icon: "🚗",
  },
  {
    id: "basic" as const,
    name: "Podstawowy",
    description: "5 dywaników (przód + tył + ochrona na tunel środkowy)",
    icon: "🚙",
  },
  {
    id: "premium" as const,
    name: "Premium",
    description: "5 dywaników (przód + tył + bagażnik)",
    icon: "⭐",
  },
  {
    id: "complete" as const,
    name: "Mata do Bagażnika",
    description: "1 dywanik - Mata do Bagażnika",
    icon: "📦",
  },
];

export function VariantStep({ config, onUpdate, onNext, onPrevious, priceBreakdown }: VariantStepProps) {
  const getVariantPrice = (variantId: string) => {
    const price = PricingService.calculateConfiguratorPrice(config.matType, variantId as any);
    return price.totalPrice;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {variants.map((variant) => {
          const variantPrice = getVariantPrice(variant.id);
          return (
            <Card
              key={variant.id}
              onClick={() => onUpdate({ variant: variant.id })}
              className={`
                p-6 cursor-pointer transition-all duration-200
                ${config.variant === variant.id
                  ? 'border-red-500 bg-red-500/10 ring-2 ring-red-500/20'
                  : 'border-neutral-700 bg-neutral-800 hover:border-neutral-600'
                }
              `}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{variant.icon}</span>
                    <div>
                      <h3 className="text-xl font-semibold">{variant.name}</h3>
                      <p className="text-gray-400 text-sm">{variant.description}</p>
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-neutral-700">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Cena:</span>
                    <span className="text-xl font-bold text-red-500">
                      {variantPrice.toFixed(2)} zł
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-4 justify-end pt-4">
        <Button
          onClick={onPrevious}
          variant="outline"
          className="px-6 py-3 border-neutral-700 hover:bg-neutral-800"
        >
          Wstecz
        </Button>
        <Button
          onClick={onNext}
          disabled={!config.variant}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Dalej
        </Button>
      </div>
    </div>
  );
}

