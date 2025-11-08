"use client";

import React, { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import ImageCarousel from './ImageCarousel';
import { BrandCard } from './ui/BrandCard';
import { Brand } from '../types/carousel';
import { Car, Loader2 } from 'lucide-react';

// Fetch function dla React Query
const fetchBrands = async (): Promise<Brand[]> => {
  const response = await fetch('/api/car-brands');
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// Fallback brands
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

export default function ProductSelection() {
  const [clickedCardId, setClickedCardId] = useState<number | null>(null);

  // Użyj React Query do cache'owania brandów
  const { data: brands = fallbackBrands, isLoading: loading, error } = useQuery({
    queryKey: ['car-brands'],
    queryFn: fetchBrands,
    staleTime: 10 * 60 * 1000, // 10 minut
    gcTime: 30 * 60 * 1000, // 30 minut cache
    retry: 2,
    retryDelay: 1000,
  });

  const handleBrandClick = useCallback((brand: Brand) => {
    setClickedCardId(brand.id);
    
    // Animacja kliknięcia - reset po 300ms
    setTimeout(() => {
      setClickedCardId(null);
      // Przekierowanie do konfiguratora z parametrem marki
      window.location.href = `/konfigurator?brand=${encodeURIComponent(brand.name.toLowerCase())}`;
    }, 300);
  }, []);

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
          <div className="mt-6 text-sm text-gray-400 animate-fade-in-delay-2">
            <span className="bg-gray-800/50 px-4 py-2 rounded-full border border-gray-700">
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