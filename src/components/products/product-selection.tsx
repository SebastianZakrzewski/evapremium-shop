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
      <section id="products" className="bg-black py-8 md:py-12 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-7xl mx-auto px-4 text-center">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="w-12 h-12 text-red-500 animate-spin mb-4" />
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Popularne Marki Samochodów
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
    <section id="products" className="bg-black py-8 md:py-12 flex items-center justify-center min-h-screen">
      <div className="w-full max-w-7xl mx-auto px-4">
        {/* Nagłówek sekcji */}
        <div className="text-center mb-6 md:mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-full mb-6 animate-bounce-in">
            <Car className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 animate-fade-in">
            Popularne Marki Samochodów
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto animate-fade-in-delay">
            Wybierz markę swojego auta i znajdź precyzyjnie dopasowane dywaniki samochodowe EVA Premium
          </p>
          <div className="mt-6 text-xs md:text-sm text-gray-400 animate-fade-in-delay-2 px-4">
            <span className="bg-white/5/50 px-3 py-2 md:px-4 md:py-2 rounded-full border border-white/5 inline-block max-w-full md:max-w-none whitespace-normal break-words text-center leading-relaxed">
              🚗 Dostępne marki: {brands.length} producentów samochodów
            </span>
          </div>
          {error && (
            <p className="text-yellow-400 text-sm mt-2">
              ⚠️ Używamy ograniczonych danych (API tymczasowo niedostępne)
            </p>
          )}
        </div>

        {/* Karuzela */}
        <div className="animate-slide-in-left">
          <ImageCarousel<Brand>
            items={brands}
            onItemClick={handleBrandClick}
            renderItem={(brand, index, position) => (
              <BrandCard 
                brand={brand} 
                className={`${position} ${clickedCardId === brand.id ? 'animate-click' : ''}`}
                isPriority={index < 3 && position === 'center'} // Priority tylko dla pierwszych 3 widocznych na środku
              />
            )}
          />
        </div>

      </div>
    </section>
  );
} 
