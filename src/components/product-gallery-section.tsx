"use client";
import React, { useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface ProductImage {
  id: number;
  src: string;
  alt: string;
  title: string;
  description: string;
}

// Przeniesienie danych poza komponent dla lepszej wydajności
const productImages: ProductImage[] = [
  {
    id: 1,
    src: "/galeria/photo_2024-10-21_16.32.33_1.jpg",
    alt: "Dywaniki samochodowe EVA Premium",
    title: "Dywaniki EVA Premium",
    description: "Najwyższej jakości dywaniki EVA do samochodów osobowych"
  },
  {
    id: 2,
    src: "/galeria/photo_2025-04-25_16.57.33 (1).webp",
    alt: "Dywaniki samochodowe EVA - widok z góry",
    title: "Dywaniki EVA - Widok Premium",
    description: "Precyzyjnie dopasowane dywaniki EVA z doskonałym wykończeniem"
  },
  {
    id: 3,
    src: "/galeria/photo_2025-04-25_17.05.47.webp",
    alt: "Dywaniki samochodowe EVA - detal",
    title: "Dywaniki EVA - Detal",
    description: "Szczegółowe wykończenie dywaników EVA Premium"
  },
  {
    id: 4,
    src: "/galeria/photo_2025-04-25_17.08.33.webp",
    alt: "Dywaniki samochodowe EVA - montaż",
    title: "Dywaniki EVA - Montaż",
    description: "Łatwy montaż dywaników EVA do każdego modelu samochodu"
  },
  {
    id: 5,
    src: "/galeria/photo_2025-04-25_17.08.40.webp",
    alt: "Dywaniki samochodowe EVA - gotowy produkt",
    title: "Dywaniki EVA - Gotowy Produkt",
    description: "Gotowe do montażu dywaniki EVA Premium"
  }
];

// Zoptymalizowany komponent obrazu z React.memo
const ProductImageCard = React.memo(({ 
  image, 
  index, 
  setKey, 
  onImageClick 
}: { 
  image: ProductImage; 
  index: number; 
  setKey: string; 
  onImageClick: (image: ProductImage) => void;
}) => {
  const isPriority = index < 3;
  
  return (
    <div key={`${setKey}-${index}`} className="flex-shrink-0 w-96 h-80 mx-3">
      <div 
        className="relative h-full rounded-2xl overflow-hidden group border-2 border-red-800/30 hover:border-red-500/50 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-red-500/20 cursor-pointer"
        onClick={() => onImageClick(image)}
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          sizes="(max-width: 768px) 384px 320px, 384px 320px"
          priority={isPriority}
          quality={85}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        />
        
        {/* Overlay z gradientem */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></div>
        
        {/* Tekst na obrazie */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out">
          <h3 className="text-2xl font-bold mb-3">
            {image.title}
          </h3>
          <p className="text-base text-gray-200">
            {image.description}
          </p>
        </div>
      </div>
    </div>
  );
});

ProductImageCard.displayName = 'ProductImageCard';

// Zoptymalizowany komponent modala
const ImageModal = React.memo(({ 
  selectedImage, 
  onClose 
}: { 
  selectedImage: ProductImage | null; 
  onClose: () => void;
}) => {
  if (!selectedImage) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative max-w-4xl max-h-[90vh] w-full h-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Przycisk zamknięcia */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 z-10 text-white hover:text-red-400 transition-colors duration-200"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Kontener obrazu */}
        <div className="relative w-full h-full rounded-2xl overflow-hidden">
          <Image
            src={selectedImage.src}
            alt={selectedImage.alt}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            quality={100}
            priority
          />
        </div>

        {/* Informacje o produkcie */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 text-white">
          <h3 className="text-2xl font-bold mb-2">
            {selectedImage.title}
          </h3>
          <p className="text-lg text-gray-200">
            {selectedImage.description}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
});

ImageModal.displayName = 'ImageModal';

export default function ProductGallerySection() {
  const [selectedImage, setSelectedImage] = useState<ProductImage | null>(null);

  // Zoptymalizowane funkcje z useCallback
  const openModal = useCallback((image: ProductImage) => {
    setSelectedImage(image);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedImage(null);
  }, []);

  // Zoptymalizowane zestawy obrazów z useMemo
  const imageSets = useMemo(() => {
    const sets = ['first', 'second', 'third', 'fourth', 'fifth'];
    return sets.map(setKey => 
      productImages.map((image, index) => (
        <ProductImageCard
          key={`${setKey}-${index}`}
          image={image}
          index={index}
          setKey={setKey}
          onImageClick={openModal}
        />
      ))
    );
  }, [openModal]);

  // Zoptymalizowane animowane cząsteczki
  const animatedParticles = useMemo(() => [
    { top: 'top-20', left: 'left-10', size: 'w-2 h-2', color: 'bg-red-500', delay: '0s' },
    { top: 'top-40', left: 'right-20', size: 'w-1 h-1', color: 'bg-red-400', delay: '1s' },
    { top: 'bottom-20', left: 'left-1/4', size: 'w-1.5 h-1.5', color: 'bg-red-300', delay: '2s' },
    { top: 'bottom-40', left: 'right-1/3', size: 'w-1 h-1', color: 'bg-red-600', delay: '0.5s' }
  ], []);

  return (
    <section className="py-20 bg-black relative overflow-hidden">
      {/* Animowane tło z gradientem */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-black to-red-800/5"></div>
      
      {/* Animowane cząsteczki tła */}
      <div className="absolute inset-0 opacity-20">
        {animatedParticles.map((particle, index) => (
          <div
            key={index}
            className={`absolute ${particle.top} ${particle.left} ${particle.size} ${particle.color} rounded-full animate-float-hover`}
            style={{animationDelay: particle.delay}}
          />
        ))}
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
        {/* Główny kontener z Framer Motion infinite loop */}
        <motion.div 
          className="flex"
          style={{ width: 'max-content' }}
          animate={{
            x: [0, -1500]
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 60,
              ease: "linear"
            }
          }}
        >
          {/* Zoptymalizowane zestawy obrazów */}
          {imageSets}
        </motion.div>
      </div>

      {/* Modal dla powiększonego obrazu */}
      <AnimatePresence>
        <ImageModal selectedImage={selectedImage} onClose={closeModal} />
      </AnimatePresence>

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