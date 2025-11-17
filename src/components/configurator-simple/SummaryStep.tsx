"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { getColorInfo } from "@/lib/color-mapping";
import type { ConfiguratorState } from "./ConfiguratorSimple";

interface SummaryStepProps {
  config: ConfiguratorState;
  priceBreakdown: {
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
  complete: "Mata do Bagażnika",
};

const matTypeNames: Record<string, string> = {
  "3d-with-rims": "3D z rantami",
  classic: "3D bez rantów",
};

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
}: SummaryStepProps) {
  return (
    <div className="space-y-6">
      {/* Podsumowanie konfiguracji */}
      <div className="space-y-3">
        <h3 className="text-lg md:text-xl font-semibold mb-4 leading-tight">Twoja konfiguracja</h3>
        
        <div className="space-y-2.5">
          {/* Samochód */}
          <div className="flex justify-between items-center p-3 md:p-4 bg-neutral-800 rounded-lg border border-neutral-700 shadow-sm">
            <span className="text-gray-400 text-sm">Samochód:</span>
            <span className="font-semibold text-sm md:text-base text-right">{config.brand} {config.model} ({config.year})</span>
          </div>

          {/* Typ nadwozia */}
          <div className="flex justify-between items-center p-3 md:p-4 bg-neutral-800 rounded-lg border border-neutral-700 shadow-sm">
            <span className="text-gray-400 text-sm">Typ nadwozia:</span>
            <span className="font-semibold text-sm md:text-base">{config.bodyType}</span>
          </div>

          {/* Typ dywaników */}
          <div className="flex justify-between items-center p-3 md:p-4 bg-neutral-800 rounded-lg border border-neutral-700 shadow-sm">
            <span className="text-gray-400 text-sm">Typ dywaników:</span>
            <span className="font-semibold text-sm md:text-base">{matTypeNames[config.matType]}</span>
          </div>

          {/* Wariant */}
          <div className="flex justify-between items-center p-3 md:p-4 bg-neutral-800 rounded-lg border border-neutral-700 shadow-sm">
            <span className="text-gray-400 text-sm">Wariant:</span>
            <span className="font-semibold text-sm md:text-base">{variantNames[config.variant]}</span>
          </div>

          {/* Struktura */}
          <div className="flex justify-between items-center p-3 md:p-4 bg-neutral-800 rounded-lg border border-neutral-700 shadow-sm">
            <span className="text-gray-400 text-sm">Struktura:</span>
            <span className="font-semibold text-sm md:text-base">{structureNames[config.structure]}</span>
          </div>

          {/* Kolor dywaników */}
          <div className="flex justify-between items-center p-3 md:p-4 bg-neutral-800 rounded-lg border border-neutral-700 shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="text-gray-400 text-sm">Kolor dywaników:</span>
              <div
                className="w-5 h-5 md:w-6 md:h-6 rounded border-2 border-neutral-600 shadow-sm"
                style={{ backgroundColor: getColorInfo(config.color).color }}
              />
            </div>
            <span className="font-semibold text-sm md:text-base">{getColorInfo(config.color).name}</span>
          </div>

          {/* Kolor obszycia */}
          <div className="flex justify-between items-center p-3 md:p-4 bg-neutral-800 rounded-lg border border-neutral-700 shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="text-gray-400 text-sm">Kolor obszycia:</span>
              <div
                className="w-5 h-5 md:w-6 md:h-6 rounded border-2 border-neutral-600 shadow-sm"
                style={{ backgroundColor: getColorInfo(config.edgeColor).color }}
              />
            </div>
            <span className="font-semibold text-sm md:text-base">{getColorInfo(config.edgeColor).name}</span>
          </div>

          {/* Podkładka pod piętę */}
          {config.heelPad && (
            <div className="flex justify-between items-center p-3 md:p-4 bg-neutral-800 rounded-lg border border-neutral-700 shadow-sm">
              <span className="text-gray-400 text-sm">Dodatki:</span>
              <span className="font-semibold text-sm md:text-base">
                Podkładka pod piętę
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Podsumowanie ceny */}
      <div className="p-4 md:p-5 bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-lg border border-neutral-800 shadow-md">
        <h3 className="text-lg md:text-xl font-semibold mb-4 leading-tight">Podsumowanie ceny</h3>
        <div className="space-y-2.5">
          <div className="flex justify-between text-gray-300 text-sm">
            <span>Cena bazowa:</span>
            <span className="font-semibold">{priceBreakdown.basePrice.toFixed(2)} zł</span>
          </div>
          {priceBreakdown.discount > 0 && (
            <div className="flex justify-between text-green-400 text-sm">
              <span>Rabat:</span>
              <span className="font-bold">-{priceBreakdown.discount.toFixed(2)} zł</span>
            </div>
          )}
          {priceBreakdown.shippingCost > 0 && (
            <div className="flex justify-between text-gray-300 text-sm">
              <span>Dostawa:</span>
              <span className="font-semibold">{priceBreakdown.shippingCost.toFixed(2)} zł</span>
            </div>
          )}
          <div className="border-t border-neutral-700 pt-3 mt-3">
            <div className="flex justify-between text-xl md:text-2xl font-bold">
              <span>Razem:</span>
              <span className="text-red-500">{priceBreakdown.totalPrice.toFixed(2)} zł</span>
            </div>
          </div>
        </div>
      </div>

      {/* Przyciski */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          onClick={onPrevious}
          variant="outline"
          className="flex-1 px-6 py-2.5 min-h-[40px] border-neutral-700 hover:bg-neutral-800 text-sm font-medium transition-all duration-200"
        >
          Wstecz
        </Button>
        <Button
          onClick={onAddToCart}
          disabled={isAddingToCart}
          className="flex-1 px-6 py-2.5 min-h-[40px] bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all duration-200 shadow-md shadow-red-600/20 hover:shadow-lg hover:shadow-red-600/30"
        >
          {isAddingToCart ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Dodawanie...
            </span>
          ) : (
            <span>Dodaj do koszyka</span>
          )}
        </Button>
      </div>
    </div>
  );
}

