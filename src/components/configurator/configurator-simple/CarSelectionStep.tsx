"use client";

import React, { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { normalizeBrandName } from "@/shared/brands";
import { useBrands } from "@/features/brands/hooks/useBrands";
import { useConfiguratorCarData } from "@/features/car-configurator";

interface CarSelectionStepProps {
  config: {
    brand: string;
    model: string;
    year: string;
    bodyType: string;
  };
  onUpdate: (updates: { brand?: string; model?: string; year?: string; bodyType?: string }) => void;
  onNext: () => void;
}

const mapBrandNameForApi = (brandName: string): string => {
  if (!brandName) return "";
  const normalized = normalizeBrandName(brandName.toLowerCase().trim());
  return normalized ?? brandName.charAt(0).toUpperCase() + brandName.slice(1);
};

export function CarSelectionStep({ config, onUpdate, onNext }: CarSelectionStepProps) {
  const { brands, isLoading: brandsLoading } = useBrands();
  const brandApiName = mapBrandNameForApi(config.brand);

  const {
    models: apiModels,
    getYearsForModel,
    getBodyTypesForModel,
    getBodyTypesForYear,
    findGenerationByYear,
    isLoading: modelsLoading,
  } = useConfiguratorCarData({
    brandApiName,
    enabled: !!config.brand,
  });

  const availableModels = apiModels;

  const availableYears = useMemo(() => {
    if (!config.model) return [];
    return getYearsForModel(config.model);
  }, [config.model, getYearsForModel]);

  const availableBodyTypes = useMemo(() => {
    if (!config.model || !config.year) return [];
    const year = parseInt(config.year, 10);
    if (isNaN(year)) return [];
    const forYear = getBodyTypesForYear(config.model, year);
    return forYear.length > 0 ? forYear : getBodyTypesForModel(config.model);
  }, [config.model, config.year, getBodyTypesForYear, getBodyTypesForModel]);

  const generation = useMemo(() => {
    if (!config.model || !config.year) return undefined;
    const year = parseInt(config.year, 10);
    if (isNaN(year)) return undefined;
    return findGenerationByYear(config.model, year) ?? undefined;
  }, [config.model, config.year, findGenerationByYear]);

  // Normalizuj wartość modelu z URL do wartości w liście dostępnych modeli
  const normalizedModel = useMemo(() => {
    if (!config.model || availableModels.length === 0) return config.model;
    // Znajdź model w liście (case-insensitive)
    const found = availableModels.find(m => m.toLowerCase() === config.model.toLowerCase());
    return found || config.model;
  }, [config.model, availableModels]);

  // Normalizuj wartość typu nadwozia z URL do wartości w liście dostępnych typów
  const normalizedBodyType = useMemo(() => {
    if (!config.bodyType || availableBodyTypes.length === 0) return config.bodyType;
    // Znajdź typ nadwozia w liście (case-insensitive)
    const found = availableBodyTypes.find(bt => bt.toLowerCase() === config.bodyType.toLowerCase());
    return found || config.bodyType;
  }, [config.bodyType, availableBodyTypes]);

  // Zaktualizuj wartości jeśli są znormalizowane (synchronicznie)
  useEffect(() => {
    if (normalizedModel && normalizedModel !== config.model && availableModels.length > 0) {
      console.log('✅ CarSelectionStep: Normalizing model:', config.model, '->', normalizedModel);
      onUpdate({ model: normalizedModel });
    }
  }, [normalizedModel, config.model, availableModels]);

  useEffect(() => {
    if (normalizedBodyType && normalizedBodyType !== config.bodyType && availableBodyTypes.length > 0) {
      console.log('✅ CarSelectionStep: Normalizing bodyType:', config.bodyType, '->', normalizedBodyType);
      onUpdate({ bodyType: normalizedBodyType });
    }
  }, [normalizedBodyType, config.bodyType, availableBodyTypes]);

  // Resetuj zależne pola gdy marka się zmienia (tylko jeśli model nie jest dostępny po normalizacji)
  useEffect(() => {
    if (config.brand && availableModels.length > 0 && config.model) {
      // Sprawdź czy model istnieje po normalizacji
      const normalizedModelCheck = availableModels.find(m => m.toLowerCase() === config.model.toLowerCase());
      if (!normalizedModelCheck) {
        console.log('⚠️ CarSelectionStep: Model not found in available models after normalization, resetting:', config.model);
        onUpdate({ model: '', year: '', bodyType: '' });
      }
    }
  }, [config.brand, availableModels, config.model]);

  // Resetuj rok i typ nadwozia gdy model się zmienia (tylko jeśli rok nie jest dostępny)
  useEffect(() => {
    if (config.model && availableYears.length > 0 && config.year) {
      const currentYear = parseInt(config.year);
      if (!isNaN(currentYear) && !availableYears.includes(currentYear)) {
        console.log('⚠️ CarSelectionStep: Year not found in available years, resetting:', config.year);
        onUpdate({ year: '', bodyType: '' });
      }
    }
  }, [config.model, availableYears, config.year]);

  const isStepComplete = !!(config.brand && config.model && config.year && config.bodyType);

  return (
    <div className="space-y-6">
      {/* Marka */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Marka *
        </label>
        <div className="relative">
          <select
            value={config.brand}
            onChange={(e) => onUpdate({ brand: e.target.value, model: '', year: '', bodyType: '' })}
            className="w-full px-4 py-3 min-h-[44px] md:min-h-[40px] bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm appearance-none cursor-pointer focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
            disabled={brandsLoading || modelsLoading}
          >
            <option value="">Wybierz markę</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.name}>
                {brand.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {brandsLoading ? (
              <span className="text-gray-400 text-sm">...</span>
            ) : (
              <span className="text-gray-400">▼</span>
            )}
          </div>
        </div>
      </div>

      {/* Model */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Model *
        </label>
        <div className="relative">
          <select
            value={normalizedModel || config.model}
            onChange={(e) => onUpdate({ model: e.target.value, year: '', bodyType: '' })}
            disabled={!config.brand || availableModels.length === 0}
            className="w-full px-4 py-3 md:py-4 min-h-[44px] bg-neutral-800 border border-neutral-700 rounded-lg text-white text-base appearance-none cursor-pointer focus:border-red-500 focus:ring-2 focus:ring-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <option value="">
              {!config.brand 
                ? "Najpierw wybierz markę" 
                : availableModels.length === 0
                ? "Brak dostępnych modeli"
                : "Wybierz model"}
            </option>
            {availableModels.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className="text-gray-400">▼</span>
          </div>
        </div>
      </div>

      {/* Rok produkcji */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Rok produkcji *
        </label>
        <div className="relative">
          <select
            value={config.year}
            onChange={(e) => {
              console.log('✅ CarSelectionStep: Year changed to:', e.target.value);
              onUpdate({ year: e.target.value, bodyType: '' });
            }}
            disabled={!config.model || availableYears.length === 0}
            className="w-full px-4 py-3 md:py-4 min-h-[44px] bg-neutral-800 border border-neutral-700 rounded-lg text-white text-base appearance-none cursor-pointer focus:border-red-500 focus:ring-2 focus:ring-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <option value="">
              {!config.model 
                ? "Najpierw wybierz model" 
                : availableYears.length === 0
                ? "Brak dostępnych lat"
                : "Wybierz rok"}
            </option>
            {availableYears.map((year) => (
              <option key={year} value={String(year)}>
                {year}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className="text-gray-400">▼</span>
          </div>
        </div>
      </div>

      {/* Typ nadwozia */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Typ nadwozia *
        </label>
        <div className="relative">
          <select
            value={normalizedBodyType || config.bodyType}
            onChange={(e) => onUpdate({ bodyType: e.target.value })}
            disabled={!config.year || availableBodyTypes.length === 0}
            className="w-full px-4 py-3 md:py-4 min-h-[44px] bg-neutral-800 border border-neutral-700 rounded-lg text-white text-base appearance-none cursor-pointer focus:border-red-500 focus:ring-2 focus:ring-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <option value="">
              {!config.year 
                ? "Najpierw wybierz rok" 
                : availableBodyTypes.length === 0
                ? "Brak dostępnych typów nadwozia"
                : "Wybierz typ nadwozia"}
            </option>
            {availableBodyTypes.map((bodyType) => (
              <option key={bodyType} value={bodyType}>
                {bodyType}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className="text-gray-400">▼</span>
          </div>
        </div>
      </div>


      {/* Przycisk Dalej */}
      <div className="flex flex-col items-end gap-2 pt-4">
        {!isStepComplete && (
          <p className="text-xs text-gray-400 text-right">
            {!config.brand && "Wybierz markę aby kontynuować"}
            {config.brand && !config.model && "Wybierz model aby kontynuować"}
            {config.brand && config.model && !config.year && "Wybierz rok aby kontynuować"}
            {config.brand && config.model && config.year && !config.bodyType && "Wybierz typ nadwozia aby kontynuować"}
          </p>
        )}
        <Button
          onClick={onNext}
          disabled={!isStepComplete}
          className="w-full sm:w-auto px-6 py-3 min-h-[44px] md:min-h-[40px] bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all duration-200 shadow-md shadow-red-600/20 hover:shadow-lg hover:shadow-red-600/30 active:scale-95"
        >
          Dalej
        </Button>
      </div>
    </div>
  );
}

