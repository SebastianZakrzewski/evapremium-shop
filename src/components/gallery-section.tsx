"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  title?: string;
}

const galleryImages: GalleryImage[] = [
  {
    id: 1,
    src: "/galeria/photo_2024-10-21_16.32.33_1.jpg",
    alt: "Dywaniki samochodowe EVA Premium",
    title: "Dywaniki EVA Premium"
  },
  {
    id: 2,
    src: "/galeria/photo_2025-04-25_16.57.33.webp",
    alt: "Dywaniki samochodowe EVA - widok z góry",
    title: "Widok Premium"
  },
  {
    id: 3,
    src: "/galeria/photo_2025-04-25_16.57.37.webp",
    alt: "Dywaniki samochodowe EVA - detal",
    title: "Szczegółowe wykończenie"
  },
  {
    id: 4,
    src: "/galeria/photo_2025-04-25_16.57.43.jpg",
    alt: "Dywaniki samochodowe EVA - montaż",
    title: "Łatwy montaż"
  },
  {
    id: 5,
    src: "/galeria/photo_2025-04-25_17.04.39.webp",
    alt: "Dywaniki samochodowe EVA - gotowy produkt",
    title: "Gotowy produkt"
  },
  {
    id: 6,
    src: "/galeria/photo_2025-04-25_17.08.33.webp",
    alt: "Dywaniki samochodowe EVA - różne kolory",
    title: "Różne kolory"
  },
  {
    id: 7,
    src: "/galeria/photo_2025-04-25_17.08.35.webp",
    alt: "Dywaniki samochodowe EVA - struktura",
    title: "Głęboka struktura"
  },
  {
    id: 8,
    src: "/galeria/photo_2025-04-25_17.08.38.webp",
    alt: "Dywaniki samochodowe EVA - wykończenie",
    title: "Precyzyjne wykończenie"
  },
  {
    id: 9,
    src: "/galeria/photo_2025-04-25_17.08.44.webp",
    alt: "Dywaniki samochodowe EVA - jakość",
    title: "Najwyższa jakość"
  },
  {
    id: 10,
    src: "/galeria/photo_2025-04-25_17.10.11.webp",
    alt: "Dywaniki samochodowe EVA - komplet",
    title: "Kompletny zestaw"
  },
  {
    id: 11,
    src: "/galeria/photo_2025-04-25_17.10.12.webp",
    alt: "Dywaniki samochodowe EVA - montaż w aucie",
    title: "Montaż w aucie"
  },
  {
    id: 12,
    src: "/galeria/photo_2025-04-25_17.12.45.webp",
    alt: "Dywaniki samochodowe EVA - różne modele",
    title: "Różne modele"
  },
  {
    id: 13,
    src: "/galeria/photo_2025-04-25_17.12.47.webp",
    alt: "Dywaniki samochodowe EVA - porównanie",
    title: "Porównanie"
  },
  {
    id: 14,
    src: "/galeria/photo_2025-04-25_17.12.48.webp",
    alt: "Dywaniki samochodowe EVA - zestaw",
    title: "Zestaw Premium"
  },
  {
    id: 15,
    src: "/galeria/IMG_8951.JPG",
    alt: "Dywaniki samochodowe EVA - profesjonalny montaż",
    title: "Profesjonalny montaż"
  },
  {
    id: 16,
    src: "/galeria/IMG_8956.JPG",
    alt: "Dywaniki samochodowe EVA - różne modele samochodów",
    title: "Różne modele samochodów"
  },
  {
    id: 17,
    src: "/galeria/IMAGE 2023-09-11 12_29_54.jpg",
    alt: "Dywaniki samochodowe EVA - montaż w aucie",
    title: "Doskonale dopasowane"
  },
  {
    id: 18,
    src: "/galeria/IMAGE 2023-09-11 12_30_05.jpg",
    alt: "Dywaniki samochodowe EVA - różne kolory",
    title: "Szeroka gama kolorów"
  },
  {
    id: 19,
    src: "/galeria/20240719_093045.jpg",
    alt: "Dywaniki samochodowe EVA - jakość materiału",
    title: "Jakość materiału"
  },
  {
    id: 20,
    src: "/galeria/kosc_sloniowa.jpg",
    alt: "Dywaniki samochodowe EVA - kolor kość słoniowa",
    title: "Kość słoniowa"
  },
  {
    id: 21,
    src: "/galeria/photo_2025-04-25_16.57.46 (1).webp",
    alt: "Dywaniki samochodowe EVA - struktura komórek",
    title: "Struktura komórek"
  },
  {
    id: 22,
    src: "/galeria/photo_2025-04-25_17.12.48 (1).webp",
    alt: "Dywaniki samochodowe EVA - zestaw premium",
    title: "Zestaw Premium"
  },
  {
    id: 23,
    src: "/galeria/photo_2025-04-25_17.avif",
    alt: "Dywaniki samochodowe EVA - nowoczesny design",
    title: "Nowoczesny design"
  },
  {
    id: 24,
    src: "/galeria/Zdjęcie WhatsApp 2024-07-04 o 12.55.09_e0e51424.jpg",
    alt: "Dywaniki samochodowe EVA - montaż w warsztacie",
    title: "Montaż w warsztacie"
  },
  {
    id: 25,
    src: "/galeria/Zdjęcie WhatsApp 2024-07-04 o 12.55.10_17f09e33.jpg",
    alt: "Dywaniki samochodowe EVA - różne rozmiary",
    title: "Różne rozmiary"
  },
  {
    id: 26,
    src: "/galeria/Zdjęcie WhatsApp 2024-07-04 o 12.55.10_6ddf48d0.jpg",
    alt: "Dywaniki samochodowe EVA - wykończenie brzegów",
    title: "Wykończenie brzegów"
  },
  {
    id: 27,
    src: "/galeria/Zdjęcie WhatsApp 2024-07-04 o 12.55.11_7814426b.jpg",
    alt: "Dywaniki samochodowe EVA - kompletny zestaw",
    title: "Kompletny zestaw"
  },
  {
    id: 28,
    src: "/galeria/0-04-0a-9ba010c9aff1b9cdca1865a72fc75ebf4d93819c25a86b3373ae05ddcad6f52f_52ef7a6d.jpg",
    alt: "Dywaniki samochodowe EVA - profesjonalna jakość",
    title: "Profesjonalna jakość"
  },
  {
    id: 29,
    src: "/galeria/photo_2025-09-26_12-01-31 (2).jpg",
    alt: "Dywaniki samochodowe EVA - nowa kolekcja",
    title: "Nowa kolekcja"
  },
  {
    id: 30,
    src: "/galeria/photo_2025-09-26_12-01-32.jpg",
    alt: "Dywaniki samochodowe EVA - premium quality",
    title: "Premium Quality"
  }
];

