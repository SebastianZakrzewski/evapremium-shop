"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <section id="galeria" className="py-20 md:py-32 bg-black relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-900/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-900/5 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {galleryImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="group relative aspect-square bg-[#111] rounded-xl overflow-hidden cursor-pointer border-2 border-white/5 hover:border-red-500/50 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-red-900/20 hover:-translate-y-1"
              onClick={() => openModal(image, index)}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                quality={85}
              />
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out" />
              
              {/* Hover Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">
                  {image.title}
                </h3>
                <div className="w-full h-0.5 bg-red-500 mt-2 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
              </div>
              
              {/* Search Icon */}
              <div className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 border border-white/10">
                <Search className="w-5 h-5" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-7xl max-h-[90vh] w-full h-full flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute -top-12 right-0 md:-right-12 z-20 text-white hover:text-red-500 transition-colors p-2 bg-black/50 rounded-full border border-white/10 backdrop-blur-sm"
                aria-label="Zamknij"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Navigation Buttons */}
              <button
                onClick={goToPrevious}
                className="absolute left-0 md:-left-16 top-1/2 transform -translate-y-1/2 z-20 bg-black/50 hover:bg-red-600/90 text-white p-3 rounded-full transition-all duration-300 border border-white/10 backdrop-blur-sm group"
                aria-label="Poprzednie"
              >
                <ChevronLeft className="w-8 h-8 group-hover:scale-110 transition-transform" />
              </button>

              <button
                onClick={goToNext}
                className="absolute right-0 md:-right-16 top-1/2 transform -translate-y-1/2 z-20 bg-black/50 hover:bg-red-600/90 text-white p-3 rounded-full transition-all duration-300 border border-white/10 backdrop-blur-sm group"
                aria-label="Następne"
              >
                <ChevronRight className="w-8 h-8 group-hover:scale-110 transition-transform" />
              </button>

              {/* Main Image Container */}
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-[#050505] shadow-2xl border border-white/10">
                <Image
                  src={selectedImage.src}
                  alt={selectedImage.alt}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  quality={100}
                  priority
                />
                
                {/* Info Bar */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-8 text-white">
                   <h3 className="text-3xl font-bold mb-2">{selectedImage.title}</h3>
                   <div className="flex items-center gap-4 text-sm text-gray-400 font-mono">
                     <span>{selectedImage.alt}</span>
                     <span className="w-1 h-1 rounded-full bg-gray-500" />
                     <span>{currentIndex + 1} / {galleryImages.length}</span>
                   </div>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
