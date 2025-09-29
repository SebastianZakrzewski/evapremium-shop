"use client";

import React, { useState, useEffect } from "react";
import ImageCarousel from "./ImageCarousel";
import { BrandCard } from "./ui/BrandCard";
import { Brand } from "../types/carousel";
import { Car, Loader2 } from "lucide-react";

export default function PopularBrandsCarousel() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pobierz marki z API
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/car-brands');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setBrands(data);
        setError(null);
      } catch (err) {
        console.error('Błąd podczas pobierania marek:', err);
        setError('Nie udało się pobrać marek samochodów');
        
        // Fallback do statycznych danych
        setBrands([
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
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  // Handler dla kliknięcia w markę
  const handleBrandClick = (brand: Brand) => {
    // Przekieruj do strony z modelami danej marki
    window.location.href = `/modele?brand=${encodeURIComponent(brand.name)}`;
  };

  // Renderowanie karty marki
  const renderBrandCard = (brand: Brand, index: number, position: string) => {
    return (
      <BrandCard
        key={brand.id}
        brand={brand}
        className={`transition-all duration-700 ease-out ${
          position === 'center' 
            ? 'scale-100 opacity-100' 
            : position === 'left' || position === 'right'
            ? 'scale-95 opacity-90'
            : 'scale-90 opacity-70'
        }`}
      />
    );
  };

  if (loading) {
    return (
      <section className="py-20 bg-black relative overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="w-12 h-12 text-red-500 animate-spin mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Popularne Marki Samochodów
            </h2>
            <p className="text-gray-300 text-lg">
              Ładowanie dostępnych marek...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (error && brands.length === 0) {
    return (
      <section className="py-20 bg-black relative overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Car className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Popularne Marki Samochodów
            </h2>
            <p className="text-red-400 text-lg mb-4">
              {error}
            </p>
            <p className="text-gray-300">
              Spróbuj odświeżyć stronę lub skontaktuj się z nami.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-black relative overflow-hidden">
      {/* Tło z gradientem */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-black to-red-800/5"></div>
      
      {/* Nagłówek sekcji */}
      <div className="container mx-auto px-4 relative z-10 mb-12">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Popularne Marki <span className="text-red-500">Samochodów</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Wybierz markę swojego auta i odkryj nasze precyzyjnie dopasowane dywaniki samochodowe. 
            Oferujemy rozwiązania dla ponad {brands.length} marek samochodów.
          </p>
          {error && (
            <p className="text-yellow-400 text-sm mt-2">
              ⚠️ Używamy ograniczonych danych (API tymczasowo niedostępne)
            </p>
          )}
        </div>
      </div>

      {/* Carousel z markami */}
      <div className="relative z-10">
        <ImageCarousel
          items={brands}
          onItemClick={handleBrandClick}
          renderItem={renderBrandCard}
          className=""
        />
      </div>

      {/* Dodatkowe informacje */}
      <div className="container mx-auto px-4 relative z-10 mt-12">
        <div className="text-center">
          <p className="text-gray-400 text-sm">
            Kliknij na markę, aby zobaczyć dostępne modele i spersonalizować dywaniki
          </p>
        </div>
      </div>
    </section>
  );
}
