"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ChevronDown, Loader2, CarFront } from "lucide-react";
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
      className="w-full bg-black py-24 relative overflow-hidden"
      role="region"
      aria-label="Wyszukiwarka dywaników - wybierz markę i model samochodu"
    >
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-red-900/10 blur-[120px] rounded-full pointer-events-none" aria-hidden="true"></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-white/5 rounded-2xl mb-6 border border-white/10 shadow-xl">
            <CarFront className="w-6 h-6 text-red-500" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Dobierz dywaniki w <span className="text-red-500">15 sekund</span>
          </h2>
          <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto font-light">
            Wybierz markę i model, a my dopasujemy idealne dywaniki do Twojego wnętrza.
          </p>
        </div>

        {/* Search Container */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-4 md:p-6 shadow-2xl shadow-black/50">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Marka */}
            <div className="flex-1 relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-widest">Marka</span>
              </div>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                aria-label="Wybierz markę samochodu"
                className="
                  w-full pl-20 pr-12 py-4 md:py-5
                  bg-black/40 hover:bg-black/60
                  border border-white/5 hover:border-white/20
                  rounded-2xl
                  text-white text-base font-medium
                  appearance-none cursor-pointer
                  transition-all duration-300
                  focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent
                "
                disabled={brandsLoading}
              >
                <option value="" className="bg-[#111] text-gray-400">Wybierz markę...</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.name} className="bg-[#111] text-white">
                    {brand.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                {brandsLoading ? (
                  <Loader2 className="w-5 h-5 text-red-500 animate-spin" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                )}
              </div>
            </div>

            {/* Model */}
            <div className="flex-1 relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-widest">Model</span>
              </div>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={!selectedBrand || modelsLoading}
                aria-label="Wybierz model samochodu"
                className="
                  w-full pl-20 pr-12 py-4 md:py-5
                  bg-black/40 hover:bg-black/60
                  border border-white/5 hover:border-white/20
                  rounded-2xl
                  text-white text-base font-medium
                  appearance-none cursor-pointer
                  transition-all duration-300
                  focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                <option value="" className="bg-[#111] text-gray-400">
                  {!selectedBrand
                    ? "Najpierw wybierz markę"
                    : modelsLoading
                      ? "Ładowanie modeli..."
                      : "Wybierz model..."}
                </option>
                {availableModels.map((model) => (
                  <option key={model.id} value={model.name} className="bg-[#111] text-white">
                    {model.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                {modelsLoading ? (
                  <Loader2 className="w-5 h-5 text-red-500 animate-spin" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                )}
              </div>
            </div>

            {/* Button */}
            <button
              onClick={handleSearch}
              disabled={!selectedBrand}
              className="
                relative overflow-hidden
                bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600
                text-white font-semibold tracking-wide
                px-8 py-4 md:py-5 rounded-2xl
                transition-all duration-300
                hover:scale-[1.02] active:scale-[0.98]
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                flex items-center justify-center gap-3
                min-w-[180px]
                shadow-xl shadow-red-900/30
              "
              aria-label="Szukaj dywaników dla wybranego samochodu"
            >
              <Search className="w-5 h-5" />
              <span>Szukaj</span>
            </button>
          </div>
        </div>

        {/* Clear Filters */}
        {hasFilters && (
          <div className="mt-6 text-center animate-fade-in">
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors font-medium py-2 px-4 rounded-full hover:bg-white/5"
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
