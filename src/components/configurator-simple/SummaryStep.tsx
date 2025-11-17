"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check } from "lucide-react";
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
      <div className="space-y-4">
        <h3 className="text-xl font-semibold mb-4">Twoja konfiguracja</h3>
        
        <div className="space-y-3">
          {/* Samochód */}
          <div className="flex justify-between items-center p-4 bg-neutral-800 rounded-lg border border-neutral-700">
            <span className="text-gray-400">Samochód:</span>
            <span className="font-semibold">{config.brand} {config.model} ({config.year})</span>
          </div>

          {/* Typ nadwozia */}
          <div className="flex justify-between items-center p-4 bg-neutral-800 rounded-lg border border-neutral-700">
            <span className="text-gray-400">Typ nadwozia:</span>
            <span className="font-semibold">{config.bodyType}</span>
          </div>

          {/* Typ dywaników */}
          <div className="flex justify-between items-center p-4 bg-neutral-800 rounded-lg border border-neutral-700">
            <span className="text-gray-400">Typ dywaników:</span>
            <span className="font-semibold">{matTypeNames[config.matType]}</span>
          </div>

          {/* Wariant */}
          <div className="flex justify-between items-center p-4 bg-neutral-800 rounded-lg border border-neutral-700">
            <span className="text-gray-400">Wariant:</span>
            <span className="font-semibold">{variantNames[config.variant]}</span>
          </div>

          {/* Struktura */}
          <div className="flex justify-between items-center p-4 bg-neutral-800 rounded-lg border border-neutral-700">
            <span className="text-gray-400">Struktura:</span>
            <span className="font-semibold">{structureNames[config.structure]}</span>
          </div>

          {/* Kolor dywaników */}
          <div className="flex justify-between items-center p-4 bg-neutral-800 rounded-lg border border-neutral-700">
            <div className="flex items-center gap-3">
              <span className="text-gray-400">Kolor dywaników:</span>
              <div
                className="w-6 h-6 rounded border border-neutral-700"
                style={{ backgroundColor: getColorInfo(config.color).color }}
              />
            </div>
            <span className="font-semibold">{getColorInfo(config.color).name}</span>
          </div>

          {/* Kolor obszycia */}
          <div className="flex justify-between items-center p-4 bg-neutral-800 rounded-lg border border-neutral-700">
            <div className="flex items-center gap-3">
              <span className="text-gray-400">Kolor obszycia:</span>
              <div
                className="w-6 h-6 rounded border border-neutral-700"
                style={{ backgroundColor: getColorInfo(config.edgeColor).color }}
              />
            </div>
            <span className="font-semibold">{getColorInfo(config.edgeColor).name}</span>
          </div>

          {/* Podkładka pod piętę */}
          {config.heelPad && (
            <div className="flex justify-between items-center p-4 bg-neutral-800 rounded-lg border border-neutral-700">
              <span className="text-gray-400">Dodatki:</span>
              <span className="font-semibold flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                Podkładka pod piętę
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Podsumowanie ceny */}
      <div className="p-6 bg-neutral-900 rounded-lg border border-neutral-800">
        <h3 className="text-xl font-semibold mb-4">Podsumowanie ceny</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-gray-400">
            <span>Cena bazowa:</span>
            <span>{priceBreakdown.basePrice.toFixed(2)} zł</span>
          </div>
          {priceBreakdown.discount > 0 && (
            <div className="flex justify-between text-green-400">
              <span>Rabat:</span>
              <span>-{priceBreakdown.discount.toFixed(2)} zł</span>
            </div>
          )}
          {priceBreakdown.shippingCost > 0 && (
            <div className="flex justify-between text-gray-400">
              <span>Dostawa:</span>
              <span>{priceBreakdown.shippingCost.toFixed(2)} zł</span>
            </div>
          )}
          <div className="border-t border-neutral-700 pt-2 mt-2">
            <div className="flex justify-between text-2xl font-bold">
              <span>Razem:</span>
              <span className="text-red-500">{priceBreakdown.totalPrice.toFixed(2)} zł</span>
            </div>
          </div>
        </div>
      </div>

      {/* Przyciski */}
      <div className="flex gap-4 pt-4">
        <Button
          onClick={onPrevious}
          variant="outline"
          className="flex-1 px-6 py-3 border-neutral-700 hover:bg-neutral-800"
        >
          Wstecz
        </Button>
        <Button
          onClick={onAddToCart}
          disabled={isAddingToCart}
          className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAddingToCart ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Dodawanie...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Dodaj do koszyka
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}

