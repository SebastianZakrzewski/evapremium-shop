"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, X, ChevronDown, Loader2, Car } from "lucide-react";
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
    <section className="w-full bg-black py-12 md:py-16 relative">
      {/* Gradient line top */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

      <div className="max-w-5xl mx-auto px-4 relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 flex items-center justify-center gap-3">
            <Car className="w-6 h-6 md:w-8 md:h-8 text-red-500" />
            Dobierz dywaniki w <span className="text-red-500">15 sekund</span>
          </h2>
          <p className="text-gray-400">Wybierz markę i model, a my dopasujemy idealne dywaniki.</p>
        </div>

        {/* Search Container */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-2 md:p-3 shadow-2xl shadow-red-900/10">
          <div className="flex flex-col md:flex-row gap-2">
            {/* Marka */}
            <div className="flex-1 relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Marka</span>
              </div>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="
                  w-full pl-20 pr-10 py-4
                  bg-black/40 hover:bg-black/60
                  border border-white/5 hover:border-white/20
                  rounded-xl
                  text-white font-medium
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
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                {brandsLoading ? (
                  <Loader2 className="w-5 h-5 text-red-500 animate-spin" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                )}
              </div>
            </div>

            {/* Model */}
            <div className="flex-1 relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Model</span>
              </div>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={!selectedBrand || availableModels.length === 0}
                className="
                  w-full pl-20 pr-10 py-4
                  bg-black/40 hover:bg-black/60
                  border border-white/5 hover:border-white/20
                  rounded-xl
                  text-white font-medium
                  appearance-none cursor-pointer
                  transition-all duration-300
                  focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                <option value="" className="bg-neutral-900 text-gray-500">
                  {!selectedBrand ? "Wybierz markę..." : "Wybierz model..."}
                </option>
                {availableModels.map((model) => (
                  <option key={model.id} value={model.name} className="bg-neutral-900 text-white">
                    {model.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <ChevronDown className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
              </div>
            </div>

            {/* Button */}
            <button
              onClick={handleSearch}
              disabled={!selectedBrand}
              className="
                bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600
                text-white font-bold uppercase tracking-wide
                px-8 py-4 rounded-xl
                shadow-lg shadow-red-900/30
                transition-all duration-300
                hover:scale-105 active:scale-95
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                flex items-center justify-center gap-2
                md:min-w-[160px]
              "
            >
              <Search className="w-5 h-5" />
              <span>Szukaj</span>
            </button>
          </div>
        </div>

        {/* Clear Filters */}
        {hasFilters && (
          <div className="mt-4 text-center animate-fade-in">
            <button
              onClick={handleClearFilters}
              className="text-xs text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-1 mx-auto uppercase tracking-wider font-bold"
            >
              <X className="w-3 h-3" />
              Wyczyść filtry
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
