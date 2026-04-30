"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import ImageCarousel from '../ImageCarousel';
import { BrandCard } from '../ui/BrandCard';
import { Brand } from '@/entities/car';
import { Car, Loader2 } from 'lucide-react';
import { useBrands } from "@/features/brands/hooks/useBrands";

export default function ProductSelection() {
  const router = useRouter();
  const [clickedCardId, setClickedCardId] = useState<number | null>(null);

  // Użyj hooka useBrands do pobierania marek
  const { brands, isLoading: loading, error } = useBrands();

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
      <section id="products" className="bg-black py-20 md:py-32 flex items-center justify-center min-h-[60vh] relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-900/10 blur-[120px] rounded-full pointer-events-none" aria-hidden="true"></div>

        <div className="w-full max-w-7xl mx-auto px-4 text-center relative z-10">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-red-500 animate-spin mb-8" />
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Popularne Marki Samochodów
            </h2>
            <p className="text-gray-400 text-lg font-light">
              Ładowanie dostępnych marek...
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="products" className="bg-black py-20 md:py-32 flex items-center justify-center relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-red-900/10 blur-[120px] rounded-full pointer-events-none" aria-hidden="true"></div>

      <div className="w-full max-w-7xl mx-auto px-4 relative z-10">
        {/* Nagłówek sekcji */}
        <div className="text-center mb-16 md:mb-24">
          <div className="inline-flex items-center justify-center p-3 bg-white/5 rounded-2xl mb-6 border border-white/10 shadow-xl animate-bounce-in">
            <Car className="w-6 h-6 text-red-500" />
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight animate-fade-in leading-[1.1]">
            Wybierz markę <br className="md:hidden" />
            <span className="bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent">
              Twojego auta
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-light animate-fade-in-delay leading-relaxed">
            Znajdź precyzyjnie dopasowane dywaniki samochodowe EVA Premium do swojego modelu.
          </p>
          <div className="mt-8 animate-fade-in-delay-2">
            <span className="inline-flex items-center gap-2 bg-white/5 px-5 py-2.5 rounded-full border border-white/10 text-sm font-medium text-gray-300 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Dostępne marki: {brands.length} producentów
            </span>
          </div>
          {error && (
            <p className="text-yellow-500/80 text-sm mt-4 font-medium">
              ⚠️ Używamy ograniczonych danych (API tymczasowo niedostępne)
            </p>
          )}
        </div>

        {/* Karuzela */}
        <div className="animate-slide-in-left relative">
          {/* Subtle vignette for carousel edges */}
          <div className="absolute inset-y-0 left-0 w-12 md:w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none"></div>
          <div className="absolute inset-y-0 right-0 w-12 md:w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none"></div>

          <ImageCarousel<Brand>
            items={brands}
            onItemClick={handleBrandClick}
            renderItem={(brand, index, position) => (
              <BrandCard 
                brand={brand} 
                className={`${position} ${clickedCardId === brand.id ? 'animate-click' : ''} transition-all duration-500`}
                isPriority={index < 3 && position === 'center'}
              />
            )}
          />
        </div>
      </div>
    </section>
  );
} 
