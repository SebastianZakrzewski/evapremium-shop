"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageCarousel from './ImageCarousel';
import { BrandCard } from './ui/BrandCard';
import { brands } from '../data/carouselData';
import { Brand } from '../types/carousel';
import { Car, Search, Filter } from 'lucide-react';

export default function ProductSelection() {
  const router = useRouter();
  const [clickedCardId, setClickedCardId] = useState<number | null>(null);

  const handleBrandClick = (brand: Brand) => {
    setClickedCardId(brand.id);
    
    // Animacja kliknięcia - reset po 300ms
    setTimeout(() => {
      setClickedCardId(null);
      // Przekierowanie do konfiguratora zamiast do strony modeli
      router.push('/konfigurator');
    }, 300);
  };

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
              🚗 BMW, Mercedes, Audi, Porsche, Tesla, Acura, Alfa Romeo, Aston Martin, BAIC, Bentley, Bugatti, Buick, Cadillac i inne
            </span>
          </div>
        </div>

        {/* Karuzela */}
        <div className="animate-slide-in-left">
          <ImageCarousel<Brand>
            items={brands}
            onItemClick={handleBrandClick}
            renderItem={(brand, index, position) => (
              <BrandCard 
                key={brand.id} 
                brand={brand} 
                className={`${position} ${clickedCardId === brand.id ? 'animate-click' : ''}`}
              />
            )}
          />
        </div>

        {/* Informacje dodatkowe */}
        <div className="mt-12 text-center animate-fade-in-delay-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-lg p-6 border border-gray-700 hover:border-red-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/10">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Precyzyjne Dopasowanie</h3>
              <p className="text-gray-400 text-sm">Każdy dywanik samochodowy jest precyzyjnie dopasowany do konkretnego modelu auta - BMW, Mercedes, Audi, Porsche, Tesla, Acura, Alfa Romeo, Aston Martin, BAIC, Bentley, Bugatti, Buick, Cadillac</p>
            </div>
            
            <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-lg p-6 border border-gray-700 hover:border-red-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/10">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Materiał EVA Premium</h3>
              <p className="text-gray-400 text-sm">Dywaniki samochodowe z materiału EVA najwyższej jakości - wodoodporne, odporne na wilgoć i łatwe w czyszczeniu</p>
            </div>
            
            <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-lg p-6 border border-gray-700 hover:border-red-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/10">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Darmowa Dostawa 24h</h3>
              <p className="text-gray-400 text-sm">Darmowa dostawa dywaników samochodowych w ciągu 24-48h w całej Polsce. Gwarancja 2 lata na wszystkie produkty</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 