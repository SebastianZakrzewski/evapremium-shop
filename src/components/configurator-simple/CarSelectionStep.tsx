"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Brand } from "@/types/carousel";
import { getAvailableModels, getYearsForModel, getBodyTypesForModel, getBodyTypesForYear } from "@/data/car-model-years.utils";

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

// Mapowanie nazw marek (takie samo jak w Configuratorze)
const mapBrandNameForData = (brandName: string): string => {
  if (!brandName) return "";
  
  // Normalizuj input (trim + lowercase) dla lepszego dopasowania
  const normalizedInput = brandName.toLowerCase().trim();
  
  const brandMappings: Record<string, string> = {
    // Mercedes - wszystkie warianty
    "mercedes": "Mercedes-Benz",
    "mercedes-benz": "Mercedes-Benz",
    "mercedes benz": "Mercedes-Benz",
    "Mercedes": "Mercedes-Benz",
    "Mercedes-Benz": "Mercedes-Benz",
    "Mercedes Benz": "Mercedes-Benz",
    // BMW
    "bmw": "Bmw",
    "BMW": "Bmw",
    "Bmw": "Bmw",
    // Pozostałe marki
    "audi": "Audi",
    "Audi": "Audi",
    "tesla": "Tesla",
    "Tesla": "Tesla",
    "porsche": "Porsche",
    "Porsche": "Porsche",
    "volkswagen": "Volkswagen",
    "Volkswagen": "Volkswagen",
    "ford": "Ford",
    "Ford": "Ford",
    "opel": "Opel",
    "Opel": "Opel",
    "peugeot": "Peugeot",
    "Peugeot": "Peugeot",
    "renault": "Renault",
    "Renault": "Renault",
    "fiat": "Fiat",
    "Fiat": "Fiat",
    "alfa romeo": "Alfa romeo",
    "Alfa Romeo": "Alfa romeo",
    "aston martin": "Aston martin",
    "Aston Martin": "Aston martin",
    "acura": "Acura",
    "Acura": "Acura",
    "bentley": "Bentley",
    "Bentley": "Bentley",
    "ferrari": "Ferrari",
    "Ferrari": "Ferrari",
    "lamborghini": "Lamborghini",
    "Lamborghini": "Lamborghini",
    "mclaren": "McLaren",
    "McLaren": "McLaren",
    "maserati": "Maserati",
    "Maserati": "Maserati",
    "rolls-royce": "Rolls-Royce",
    "Rolls-Royce": "Rolls-Royce",
    "lexus": "Lexus",
    "Lexus": "Lexus",
    "infiniti": "Infiniti",
    "Infiniti": "Infiniti",
    "cadillac": "Cadillac",
    "Cadillac": "Cadillac",
    "lincoln": "Lincoln",
    "Lincoln": "Lincoln",
    "jaguar": "Jaguar",
    "Jaguar": "Jaguar",
    "land rover": "Land rover",
    "Land Rover": "Land rover",
    "mini": "Mini",
    "Mini": "Mini",
    "smart": "Smart",
    "Smart": "Smart"
  };
  
  // Najpierw sprawdź znormalizowany input
  const mapped = brandMappings[normalizedInput];
  if (mapped) {
    console.log(`🔍 CarSelectionStep: Mapped brand "${brandName}" -> "${mapped}"`);
    return mapped;
  }
  
  // Jeśli nie ma w mapowaniu, sprawdź oryginalną nazwę (case-sensitive)
  const originalMapped = brandMappings[brandName];
  if (originalMapped) {
    console.log(`🔍 CarSelectionStep: Mapped brand "${brandName}" -> "${originalMapped}" (exact match)`);
    return originalMapped;
  }
  
  // Fallback - zwróć oryginalną nazwę
  console.log(`⚠️ CarSelectionStep: No mapping for "${brandName}", using original`);
  return brandName;
};

const fetchBrands = async (): Promise<Brand[]> => {
  const response = await fetch('/api/car-brands');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export function CarSelectionStep({ config, onUpdate, onNext }: CarSelectionStepProps) {
  const { data: brands = [], isLoading: brandsLoading } = useQuery<Brand[]>({
    queryKey: ['car-brands'],
    queryFn: fetchBrands,
    staleTime: 10 * 60 * 1000,
  });

  // Pobierz dostępne modele dla wybranej marki
  const availableModels = useMemo(() => {
    if (!config.brand) return [];
    try {
      const mappedBrandName = mapBrandNameForData(config.brand);
      return getAvailableModels(mappedBrandName);
    } catch (error) {
      console.error('Error getting models:', error);
      return [];
    }
  }, [config.brand]);

  // Pobierz dostępne lata dla wybranego modelu
  const availableYears = useMemo(() => {
    if (!config.brand || !config.model) return [];
    try {
      const mappedBrandName = mapBrandNameForData(config.brand);
      return getYearsForModel(mappedBrandName, config.model);
    } catch (error) {
      console.error('Error getting years:', error);
      return [];
    }
  }, [config.brand, config.model]);

  // Pobierz dostępne typy nadwozia dla wybranego modelu i roku
  const availableBodyTypes = useMemo(() => {
    if (!config.brand || !config.model || !config.year) return [];
    try {
      const mappedBrandName = mapBrandNameForData(config.brand);
      const year = parseInt(config.year);
      if (isNaN(year)) return [];
      // Najpierw spróbuj dla konkretnego roku
      const bodyTypesForYear = getBodyTypesForYear(mappedBrandName, config.model, year);
      if (bodyTypesForYear.length > 0) return bodyTypesForYear;
      // Jeśli brak, użyj wszystkich dostępnych dla modelu
      return getBodyTypesForModel(mappedBrandName, config.model);
    } catch (error) {
      console.error('Error getting body types:', error);
      return [];
    }
  }, [config.brand, config.model, config.year]);

  // Resetuj zależne pola gdy marka się zmienia
  useEffect(() => {
    if (config.brand) {
      if (!availableModels.includes(config.model)) {
        onUpdate({ model: '', year: '', bodyType: '' });
      }
    }
  }, [config.brand, availableModels]);

  // Resetuj rok i typ nadwozia gdy model się zmienia
  useEffect(() => {
    if (config.model) {
      const currentYear = parseInt(config.year);
      if (isNaN(currentYear) || !availableYears.includes(currentYear)) {
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
            className="w-full px-4 py-2.5 min-h-[40px] bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm appearance-none cursor-pointer focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
            disabled={brandsLoading}
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
            value={config.model}
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
            onChange={(e) => onUpdate({ year: e.target.value, bodyType: '' })}
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
              <option key={year} value={year}>
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
            value={config.bodyType}
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
          className="px-6 py-2.5 min-h-[40px] bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all duration-200 shadow-md shadow-red-600/20 hover:shadow-lg hover:shadow-red-600/30"
        >
          Dalej
        </Button>
      </div>
    </div>
  );
}

