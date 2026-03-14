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
    name: "Mata do Bagażnika",
    description: "1 dywanik - Mata do Bagażnika",
    image: "/konfigurator/zestaw/mata.png",
  },
];

export function MatTypeVariantStep({ config, onUpdate, onNext, onPrevious }: MatTypeVariantStepProps) {
  const getVariantPrice = (variantId: string) => {
    const price = PricingService.calculateConfiguratorPrice(config.matType || "3d-with-rims", variantId as any);
    if (config.matType === 'classic' && variantId === 'front') {
      return price.priceAfterDiscount || (price.totalPrice - price.shippingCost);
    }
    return price.totalPrice;
  };

  return (
    <div className="space-y-6">
      {/* Typ dywaników */}
      <div>
        <h3 className="text-base font-semibold mb-2 text-white/90">Typ dywaników</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            {variants.map((variant) => {
              const variantPrice = getVariantPrice(variant.id);
              return (
                <Card
                  key={variant.id}
                  onClick={() => onUpdate({ variant: variant.id })}
                  className={`
                    p-2 md:p-3 cursor-pointer transition-all duration-300 flex flex-col h-full min-h-[140px] md:min-h-[160px]
                    ${config.variant === variant.id
                      ? 'border-red-500 bg-red-500/10 ring-2 ring-red-500/30 shadow-md shadow-red-500/10 scale-[1.01]'
                      : 'border-white/10 bg-[#111] hover:border-white/20 hover:bg-white/5 hover:shadow-sm active:scale-[0.98]'
                    }
                  `}
                >
                  <div className="flex flex-col h-full space-y-1.5 md:space-y-2">
                    <div className="flex-shrink-0">
                      <h4 className="text-xs md:text-base font-semibold mb-0.5 md:mb-1 leading-tight">{variant.name}</h4>
                      <p className="text-gray-300 text-[10px] md:text-xs leading-tight line-clamp-2">{variant.description}</p>
                    </div>
                    <div className="aspect-video bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded md:rounded-md overflow-hidden border border-white/10 relative flex-1 min-h-0">
                      <Image
                        src={variant.image}
                        alt={variant.name}
                        fill
                        className="object-contain p-0.5 md:p-1"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    </div>
                    <div className="pt-1.5 md:pt-2 border-t border-white/10 flex-shrink-0">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-[10px] md:text-xs">Cena:</span>
                        <span className="text-xs md:text-base font-bold text-white">
                          {variantPrice.toFixed(2)} zł
                        </span>
                      </div>
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

