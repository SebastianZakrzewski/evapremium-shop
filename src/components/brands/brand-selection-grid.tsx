"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { BrandGridCard } from "../ui/BrandGridCard";
import { Brand } from "@/entities/car";
import { Loader2, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useBrands } from "@/features/brands/hooks/useBrands";

export default function BrandSelectionGrid() {
  const router = useRouter();
  const [clickedBrandId, setClickedBrandId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Użyj hooka useBrands do pobierania marek
  const { brands, isLoading: loading, error } = useBrands();

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
      // Przekierowanie do sekcji produktów (tak jak w karuzeli marek)
      router.push(`/modele?brand=${encodeURIComponent(brand.name.toLowerCase())}`);
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
      <section id="brand-selection" className="bg-black py-16 md:py-24 relative overflow-hidden min-h-screen flex items-center justify-center">
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
      className="bg-black py-16 md:py-24 relative overflow-hidden min-h-screen"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative z-10">
        {/* Input wyszukiwania */}
        <div className="text-center mb-12 md:mb-16">
          <div className="max-w-md mx-auto">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10 group-focus-within:text-red-500 transition-colors" />
              <Input
                type="text"
                placeholder="Szukaj marki..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="
                  pl-12 pr-12
                  h-14
                  bg-[#0a0a0a]
                  border-white/10
                  text-white
                  placeholder:text-gray-400
                  focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20
                  rounded-full
                  text-base
                  transition-all duration-300
                  shadow-xl
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
              <p className="text-gray-400 text-sm">Spróbuj wpisać inną nazwę marki</p>
            </div>
          )}
        </div>

        {/* Grid z kartami marek */}
        {!searchQuery || filteredBrands.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {filteredBrands.map((brand, index) => (
              <div
                key={brand.id}
                className="animate-fade-in"
                style={{
                  animationDelay: `${index * 0.05}s`,
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
