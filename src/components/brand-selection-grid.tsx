"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { BrandGridCard } from "./ui/BrandGridCard";
import { Brand } from "../types/carousel";
import { Loader2, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

// Fetch function dla React Query (ten sam co ProductSelection)
const fetchBrands = async (): Promise<Brand[]> => {
  const response = await fetch('/api/car-brands');
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// Fallback brands (te same co w ProductSelection)
const fallbackBrands: Brand[] = [
  {
    id: 1,
    name: "BMW",
    logo: "/images/products/bmw.png",
    description: "Niemiecka marka sportowa"
  },
  {
    id: 2,
    name: "Mercedes",
    logo: "/images/products/mercedes.jpg",
    description: "Niemiecka marka luksusowa"
  },
  {
    id: 3,
    name: "Audi",
    logo: "/images/products/audi.jpg",
    description: "Niemiecka marka premium"
  },
  {
    id: 4,
    name: "Tesla",
    logo: "/images/products/tesla.avif",
    description: "Amerykańska marka elektryczna"
  },
  {
    id: 5,
    name: "Porsche",
    logo: "/images/products/porsche.png",
    description: "Niemiecka marka sportowa"
  }
];

export default function BrandSelectionGrid() {
  const router = useRouter();
  const [clickedBrandId, setClickedBrandId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Użyj React Query do cache'owania marek (ten sam queryKey co ProductSelection)
  const { data: brands = fallbackBrands, isLoading: loading, error } = useQuery({
    queryKey: ['car-brands'],
    queryFn: fetchBrands,
    staleTime: 10 * 60 * 1000, // 10 minut
    gcTime: 30 * 60 * 1000, // 30 minut cache
    retry: 2,
    retryDelay: 1000,
  });

  // Filtrowanie marek na podstawie wyszukiwania
  const filteredBrands = useMemo(() => {
    if (!searchQuery.trim()) {
      return brands;
    }
    
    const query = searchQuery.toLowerCase().trim();
    return brands.filter(brand => 
      brand.name.toLowerCase().includes(query) ||
      brand.description?.toLowerCase().includes(query)
    );
  }, [brands, searchQuery]);

  const handleBrandClick = useCallback((brand: Brand) => {
    setClickedBrandId(brand.id);
    
    // Animacja kliknięcia - reset po 300ms
    setTimeout(() => {
      setClickedBrandId(null);
      // Tymczasowe przekierowanie do konfiguratora (do czasu implementacji kart produktów)
      const brandSlug = brand.name.toLowerCase();
      router.push(`/konfigurator?brand=${encodeURIComponent(brandSlug)}`);
    }, 300);
  }, [router]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);


  if (loading) {
    return (
      <section id="brand-selection" className="bg-neutral-950 py-16 md:py-24 relative overflow-hidden min-h-screen flex items-center justify-center">
        {/* Animowane tło z gradientem */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black to-red-800/10"></div>
        
        {/* Animowane cząsteczki */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-2 h-2 bg-red-500 rounded-full animate-float-hover"></div>
          <div className="absolute top-40 right-20 w-1 h-1 bg-red-400 rounded-full animate-float-hover" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 left-1/4 w-1.5 h-1.5 bg-red-300 rounded-full animate-float-hover" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-40 right-1/3 w-1 h-1 bg-red-600 rounded-full animate-float-hover" style={{animationDelay: '0.5s'}}></div>
        </div>

        <div className="w-full max-w-7xl mx-auto px-4 text-center relative z-10">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="w-12 h-12 text-red-500 animate-spin mb-4" />
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Wybierz Markę Samochodu
            </h2>
            <p className="text-gray-300 text-xl">
              Ładowanie dostępnych marek...
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      id="brand-selection" 
      className="bg-neutral-950 py-16 md:py-24 relative overflow-hidden min-h-screen"
    >
      {/* Animowane tło z gradientem */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black to-red-800/10"></div>
      
      {/* Animowane cząsteczki */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-2 h-2 bg-red-500 rounded-full animate-float-hover"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-red-400 rounded-full animate-float-hover" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-1.5 h-1.5 bg-red-300 rounded-full animate-float-hover" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 right-1/3 w-1 h-1 bg-red-600 rounded-full animate-float-hover" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-60 left-1/3 w-1 h-1 bg-red-500 rounded-full animate-float-hover" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute bottom-60 right-1/4 w-1.5 h-1.5 bg-red-600 rounded-full animate-float-hover" style={{animationDelay: '0.8s'}}></div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative z-10">
        {/* Input wyszukiwania */}
        <div className="text-center mb-12 md:mb-16">
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
              <Input
                type="text"
                placeholder="Szukaj marki..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="
                  pl-12 pr-12
                  h-14
                  bg-gray-900/80 backdrop-blur-xl
                  border-gray-700/50
                  text-white
                  placeholder:text-gray-400
                  focus:border-red-500/70 focus:ring-2 focus:ring-red-500/30
                  rounded-xl
                  text-base
                  transition-all duration-300
                "
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors z-10"
                  aria-label="Wyczyść wyszukiwanie"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="text-sm text-gray-400 mt-3 text-center">
                Znaleziono: <span className="text-red-400 font-semibold">{filteredBrands.length}</span> {filteredBrands.length === 1 ? 'markę' : 'marek'}
              </p>
            )}
          </div>

          {error && (
            <p className="text-yellow-400 text-sm mt-2">
              ⚠️ Używamy ograniczonych danych (API tymczasowo niedostępne)
            </p>
          )}
          
          {/* Komunikat gdy brak wyników */}
          {searchQuery && filteredBrands.length === 0 && (
            <div className="text-center py-12 animate-fade-in">
              <p className="text-gray-400 text-lg mb-2">Nie znaleziono marek pasujących do wyszukiwania</p>
              <p className="text-gray-500 text-sm">Spróbuj wpisać inną nazwę marki</p>
            </div>
          )}
        </div>

        {/* Grid z kartami marek */}
        {!searchQuery || filteredBrands.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {filteredBrands.map((brand, index) => (
              <div
                key={brand.id}
                className="animate-fade-in"
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <BrandGridCard
                  brand={brand}
                  onClick={handleBrandClick}
                  isClicked={clickedBrandId === brand.id}
                  className="touch-target"
                  isPriority={index < 4}
                />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