export default function GallerySection() {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openModal = useCallback((image: GalleryImage, index: number) => {
    setSelectedImage(image);
    setCurrentIndex(index);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedImage(null);
  }, []);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setSelectedImage(galleryImages[newIndex]);
    } else {
      const newIndex = galleryImages.length - 1;
      setCurrentIndex(newIndex);
      setSelectedImage(galleryImages[newIndex]);
    }
  }, [currentIndex]);

  const goToNext = useCallback(() => {
    if (currentIndex < galleryImages.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setSelectedImage(galleryImages[newIndex]);
    } else {
      setCurrentIndex(0);
      setSelectedImage(galleryImages[0]);
    }
  }, [currentIndex]);

  // Obsługa klawiatury
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return;
      
      if (e.key === "Escape") {
        closeModal();
      } else if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        goToNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, goToPrevious, goToNext, closeModal]);

  return (
    <section id="galeria" className="py-20 bg-black relative overflow-hidden">
      {/* Animowane tło z gradientem */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-black to-red-800/5"></div>
      
      {/* Animowane cząsteczki tła */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-2 h-2 bg-red-500 rounded-full animate-float-hover"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-red-400 rounded-full animate-float-hover" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-1.5 h-1.5 bg-red-300 rounded-full animate-float-hover" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 right-1/3 w-1 h-1 bg-red-600 rounded-full animate-float-hover" style={{animationDelay: '0.5s'}}></div>
      </div>

      {/* Nagłówek sekcji */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Galeria <span className="text-red-500">Produktów</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Odkryj naszą kolekcję najwyższej jakości dywaników samochodowych EVA Premium. 
            Każdy produkt jest precyzyjnie dopasowany do Twojego auta.
          </p>
          <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent mx-auto mt-8"></div>
        </div>
      </div>

      {/* Grid galerii */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {galleryImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="group relative aspect-square overflow-hidden rounded-xl cursor-pointer border-2 border-red-800/30 hover:border-red-500/50 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-red-500/20"
              onClick={() => openModal(image, index)}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-300 ease-out group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                quality={85}
              />
              
              {/* Overlay z gradientem */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></div>
              
              {/* Tytuł na obrazie */}
              {image.title && (
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out">
                  <h3 className="text-lg font-semibold">
                    {image.title}
                  </h3>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal dla powiększonego obrazu */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-6xl max-h-[90vh] w-full h-full flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Przycisk zamknięcia */}
              <button
                onClick={closeModal}
                className="absolute -top-12 right-0 z-10 text-white hover:text-red-400 transition-colors duration-200 p-2"
                aria-label="Zamknij"
              >
                <X className="w-8 h-8" />
              </button>

              {/* Kontener obrazu */}
              <div className="relative w-full h-full flex-1 rounded-2xl overflow-hidden bg-gray-900">
                <Image
                  src={selectedImage.src}
                  alt={selectedImage.alt}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                  quality={100}
                  priority
                />
              </div>

              {/* Informacje o obrazie */}
              {selectedImage.title && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">
                    {selectedImage.title}
                  </h3>
                  <p className="text-lg text-gray-200">
                    {selectedImage.alt}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    {currentIndex + 1} / {galleryImages.length}
                  </p>
                </div>
              )}

              {/* Przyciski nawigacji */}
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
                aria-label="Poprzednie zdjęcie"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
                aria-label="Następne zdjęcie"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

