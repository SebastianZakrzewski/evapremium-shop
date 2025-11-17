"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, X, ChevronDown, Loader2 } from "lucide-react";
import { Brand } from "@/types/carousel";
import { getAvailableModels } from "@/data/car-model-years.utils";

// Mapowanie nazw marek z API na nazwy w bazie danych (takie samo jak w Configuratorze)
const mapBrandNameForData = (brandName: string): string => {
  const brandMappings: Record<string, string> = {
    "Mercedes": "Mercedes-Benz",
    "Mercedes-Benz": "Mercedes-Benz",
    "BMW": "Bmw",
    "Bmw": "Bmw",
    "Audi": "Audi",
    "Tesla": "Tesla",
    "Porsche": "Porsche",
    "Volkswagen": "Volkswagen",
    "Ford": "Ford",
    "Opel": "Opel",
    "Peugeot": "Peugeot",
    "Renault": "Renault",
    "Fiat": "Fiat",
    "Alfa Romeo": "Alfa romeo",
    "Aston Martin": "Aston martin",
    "Acura": "Acura",
    "Bentley": "Bentley",
    "Ferrari": "Ferrari",
    "Lamborghini": "Lamborghini",
    "McLaren": "McLaren",
    "Maserati": "Maserati",
    "Rolls-Royce": "Rolls-Royce",
    "Lexus": "Lexus",
    "Infiniti": "Infiniti",
    "Cadillac": "Cadillac",
    "Lincoln": "Lincoln",
    "Jaguar": "Jaguar",
    "Land Rover": "Land rover",
    "Mini": "Mini",
    "Smart": "Smart"
  };
  
  return brandMappings[brandName] || brandName;
};

// Fetch function dla marek
const fetchBrands = async (): Promise<Brand[]> => {
  const response = await fetch('/api/car-brands');
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

export default function QuickSearchBar() {
  const router = useRouter();
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");

  // Pobierz marki
  const { data: brands = [], isLoading: brandsLoading } = useQuery<Brand[]>({
    queryKey: ['car-brands'],
    queryFn: fetchBrands,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // Pobierz dostępne modele dla wybranej marki (używając tej samej logiki co Configurator)
  const availableModels = useMemo(() => {
    if (!selectedBrand) return [];
    
    try {
      // Mapuj nazwę marki do formatu używanego w danych (takie samo jak w Configuratorze)
      const mappedBrandName = mapBrandNameForData(selectedBrand);
      const modelNames = getAvailableModels(mappedBrandName);
      
      // Konwertuj do formatu oczekiwanego przez komponent
      return modelNames.map(modelName => ({
        id: modelName,
        name: modelName
      }));
    } catch (error) {
      console.error('Error getting models:', error);
      return [];
    }
  }, [selectedBrand]);


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
    <section className="w-full bg-black py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tytuł */}
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-6 md:mb-8">
          Dobierz dywaniki w 15 sekund
        </h2>

        {/* Pasek wyszukiwania */}
        <div className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 rounded-xl p-4 md:p-6 shadow-lg shadow-red-500/10">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center">
            {/* Marka */}
            <div className="flex-1 relative">
              <label htmlFor="brand-select" className="sr-only">
                Marka
              </label>
              <select
                id="brand-select"
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="
                  w-full
                  px-4 py-2.5 md:py-3
                  bg-neutral-800/50
                  border border-neutral-700
                  rounded-lg
                  text-white text-sm md:text-base
                  focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none
                  transition-all duration-200
                  hover:border-neutral-600
                  appearance-none
                  cursor-pointer
                  min-h-[42px] md:min-h-[44px]
                "
                disabled={brandsLoading}
              >
                <option value="" className="bg-neutral-900 text-gray-400">
                  {brandsLoading ? "Ładowanie..." : "Marka"}
                </option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.name} className="bg-neutral-800 text-white">
                    {brand.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                {brandsLoading ? (
                  <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>

            {/* Separator */}
            <div className="hidden md:block w-px bg-neutral-700 self-stretch" />

            {/* Model */}
            <div className="flex-1 relative">
              <label htmlFor="model-select" className="sr-only">
                Model
              </label>
              <select
                id="model-select"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={!selectedBrand || availableModels.length === 0}
                className="
                  w-full
                  px-4 py-2.5 md:py-3
                  bg-neutral-800/50
                  border border-neutral-700
                  rounded-lg
                  text-white text-sm md:text-base
                  focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none
                  transition-all duration-200
                  hover:border-neutral-600
                  appearance-none
                  cursor-pointer
                  min-h-[42px] md:min-h-[44px]
                  disabled:bg-neutral-900/50 disabled:cursor-not-allowed disabled:text-gray-500
                "
              >
                <option value="" className="bg-neutral-900 text-gray-400">
                  {!selectedBrand 
                    ? "Najpierw wybierz markę" 
                    : availableModels.length === 0
                    ? "Brak dostępnych modeli"
                    : "Model"}
                </option>
                {availableModels.map((model) => (
                  <option key={model.id} value={model.name} className="bg-neutral-800 text-white">
                    {model.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Separator */}
            <div className="hidden md:block w-px bg-neutral-700 self-stretch" />

            {/* Przycisk Szukaj */}
            <button
              onClick={handleSearch}
              disabled={!selectedBrand}
              className="
                px-6 md:px-8
                py-2.5 md:py-3
                bg-gradient-to-r from-red-500 to-red-600
                hover:from-red-600 hover:to-red-700
                text-white
                font-semibold
                rounded-lg
                transition-all duration-200
                shadow-md shadow-red-500/30 hover:shadow-lg hover:shadow-red-500/40
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
                min-h-[42px] md:min-h-[44px]
                text-sm md:text-base
              "
            >
              <Search className="w-5 h-5" />
              <span>Szukaj</span>
            </button>
          </div>

          {/* Przycisk Usuń filtry */}
          {hasFilters && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleClearFilters}
                className="
                  flex items-center gap-2
                  text-gray-400 hover:text-white
                  text-sm
                  transition-colors duration-200
                "
              >
                <X className="w-4 h-4" />
                <span>USUŃ FILTRY</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

