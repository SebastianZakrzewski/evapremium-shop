"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ChevronDown, Loader2 } from "lucide-react";
import { useBrands } from "@/features/brands/hooks/useBrands";
import { buildConfiguratorEntryUrl } from "@/features/car-configurator/utils/buildConfiguratorEntryUrl";
import { useQuickSearchCatalog } from "@/features/vehicle-catalog/hooks/useQuickSearchCatalog";
import { enrichCarContextFromTemplates } from "@/features/vehicle-catalog/utils/enrichCarContextFromTemplates";
import { formatBrandDisplayName } from "@/shared/vehicle/displayLabels";
import ShopSectionHeading from "@/components/ui/shop-section-heading";

export default function QuickSearchBar() {
  const router = useRouter();
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedModelFamilyKey, setSelectedModelFamilyKey] = useState<string>("");

  const { brands, isLoading: brandsLoading } = useBrands();

  const selectedBrandKey = useMemo(() => {
    if (!selectedBrand) return "";
    return brands.find((brand) => brand.name === selectedBrand)?.key ?? "";
  }, [brands, selectedBrand]);

  const { models, templates, isLoading: modelsLoading } = useQuickSearchCatalog(
    selectedBrandKey,
    selectedModelFamilyKey,
  );

  const selectedModelCatalogName = useMemo(
    () => models.find((model) => model.key === selectedModelFamilyKey)?.name
      ?? selectedModelFamilyKey,
    [models, selectedModelFamilyKey],
  );

  useEffect(() => {
    if (selectedBrand) {
      setSelectedModelFamilyKey("");
    }
  }, [selectedBrand]);

  const handleSearch = () => {
    if (!selectedBrand) return;

    if (!selectedModelFamilyKey) {
      router.push(buildConfiguratorEntryUrl({ brand: selectedBrand }));
      return;
    }

    const enrichment = enrichCarContextFromTemplates(templates);

    router.push(
      buildConfiguratorEntryUrl({
        brand: selectedBrand,
        model: selectedModelCatalogName,
        generation: enrichment.generation,
        bodyType: enrichment.bodyType,
      }),
    );
  };

  const handleClearFilters = () => {
    setSelectedBrand("");
    setSelectedModelFamilyKey("");
  };

  const hasFilters = selectedBrand || selectedModelFamilyKey;

  return (
    <section
      id="quick-search"
      className="w-full bg-[#FDFDFD] pt-7 pb-14 md:pt-9 md:pb-16 relative"
      role="region"
      aria-label="Wyszukiwarka dywaników - wybierz markę i model samochodu"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        <ShopSectionHeading
          className="mb-4 md:mb-5"
          kicker="Dobór"
          title="Dobierz dywaniki w 15 sekund"
          description="Wybierz markę i model, a my dopasujemy idealne dywaniki."
        />

        <div className="relative">
          <div className="quick-search-glow pointer-events-none absolute" aria-hidden="true" />
          <div className="relative z-10 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl md:rounded-3xl p-3 md:p-4">
          <div className="flex flex-col md:flex-row gap-3 md:gap-2">
            <div className="flex-1 relative group">
              <div className="absolute inset-y-0 left-3 md:left-4 flex items-center pointer-events-none">
                <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Marka</span>
              </div>
              <select
                value={selectedBrand}
                onChange={(event) => setSelectedBrand(event.target.value)}
                aria-label="Wybierz markę samochodu"
                className="w-full pl-16 md:pl-20 pr-10 py-3.5 md:py-4 bg-white hover:bg-neutral-50 border border-neutral-200 hover:border-neutral-300 rounded-xl text-neutral-950 text-sm md:text-base font-medium appearance-none cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent"
                disabled={brandsLoading}
              >
                <option value="" className="bg-[#FDFDFD] text-gray-400">Wybierz...</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.name} className="bg-[#FDFDFD] text-white">
                    {formatBrandDisplayName(brand.name)}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 md:right-4 flex items-center pointer-events-none">
                {brandsLoading ? (
                  <Loader2 className="w-4 h-4 md:w-5 md:h-5 text-red-500 animate-spin" />
                ) : (
                  <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-white transition-colors" />
                )}
              </div>
            </div>

            <div className="flex-1 relative group">
              <div className="absolute inset-y-0 left-3 md:left-4 flex items-center pointer-events-none">
                <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Model</span>
              </div>
              <select
                value={selectedModelFamilyKey}
                onChange={(event) => setSelectedModelFamilyKey(event.target.value)}
                disabled={!selectedBrand || modelsLoading}
                aria-label="Wybierz model samochodu"
                className="w-full pl-16 md:pl-20 pr-10 py-3.5 md:py-4 bg-white hover:bg-neutral-50 border border-neutral-200 hover:border-neutral-300 rounded-xl text-neutral-950 text-sm md:text-base font-medium appearance-none cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent disabled:cursor-not-allowed disabled:bg-white"
              >
                <option value="" className="bg-[#FDFDFD] text-gray-400">
                  {!selectedBrand
                    ? "Wybierz markę..."
                    : modelsLoading
                      ? "Ładowanie..."
                      : "Wybierz model..."}
                </option>
                {models.map((model) => (
                  <option key={model.key} value={model.key} className="bg-[#FDFDFD] text-white">
                    {model.displayName ?? model.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 md:right-4 flex items-center pointer-events-none">
                {modelsLoading ? (
                  <Loader2 className="w-4 h-4 md:w-5 md:h-5 text-red-500 animate-spin" />
                ) : (
                  <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-white transition-colors" />
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSearch}
              disabled={!selectedBrand}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold uppercase tracking-wide px-6 md:px-8 py-3.5 md:py-4 rounded-full shadow-md shadow-red-950/40 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 text-sm md:text-base w-full md:w-auto md:min-w-[160px] min-h-[44px]"
              aria-label="Szukaj dywaników dla wybranego samochodu"
            >
              <Search className="w-4 h-4 md:w-5 md:h-5" />
              <span>Szukaj</span>
            </button>
          </div>
          </div>
        </div>

        {hasFilters && (
          <div className="mt-4 text-center animate-fade-in">
            <button
              type="button"
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
