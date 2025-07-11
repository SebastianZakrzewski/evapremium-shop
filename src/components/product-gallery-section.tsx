"use client";
import React from "react";
import Image from "next/image";

interface ProductImage {
  id: number;
  src: string;
  alt: string;
  title: string;
  description: string;
}

const productImages: ProductImage[] = [
  {
    id: 1,
    src: "/images/products/audi.jpg",
    alt: "Dywaniki samochodowe Audi",
    title: "Dywaniki Audi Premium",
    description: "Precyzyjnie dopasowane dywaniki do modeli Audi"
  },
  {
    id: 2,
    src: "/images/products/bmw.png",
    alt: "Dywaniki samochodowe BMW",
    title: "Dywaniki BMW Premium",
    description: "Wodoodporne dywaniki do modeli BMW"
  },
  {
    id: 3,
    src: "/images/products/mercedes.jpg",
    alt: "Dywaniki samochodowe Mercedes",
    title: "Dywaniki Mercedes Premium",
    description: "Luksusowe dywaniki do modeli Mercedes"
  },
  {
    id: 4,
    src: "/images/products/tesla.avif",
    alt: "Dywaniki samochodowe Tesla",
    title: "Dywaniki Tesla Premium",
    description: "Nowoczesne dywaniki do modeli Tesla"
  },
  {
    id: 5,
    src: "/images/products/porsche.png",
    alt: "Dywaniki samochodowe Porsche",
    title: "Dywaniki Porsche Premium",
    description: "Sportowe dywaniki do modeli Porsche"
  },
  {
    id: 6,
    src: "/images/konfigurator/dywanik.jpg",
    alt: "Dywaniki samochodowe Premium",
    title: "Dywaniki Premium EVA",
    description: "Najwyższej jakości dywaniki EVA Premium"
  }
];

export default function ProductGallerySection() {
  return (
    <section className="py-20 bg-black relative overflow-hidden">
      {/* Animowane tło z gradientem */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-black to-red-800/5"></div>
      
      {/* Animowane cząsteczki tła */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-2 h-2 bg-red-500 rounded-full animate-float-hover"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-red-400 rounded-full animate-float-hover" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-1.5 h-1.5 bg-red-300 rounded-full animate-float-hover" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 right-1/3 w-1 h-1 bg-red-600 rounded-full animate-float-hover" style={{animationDelay: '0.5s'}}></div>
      </div>

      {/* Nagłówek sekcji - z kontenerem */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-full mb-6 animate-pulse-glow">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 bg-gradient-to-r from-white via-red-100 to-white bg-clip-text text-transparent">
            Nasze Produkty Premium
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Odkryj kolekcję najwyższej jakości dywaników samochodowych, 
            precyzyjnie dopasowanych do Twojego auta
          </p>
        </div>
      </div>

      {/* Kontener galerii - pełna szerokość */}
      <div className="w-full overflow-hidden relative z-10">
        {/* Główny kontener z CSS animation - pełna szerokość */}
        <div className="flex animate-scroll-left" style={{ width: 'max-content' }}>
          {/* Pierwszy zestaw obrazów */}
          {productImages.map((image, index) => (
            <div key={`first-${index}`} className="flex-shrink-0 w-96 h-80 mx-3">
              <div className="relative h-full rounded-2xl overflow-hidden group border-2 border-red-800/30 hover:border-red-500/50 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-red-500/20">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Overlay z gradientem */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Tekst na obrazie */}
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-2xl font-bold mb-3">
                    {image.title}
                  </h3>
                  <p className="text-base text-gray-200">
                    {image.description}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Drugi zestaw obrazów (dla płynnego loopu) */}
          {productImages.map((image, index) => (
            <div key={`second-${index}`} className="flex-shrink-0 w-96 h-80 mx-3">
              <div className="relative h-full rounded-2xl overflow-hidden group border-2 border-red-800/30 hover:border-red-500/50 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-red-500/20">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Overlay z gradientem */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Tekst na obrazie */}
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-2xl font-bold mb-3">
                    {image.title}
                  </h3>
                  <p className="text-base text-gray-200">
                    {image.description}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Trzeci zestaw obrazów (dla jeszcze płynniejszego loopu) */}
          {productImages.map((image, index) => (
            <div key={`third-${index}`} className="flex-shrink-0 w-96 h-80 mx-3">
              <div className="relative h-full rounded-2xl overflow-hidden group border-2 border-red-800/30 hover:border-red-500/50 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-red-500/20">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Overlay z gradientem */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Tekst na obrazie */}
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-2xl font-bold mb-3">
                    {image.title}
                  </h3>
                  <p className="text-base text-gray-200">
                    {image.description}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Czwarty zestaw obrazów (dla kompletnego loopu) */}
          {productImages.map((image, index) => (
            <div key={`fourth-${index}`} className="flex-shrink-0 w-96 h-80 mx-3">
              <div className="relative h-full rounded-2xl overflow-hidden group border-2 border-red-800/30 hover:border-red-500/50 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-red-500/20">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Overlay z gradientem */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Tekst na obrazie */}
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-2xl font-bold mb-3">
                    {image.title}
                  </h3>
                  <p className="text-base text-gray-200">
                    {image.description}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Piąty zestaw obrazów (dla jeszcze lepszego loopu) */}
          {productImages.map((image, index) => (
            <div key={`fifth-${index}`} className="flex-shrink-0 w-96 h-80 mx-3">
              <div className="relative h-full rounded-2xl overflow-hidden group border-2 border-red-800/30 hover:border-red-500/50 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-red-500/20">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Overlay z gradientem */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Tekst na obrazie */}
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-2xl font-bold mb-3">
                    {image.title}
                  </h3>
                  <p className="text-base text-gray-200">
                    {image.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action - z kontenerem */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mt-16">
          <button className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25">
            Zobacz Wszystkie Produkty
          </button>
        </div>
      </div>
    </section>
  );
} 