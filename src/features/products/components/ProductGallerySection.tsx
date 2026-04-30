"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
    src: "/galeria/photo_2025-04-25_16.57.33.webp",
    alt: "Dywaniki samochodowe EVA - widok z góry",
    title: "Dywaniki EVA - Widok Premium",
    description: "Precyzyjnie dopasowane dywaniki EVA z doskonałym wykończeniem"
  },
  {
    id: 3,
    src: "/galeria/photo_2025-04-25_16.57.37.webp",
    alt: "Dywaniki samochodowe EVA - detal",
    title: "Dywaniki EVA - Detal",
    description: "Szczegółowe wykończenie dywaników EVA Premium"
  },
  {
    id: 4,
    src: "/galeria/photo_2025-04-25_16.57.43.jpg",
    alt: "Dywaniki samochodowe EVA - montaż",
    title: "Dywaniki EVA - Montaż",
    description: "Łatwy montaż dywaników EVA do każdego modelu samochodu"
  },
  {
    id: 5,
    src: "/galeria/photo_2025-04-25_17.04.39.webp",
    alt: "Dywaniki samochodowe EVA - gotowy produkt",
    title: "Dywaniki EVA - Gotowy Produkt",
    description: "Gotowe do montażu dywaników EVA Premium"
  },
  {
    id: 6,
    src: "/galeria/photo_2025-04-25_17.08.33.webp",
    alt: "Dywaniki samochodowe EVA - różne kolory",
    title: "Dywaniki EVA - Różne Kolory",
    description: "Szeroka gama kolorów dywaników EVA Premium"
  },
  {
    id: 7,
    src: "/galeria/photo_2025-04-25_17.08.35.webp",
    alt: "Dywaniki samochodowe EVA - struktura",
    title: "Dywaniki EVA - Struktura",
    description: "Głęboka struktura komórek zapewnia doskonałą ochronę"
  },
  {
    id: 8,
    src: "/galeria/photo_2025-04-25_17.08.38.webp",
    alt: "Dywaniki samochodowe EVA - wykończenie",
    title: "Dywaniki EVA - Wykończenie",
    description: "Precyzyjne wykończenie brzegów dywaników EVA"
  },
  {
    id: 9,
    src: "/galeria/photo_2025-04-25_17.08.44.webp",
    alt: "Dywaniki samochodowe EVA - jakość",
    title: "Dywaniki EVA - Jakość",
    description: "Najwyższa jakość materiału EVA Premium"
  },
  {
    id: 10,
    src: "/galeria/photo_2025-04-25_17.10.11.webp",
    alt: "Dywaniki samochodowe EVA - komplet",
    title: "Dywaniki EVA - Komplet",
    description: "Kompletny zestaw dywaników EVA do samochodu"
  },
  {
    id: 11,
    src: "/galeria/photo_2025-04-25_17.10.12.webp",
    alt: "Dywaniki samochodowe EVA - montaż w aucie",
    title: "Dywaniki EVA - Montaż w Aucie",
    description: "Doskonale dopasowane dywaniki EVA w samochodzie"
  },
  {
    id: 12,
    src: "/galeria/photo_2025-04-25_17.12.45.webp",
    alt: "Dywaniki samochodowe EVA - różne modele",
    title: "Dywaniki EVA - Różne Modele",
    description: "Dywaniki EVA dopasowane do różnych modeli samochodów"
  },
  {
    id: 13,
    src: "/galeria/photo_2025-04-25_17.12.47.webp",
    alt: "Dywaniki samochodowe EVA - porównanie",
    title: "Dywaniki EVA - Porównanie",
    description: "Porównanie dywaników EVA z tradycyjnymi dywanikami"
  },
  {
    id: 14,
    src: "/galeria/photo_2025-04-25_17.12.48.webp",
    alt: "Dywaniki samochodowe EVA - zestaw",
    title: "Dywaniki EVA - Zestaw",
    description: "Kompletny zestaw dywaników EVA Premium"
  },
  {
    id: 15,
    src: "/galeria/IMG_8951.JPG",
    alt: "Dywaniki samochodowe EVA - profesjonalny montaż",
    title: "Dywaniki EVA - Profesjonalny Montaż",
    description: "Profesjonalny montaż dywaników EVA w warsztacie"
  },
  {
    id: 16,
    src: "/galeria/IMG_8956.JPG",
    alt: "Dywaniki samochodowe EVA - różne modele samochodów",
    title: "Dywaniki EVA - Różne Modele",
    description: "Dywaniki EVA dopasowane do różnych modeli samochodów"
  },
  {
    id: 17,
    src: "/galeria/IMAGE 2023-09-11 12_29_54.jpg",
    alt: "Dywaniki samochodowe EVA - montaż w aucie",
    title: "Dywaniki EVA - Montaż w Aucie",
    description: "Doskonale dopasowane dywaniki EVA w samochodzie"
  },
  {
    id: 18,
    src: "/galeria/IMAGE 2023-09-11 12_30_05.jpg",
    alt: "Dywaniki samochodowe EVA - różne kolory",
    title: "Dywaniki EVA - Różne Kolory",
    description: "Szeroka gama kolorów dywaników EVA Premium"
  },
  {
    id: 19,
    src: "/galeria/20240719_093045.jpg",
    alt: "Dywaniki samochodowe EVA - jakość materiału",
    title: "Dywaniki EVA - Jakość Materiału",
    description: "Najwyższa jakość materiału EVA Premium"
  },
  {
    id: 20,
    src: "/galeria/kosc_sloniowa.jpg",
    alt: "Dywaniki samochodowe EVA - kolor kość słoniowa",
    title: "Dywaniki EVA - Kość Słoniowa",
    description: "Elegancki kolor kość słoniowa dywaników EVA"
  },
  {
    id: 21,
    src: "/galeria/photo_2025-04-25_16.57.46 (1).webp",
    alt: "Dywaniki samochodowe EVA - struktura komórek",
    title: "Dywaniki EVA - Struktura Komórek",
    description: "Głęboka struktura komórek zapewnia doskonałą ochronę"
  },
  {
    id: 22,
    src: "/galeria/photo_2025-04-25_17.12.48 (1).webp",
    alt: "Dywaniki samochodowe EVA - zestaw premium",
    title: "Dywaniki EVA - Zestaw Premium",
    description: "Kompletny zestaw dywaników EVA Premium"
  },
  {
    id: 23,
    src: "/galeria/photo_2025-04-25_17.avif",
    alt: "Dywaniki samochodowe EVA - nowoczesny design",
    title: "Dywaniki EVA - Nowoczesny Design",
    description: "Nowoczesny design dywaników EVA Premium"
  },
  {
    id: 24,
    src: "/galeria/Zdjęcie WhatsApp 2024-07-04 o 12.55.09_e0e51424.jpg",
    alt: "Dywaniki samochodowe EVA - montaż w warsztacie",
    title: "Dywaniki EVA - Montaż w Warsztacie",
    description: "Profesjonalny montaż dywaników EVA w warsztacie"
  },
  {
    id: 25,
    src: "/galeria/Zdjęcie WhatsApp 2024-07-04 o 12.55.10_17f09e33.jpg",
    alt: "Dywaniki samochodowe EVA - różne rozmiary",
    title: "Dywaniki EVA - Różne Rozmiary",
    description: "Dywaniki EVA w różnych rozmiarach do każdego samochodu"
  },
  {
    id: 26,
    src: "/galeria/Zdjęcie WhatsApp 2024-07-04 o 12.55.10_6ddf48d0.jpg",
    alt: "Dywaniki samochodowe EVA - wykończenie brzegów",
    title: "Dywaniki EVA - Wykończenie Brzegów",
    description: "Precyzyjne wykończenie brzegów dywaników EVA"
  },
  {
    id: 27,
    src: "/galeria/Zdjęcie WhatsApp 2024-07-04 o 12.55.11_7814426b.jpg",
    alt: "Dywaniki samochodowe EVA - kompletny zestaw",
    title: "Dywaniki EVA - Kompletny Zestaw",
    description: "Kompletny zestaw dywaników EVA do samochodu"
  },
  {
    id: 28,
    src: "/galeria/0-04-0a-9ba010c9aff1b9cdca1865a72fc75ebf4d93819c25a86b3373ae05ddcad6f52f_52ef7a6d.jpg",
    alt: "Dywaniki samochodowe EVA - profesjonalna jakość",
    title: "Dywaniki EVA - Profesjonalna Jakość",
    description: "Profesjonalna jakość dywaników EVA Premium"
  },
  {
    id: 29,
    src: "/galeria/photo_2025-09-26_12-01-31 (2).jpg",
    alt: "Dywaniki samochodowe EVA - nowa kolekcja",
    title: "Dywaniki EVA - Nowa Kolekcja",
    description: "Najnowsze modele dywaników EVA Premium"
  },
  {
    id: 30,
    src: "/galeria/photo_2025-09-26_12-01-32.jpg",
    alt: "Dywaniki samochodowe EVA - premium quality",
    title: "Dywaniki EVA - Premium Quality",
    description: "Najwyższa jakość wykonania dywaników EVA"
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
    <div key={`${setKey}-${index}`} className="flex-shrink-0 w-80 h-64 sm:w-96 sm:h-80 mx-3 group relative">
      <div 
        className="
          relative h-full rounded-3xl overflow-hidden 
          bg-white/5 backdrop-blur-md border border-white/10 
          group-hover:border-red-500/30 
          transition-all duration-500 ease-out
          shadow-2xl shadow-black/50
          group-hover:shadow-red-900/20 group-hover:-translate-y-2 
          cursor-pointer
        "
        onClick={() => onImageClick(image)}
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          className="object-cover brightness-110 transition-transform duration-700 group-hover:scale-110 group-hover:brightness-125"
          sizes="(max-width: 768px) 320px, 384px"
          priority={isPriority}
          quality={85}
        />
        
        {/* Overlay z gradientem - spójny z BrandCard */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
        
        {/* Shine Effect - spójny z BrandCard */}
        <div className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
          <div className="absolute inset-0 transform -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
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
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!selectedImage) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4 md:p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative max-w-5xl max-h-[90vh] w-full h-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Przycisk zamknięcia - touch target min 44px */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 z-10 text-white hover:text-red-500 transition-colors duration-200 p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-white/10"
          aria-label="Zamknij podgląd obrazu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Kontener obrazu */}
        <div className="relative flex-1 rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10">
          <Image
            src={selectedImage.src}
            alt={selectedImage.alt}
            fill
            className="object-contain"
            sizes="(max-width: 1200px) 100vw, 1200px"
            quality={100}
            priority
          />
        </div>

        {/* Informacje o produkcie */}
        <div className="mt-6 bg-black border border-white/10 rounded-xl p-6 backdrop-blur-md">
          <h3 className="text-2xl font-bold text-white mb-2">
            {selectedImage.title}
          </h3>
          <p className="text-gray-400">
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
  const [isPaused, setIsPaused] = useState(false);
  const [carouselOffset, setCarouselOffset] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.querySelector('[data-section="product-gallery"]');
    if (section) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, []);

  // Zoptymalizowane funkcje z useCallback
  const openModal = useCallback((image: ProductImage) => {
    setSelectedImage(image);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedImage(null);
  }, []);

  // Funkcje nawigacji karuzeli - używają stanu zamiast manipulacji DOM
  const goToPrevious = useCallback(() => {
    setIsPaused(true);
    setCarouselOffset(prev => prev + 400); // Zmieniono na +400 dla lewej strzałki
    // Wznów animację po 2 sekundach
    setTimeout(() => setIsPaused(false), 2000);
  }, []);

  const goToNext = useCallback(() => {
    setIsPaused(true);
    setCarouselOffset(prev => prev - 400); // Zmieniono na -400 dla prawej strzałki
    // Wznów animację po 2 sekundach
    setTimeout(() => setIsPaused(false), 2000);
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

  return (
    <section
      id="product-gallery"
      data-section="product-gallery"
      className="w-full bg-black py-20 md:py-24 relative overflow-hidden"
      role="region"
      aria-label="Galeria produktów - zdjęcia dywaników samochodowych EVA Premium"
    >
      {/* Gradient line top - spójność z Hero/QuickSearchBar */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent z-10" aria-hidden="true" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header - spójny z QuickSearchBar */}
        <div className={`text-center mb-12 md:mb-16 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 md:mb-6 leading-tight break-words px-2 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{transitionDelay: isVisible ? '200ms' : '0ms'}}>
            Nasza galeria <span className="text-red-500">produktów</span>
          </h2>
          <p className={`text-sm sm:text-base md:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed px-2 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{transitionDelay: isVisible ? '400ms' : '0ms'}}>
            Odkryj jakość i precyzję wykonania naszych dywaników. Każdy detal ma znaczenie.
          </p>
        </div>
      </div>

      {/* Kontener galerii - pełna szerokość */}
      <div className="w-full overflow-hidden relative z-10 mt-8">
        {/* Strzałka w lewo - touch target min 44px, spójność z Hero */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white p-3 md:p-4 rounded-full transition-all duration-300 min-w-[44px] min-h-[44px] flex items-center justify-center group"
          aria-label="Przewiń galerię w lewo"
        >
          <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>

        {/* Strzałka w prawo */}
        <button
          onClick={goToNext}
          className="absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white p-3 md:p-4 rounded-full transition-all duration-300 min-w-[44px] min-h-[44px] flex items-center justify-center group"
          aria-label="Przewiń galerię w prawo"
        >
          <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>

        {/* Główny kontener z automatyczną animacją */}
        <div className="carousel-container overflow-hidden py-10">
          <motion.div 
            className="flex carousel-motion"
            style={{ width: 'max-content' }}
            animate={isPaused ? {
              x: carouselOffset
            } : {
              x: [carouselOffset, carouselOffset - 1500]
            }}
            transition={isPaused ? {
              x: {
                duration: 0.5,
                ease: "easeOut"
              }
            } : {
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 60,
                ease: "linear"
              }
            }}
          >
            {imageSets}
          </motion.div>
        </div>
      </div>

      {/* Modal dla powiększonego obrazu */}
      <AnimatePresence>
        <ImageModal selectedImage={selectedImage} onClose={closeModal} />
      </AnimatePresence>

      {/* Call to Action - spójny z Hero i QuickSearchBar */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 mt-12 text-center">
        <Link 
          href="/dywaniki"
          className="inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-4 text-sm md:text-base font-bold text-white transition-all duration-300 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-full shadow-xl shadow-red-900/30 hover:scale-105 hover:shadow-2xl hover:shadow-red-600/20 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-neutral-950 min-h-[44px]"
          aria-label="Sprawdź dostępność dywaników dla Twojego auta"
        >
          Sprawdź Dostępność Dla Twojego Auta
        </Link>
      </div>
    </section>
  );
}
