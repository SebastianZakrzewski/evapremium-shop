"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { getColorInfo } from "@/lib/color-mapping";
import type { ConfiguratorState } from "./ConfiguratorSimple";
import { Car, Shield, Grid, Palette, Plus, CheckCircle2, ShoppingCart } from "lucide-react";

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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Configuration Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white/90 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            Twoja konfiguracja
          </h3>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
            {/* Car Info */}
            <div className="p-4 border-b border-white/5 flex items-start gap-3">
              <div className="p-2 bg-white/5 rounded-lg text-red-400">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-0.5">Samochód</p>
                <p className="text-white font-semibold">{config.brand} {config.model}</p>
                <p className="text-sm text-gray-400">{config.year} • {config.bodyType}</p>
              </div>
            </div>

            {/* Product Details */}
            <div className="p-4 border-b border-white/5 flex items-start gap-3">
              <div className="p-2 bg-white/5 rounded-lg text-blue-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-0.5">Produkt</p>
                <p className="text-white font-medium">{matTypeNames[config.matType]}</p>
                <p className="text-sm text-gray-400">{variantNames[config.variant]}</p>
              </div>
            </div>

            {/* Structure & Colors */}
            <div className="p-4 border-b border-white/5 flex items-start gap-3">
              <div className="p-2 bg-white/5 rounded-lg text-yellow-400">
                <Grid className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-0.5">Wykończenie</p>
                <p className="text-white font-medium mb-1">{structureNames[config.structure]}</p>
                <div className="flex gap-3 mt-2">
                  <div className="flex items-center gap-2 bg-black/20 px-2 py-1 rounded-md border border-white/5">
                    <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: getColorInfo(config.color).color }} />
                    <span className="text-xs text-gray-300">{getColorInfo(config.color).name}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-black/20 px-2 py-1 rounded-md border border-white/5">
                    <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: getColorInfo(config.edgeColor).color }} />
                    <span className="text-xs text-gray-300">{getColorInfo(config.edgeColor).name}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Extras */}
            {config.heelPad && (
              <div className="p-4 flex items-start gap-3 bg-red-500/5">
                <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-red-400/80 uppercase tracking-wider font-medium mb-0.5">Dodatki</p>
                  <p className="text-white font-medium">Podkładka pod piętę</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="flex flex-col h-full">
          <h3 className="text-lg font-semibold text-white/90 flex items-center gap-2 mb-4">
            <ShoppingCart className="w-5 h-5 text-red-500" />
            Podsumowanie
          </h3>
          
          <div className="flex-1 bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -translate-y-16 translate-x-16 group-hover:bg-red-500/10 transition-colors duration-700"></div>
            
            <div className="space-y-3 relative z-10">
              <div className="flex justify-between text-gray-400">
                <span>Cena bazowa</span>
                <span>{priceBreakdown.basePrice.toFixed(2)} zł</span>
              </div>
              
              {priceBreakdown.discount > 0 && (
                <div className="flex justify-between text-green-400 bg-green-500/5 px-2 py-1 rounded">
                  <span>Rabat</span>
                  <span>-{priceBreakdown.discount.toFixed(2)} zł</span>
                </div>
              )}
              
              <div className="flex justify-between text-gray-400">
                <span>Dostawa</span>
                <span className={priceBreakdown.shippingCost === 0 ? "text-green-400 font-medium" : ""}>
                  {priceBreakdown.shippingCost === 0 ? "Gratis" : `${priceBreakdown.shippingCost.toFixed(2)} zł`}
                </span>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-white/10 relative z-10">
              <div className="flex justify-between items-end mb-1">
                <span className="text-gray-300 font-medium">Do zapłaty</span>
                <span className="text-3xl font-bold text-white tracking-tight">
                  {priceBreakdown.totalPrice.toFixed(2)} <span className="text-lg text-gray-500 font-normal">zł</span>
                </span>
              </div>
              <p className="text-xs text-gray-500 text-right">Zawiera podatek VAT</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/5">
        <Button
          onClick={onPrevious}
          variant="outline"
          className="flex-1 h-12 border-white/10 hover:bg-white/5 hover:text-white text-gray-400 transition-all duration-300"
        >
          Wróć do edycji
        </Button>
        <Button
          onClick={onAddToCart}
          disabled={isAddingToCart}
          className="flex-[2] h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold shadow-lg shadow-red-900/20 hover:shadow-red-900/40 transition-all duration-300 transform hover:-translate-y-0.5"
        >
          {isAddingToCart ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Przetwarzanie...</span>
            </div>
          ) : (
            <span className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Zamawiam
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
