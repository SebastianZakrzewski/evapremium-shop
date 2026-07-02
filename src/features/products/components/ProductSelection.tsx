"use client"

import React, { useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import BrandsScrollingCarousel from "@/components/brands/BrandsScrollingCarousel"
import { Brand } from "@/entities/car"
import { Loader2, Search } from "lucide-react"
import { useBrands } from "@/features/brands/hooks/useBrands"

export default function ProductSelection() {
  const router = useRouter()
  const [clickedCardId, setClickedCardId] = useState<number | null>(null)
  const [search, setSearch] = useState("")

  const { brands, isLoading: loading, error } = useBrands()

  const filteredBrands = useMemo(() => {
    let result = brands.filter(brand => {
      const isImage = brand.logo.includes('.jpg') || 
                      brand.logo.includes('.png') || 
                      brand.logo.includes('.jpeg') || 
                      brand.logo.includes('.avif') || 
                      brand.logo.includes('.webp');
      const isExcluded = ['asia', 'bestune', 'chery'].includes(brand.name.toLowerCase());
      return isImage && !isExcluded;
    });

    if (!search.trim()) return result;
    const term = search.toLowerCase().trim();
    return result.filter((b) => b.name.toLowerCase().includes(term));
  }, [brands, search])

  const handleBrandClick = useCallback((brand: Brand) => {
    setClickedCardId(brand.id);
    
    // Animacja kliknięcia - reset po 300ms
    setTimeout(() => {
      setClickedCardId(null);
      
      // Przekierowanie do strony z produktami modeli dla danej marki
      const brandSlug = brand.name.toLowerCase();
      router.push(`/modele/${encodeURIComponent(brandSlug)}`);
    }, 300);
  }, [router]);

  if (loading) {
    return (
      <section
        id="products"
        className="w-full bg-black py-10 md:py-14 flex items-center justify-center relative"
        role="region"
        aria-label="Popularne marki samochodów - ładowanie"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <Loader2 className="w-12 h-12 text-red-500 animate-spin mb-4" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Popularne marki <span className="text-red-500">samochodów</span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-400">
              Ładowanie dostępnych marek...
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      id="products"
      className="w-full bg-black py-20 md:py-24 relative"
      role="region"
      aria-label="Popularne marki samochodów - wybierz markę i znajdź dywaniki"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Nagłówek sekcji - spójny z QuickSearchBar, ProductGallery, AdvantagesSection */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 md:mb-6 leading-tight break-words px-2">
            Popularne marki <span className="text-red-500">samochodów</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed px-2">
            Wybierz markę swojego auta i znajdź precyzyjnie dopasowane dywaniki samochodowe EVA Premium
          </p>
          <div className="mt-6 text-xs md:text-sm text-gray-400 px-4">
            <span className="bg-white/5 backdrop-blur-md border border-white/10 px-3 py-2 md:px-4 md:py-2 rounded-full inline-block max-w-full md:max-w-none whitespace-normal break-words text-center leading-relaxed">
              Dostępne marki: {brands.length} producentów samochodów
            </span>
          </div>
          {error && (
            <p className="text-yellow-400 text-sm mt-2">
              ⚠️ Używamy ograniczonych danych (API tymczasowo niedostępne)
            </p>
          )}
        </div>

        {/* Wyszukiwarka marek */}
        <div className="relative mb-6 w-full max-w-xs mx-auto">
          <input
            type="text"
            placeholder="Szukaj marki..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-10 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-all"
            aria-label="Szukaj marki samochodu"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>

        {/* Siatka marek — ten sam układ na mobile i desktop */}
        {filteredBrands.length > 0 ? (
          <BrandsScrollingCarousel
            brands={filteredBrands}
            onBrandClick={handleBrandClick}
            clickedCardId={clickedCardId}
          />
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm md:text-base">Brak wyników dla &quot;{search}&quot;</p>
            <p className="text-xs mt-2">Spróbuj wpisać inną nazwę marki</p>
          </div>
        )}
      </div>
    </section>
  );
} 
