"use client";

import ImageCarousel from './ImageCarousel';

// Kolory dla placeholderów
const productColors = [
  "ff6b6b", // czerwony
  "4ecdc4", // turkusowy
  "45b7d1", // niebieski
  "96ceb4", // zielony
  "feca57"  // żółty
];

export default function ProductSelection() {
  return (
    <section className="bg-black min-h-screen flex items-center justify-center">
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Wybierz Swój Styl
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Odkryj naszą kolekcję ekskluzywnych projektów i znajdź coś wyjątkowego dla siebie
          </p>
        </div>
        
        <ImageCarousel images={productColors} />
      </div>
    </section>
  );
} 