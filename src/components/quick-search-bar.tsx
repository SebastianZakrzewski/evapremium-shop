"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ChevronDown, Loader2 } from "lucide-react";
import { useBrands } from "@/features/brands/hooks/useBrands";
import { useConfiguratorCarData } from "@/features/car-configurator";
import { normalizeBrandName } from "@/shared/brands";

export default function QuickSearchBar() {
  const router = useRouter();
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");

  const { brands, isLoading: brandsLoading } = useBrands();

  const brandApiName = selectedBrand
    ? (normalizeBrandName(selectedBrand.toLowerCase().trim()) ?? selectedBrand)
    : "";

  const { models: apiModels, isLoading: modelsLoading } = useConfiguratorCarData({
    brandApiName,
    enabled: !!brandApiName,
  });

  const availableModels = apiModels.map((name) => ({ id: name, name }));


  // Resetuj model gdy zmienia się marka
  useEffect(() => {
    if (selectedBrand) {
      setSelectedModel("");
    }
  }, [selectedBrand]);

  const handleSearch = () => {
    if (!selectedBrand) return;
    
    const params = new URLSearchParams();
    params.set('brand', selectedBrand.toLowerCase());
    
    if (selectedModel) {
      params.set('model', selectedModel);
    }
    
    router.push(`/konfigurator?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setSelectedBrand("");
    setSelectedModel("");
  };

  const hasFilters = selectedBrand || selectedModel;

  return (
    <section
      id="quick-search"
      className="w-full bg-neutral-950 py-20 md:py-24 relative"
      role="region"
      aria-label="Wyszukiwarka dywaników - wybierz markę i model samochodu"
    >
      {/* Gradient line top */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" aria-hidden="true"></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 md:mb-6 leading-tight break-words px-2">
            Dobierz dywaniki w <span className="text-red-500">15 sekund</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed px-2">
            Wybierz markę i model, a my dopasujemy idealne dywaniki.
          </p>
        </div>

        {/* Search Container */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl md:rounded-3xl p-3 md:p-4 shadow-xl shadow-red-900/30">
          <div className="flex flex-col md:flex-row gap-3 md:gap-2">
            {/* Marka */}
            <div className="flex-1 relative group">
              <div className="absolute inset-y-0 left-3 md:left-4 flex items-center pointer-events-none">
                <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Marka</span>
              </div>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                aria-label="Wybierz markę samochodu"
                className="
                  w-full pl-16 md:pl-20 pr-10 py-3.5 md:py-4
                  bg-black/40 hover:bg-black/60
                  border border-white/5 hover:border-white/20
                  rounded-xl
                  text-white text-sm md:text-base font-medium
                  appearance-none cursor-pointer
                  transition-all duration-300
                  focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent
                "
                disabled={brandsLoading}
              >
                <option value="" className="bg-neutral-900 text-gray-500">Wybierz...</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.name} className="bg-neutral-900 text-white">
                    {brand.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 md:right-4 flex items-center pointer-events-none">
                {brandsLoading ? (
                  <Loader2 className="w-4 h-4 md:w-5 md:h-5 text-red-500 animate-spin" />
                ) : (
                  <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-gray-500 group-hover:text-white transition-colors" />
                )}
              </div>
            </div>

            {/* Model */}
            <div className="flex-1 relative group">
              <div className="absolute inset-y-0 left-3 md:left-4 flex items-center pointer-events-none">
                <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Model</span>
              </div>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={!selectedBrand || modelsLoading}
                aria-label="Wybierz model samochodu"
                className="
                  w-full pl-16 md:pl-20 pr-10 py-3.5 md:py-4
                  bg-black/40 hover:bg-black/60
                  border border-white/5 hover:border-white/20
                  rounded-xl
                  text-white text-sm md:text-base font-medium
                  appearance-none cursor-pointer
                  transition-all duration-300
                  focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                <option value="" className="bg-neutral-900 text-gray-500">
                  {!selectedBrand
                    ? "Wybierz markę..."
                    : modelsLoading
                      ? "Ładowanie..."
                      : "Wybierz model..."}
                </option>
                {availableModels.map((model) => (
                  <option key={model.id} value={model.name} className="bg-neutral-900 text-white">
                    {model.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 md:right-4 flex items-center pointer-events-none">
                {modelsLoading ? (
                  <Loader2 className="w-4 h-4 md:w-5 md:h-5 text-red-500 animate-spin" />
                ) : (
                  <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-gray-500 group-hover:text-white transition-colors" />
                )}
              </div>
            </div>

            {/* Button - spójny z Hero CTA */}
            <button
              onClick={handleSearch}
              disabled={!selectedBrand}
              className="
                bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600
                text-white font-bold uppercase tracking-wide
                px-6 md:px-8 py-3.5 md:py-4 rounded-full
                shadow-xl shadow-red-900/30
                transition-all duration-300
                hover:scale-105 active:scale-95
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                flex items-center justify-center gap-2
                text-sm md:text-base
                w-full md:w-auto md:min-w-[160px]
                min-h-[44px]
              "
              aria-label="Szukaj dywaników dla wybranego samochodu"
            >
              <Search className="w-4 h-4 md:w-5 md:h-5" />
              <span>Szukaj</span>
            </button>
          </div>
        </div>

        {/* Clear Filters - touch target min 44px */}
        {hasFilters && (
          <div className="mt-4 text-center animate-fade-in">
            <button
              onClick={handleClearFilters}
              className="text-sm text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto uppercase tracking-wider font-bold py-3 px-4 min-h-[44px] min-w-[44px] rounded-lg hover:bg-white/5"
              aria-label="Wyczyść wybrane filtry marki i modelu"
            >
              <X className="w-4 h-4" />
              Wyczyść filtry
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
