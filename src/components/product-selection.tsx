"use client";

import ImageCarousel from './ImageCarousel';
import { BrandCard } from './ui/BrandCard';
import { brands } from '../data/carouselData';
import { Brand } from '../types/carousel';

export default function ProductSelection() {
  return (
    <section id="products" className="bg-black min-h-screen flex items-center justify-center">
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Wybierz Markę
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Wybierz markę auta do którego chcesz spersonalizować dywaniki
          </p>
        </div>
        
        <ImageCarousel<Brand>
          items={brands}
          onItemClick={(brand) => {
            console.log(`Wybrano markę: ${brand.name}`);
            // Tutaj możesz dodać logikę przejścia do modeli
          }}
          renderItem={(brand, index, position) => (
            <BrandCard 
              key={brand.id} 
              brand={brand} 
              className={position}
            />
          )}
        />
      </div>
    </section>
  );
} 