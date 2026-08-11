"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { ImageAutoSlider, type SliderImage } from "@/components/ui/image-auto-slider"

const productImages: SliderImage[] = [
  {
    src: "/galeria/photo_2024-10-21_16.32.33_1.jpg",
    alt: "Dywaniki samochodowe EVA Premium",
    title: "Dywaniki EVA Premium",
    description: "Najwyższej jakości dywaniki EVA do samochodów osobowych",
  },
  {
    src: "/galeria/photo_2025-04-25_16.57.33.webp",
    alt: "Dywaniki samochodowe EVA - widok z góry",
    title: "Dywaniki EVA - Widok Premium",
    description: "Precyzyjnie dopasowane dywaniki EVA z doskonałym wykończeniem",
  },
  {
    src: "/galeria/photo_2025-04-25_16.57.37.webp",
    alt: "Dywaniki samochodowe EVA - detal",
    title: "Dywaniki EVA - Detal",
    description: "Szczegółowe wykończenie dywaników EVA Premium",
  },
  {
    src: "/galeria/photo_2025-04-25_16.57.43.jpg",
    alt: "Dywaniki samochodowe EVA - montaż",
    title: "Dywaniki EVA - Montaż",
    description: "Łatwy montaż dywaników EVA do każdego modelu samochodu",
  },
  {
    src: "/galeria/photo_2025-04-25_17.04.39.webp",
    alt: "Dywaniki samochodowe EVA - gotowy produkt",
    title: "Dywaniki EVA - Gotowy Produkt",
    description: "Gotowe do montażu dywaniki EVA Premium",
  },
  {
    src: "/galeria/photo_2025-04-25_17.08.33.webp",
    alt: "Dywaniki samochodowe EVA - różne kolory",
    title: "Dywaniki EVA - Różne Kolory",
    description: "Szeroka gama kolorów dywaników EVA Premium",
  },
  {
    src: "/galeria/photo_2025-04-25_17.08.35.webp",
    alt: "Dywaniki samochodowe EVA - struktura",
    title: "Dywaniki EVA - Struktura",
    description: "Głęboka struktura komórek zapewnia doskonałą ochronę",
  },
  {
    src: "/galeria/photo_2025-04-25_17.08.38.webp",
    alt: "Dywaniki samochodowe EVA - wykończenie",
    title: "Dywaniki EVA - Wykończenie",
    description: "Precyzyjne wykończenie brzegów dywaników EVA",
  },
  {
    src: "/galeria/photo_2025-04-25_17.08.44.webp",
    alt: "Dywaniki samochodowe EVA - jakość",
    title: "Dywaniki EVA - Jakość",
    description: "Najwyższa jakość materiału EVA Premium",
  },
  {
    src: "/galeria/photo_2025-04-25_17.10.11.webp",
    alt: "Dywaniki samochodowe EVA - komplet",
    title: "Dywaniki EVA - Komplet",
    description: "Kompletny zestaw dywaników EVA do samochodu",
  },
  {
    src: "/galeria/photo_2025-04-25_17.10.12.webp",
    alt: "Dywaniki samochodowe EVA - montaż w aucie",
    title: "Dywaniki EVA - Montaż w Aucie",
    description: "Doskonale dopasowane dywaniki EVA w samochodzie",
  },
  {
    src: "/galeria/photo_2025-04-25_17.12.45.webp",
    alt: "Dywaniki samochodowe EVA - różne modele",
    title: "Dywaniki EVA - Różne Modele",
    description: "Dywaniki EVA dopasowane do różnych modeli samochodów",
  },
  {
    src: "/galeria/photo_2025-04-25_17.12.47.webp",
    alt: "Dywaniki samochodowe EVA - porównanie",
    title: "Dywaniki EVA - Porównanie",
    description: "Porównanie dywaników EVA z tradycyjnymi dywanikami",
  },
  {
    src: "/galeria/photo_2025-04-25_17.12.48.webp",
    alt: "Dywaniki samochodowe EVA - zestaw",
    title: "Dywaniki EVA - Zestaw",
    description: "Kompletny zestaw dywaników EVA Premium",
  },
  {
    src: "/galeria/IMG_8951.JPG",
    alt: "Dywaniki samochodowe EVA - profesjonalny montaż",
    title: "Dywaniki EVA - Profesjonalny Montaż",
    description: "Profesjonalny montaż dywaników EVA w warsztacie",
  },
  {
    src: "/galeria/IMG_8956.JPG",
    alt: "Dywaniki samochodowe EVA - różne modele samochodów",
    title: "Dywaniki EVA - Różne Modele",
    description: "Dywaniki EVA dopasowane do różnych modeli samochodów",
  },
  {
    src: "/galeria/IMAGE 2023-09-11 12_29_54.jpg",
    alt: "Dywaniki samochodowe EVA - montaż w aucie",
    title: "Dywaniki EVA - Montaż w Aucie",
    description: "Doskonale dopasowane dywaniki EVA w samochodzie",
  },
  {
    src: "/galeria/IMAGE 2023-09-11 12_30_05.jpg",
    alt: "Dywaniki samochodowe EVA - różne kolory",
    title: "Dywaniki EVA - Różne Kolory",
    description: "Szeroka gama kolorów dywaników EVA Premium",
  },
  {
    src: "/galeria/20240719_093045.jpg",
    alt: "Dywaniki samochodowe EVA - jakość materiału",
    title: "Dywaniki EVA - Jakość Materiału",
    description: "Najwyższa jakość materiału EVA Premium",
  },
  {
    src: "/galeria/kosc_sloniowa.jpg",
    alt: "Dywaniki samochodowe EVA - kolor kość słoniowa",
    title: "Dywaniki EVA - Kość Słoniowa",
    description: "Elegancki kolor kość słoniowa dywaników EVA",
  },
  {
    src: "/galeria/photo_2025-04-25_16.57.46 (1).webp",
    alt: "Dywaniki samochodowe EVA - struktura komórek",
    title: "Dywaniki EVA - Struktura Komórek",
    description: "Głęboka struktura komórek zapewnia doskonałą ochronę",
  },
  {
    src: "/galeria/photo_2025-04-25_17.12.48 (1).webp",
    alt: "Dywaniki samochodowe EVA - zestaw premium",
    title: "Dywaniki EVA - Zestaw Premium",
    description: "Kompletny zestaw dywaników EVA Premium",
  },
  {
    src: "/galeria/photo_2025-09-26_12-01-31 (2).jpg",
    alt: "Dywaniki samochodowe EVA - nowa kolekcja",
    title: "Dywaniki EVA - Nowa Kolekcja",
    description: "Najnowsze modele dywaników EVA Premium",
  },
  {
    src: "/galeria/photo_2025-09-26_12-01-32.jpg",
    alt: "Dywaniki samochodowe EVA - premium quality",
    title: "Dywaniki EVA - Premium Quality",
    description: "Najwyższa jakość wykonania dywaników EVA",
  },
]

export default function ProductGallerySection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.1 }
    )

    const section = document.querySelector('[data-section="product-gallery"]')
    if (section) observer.observe(section)

    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="product-gallery"
      data-section="product-gallery"
        className="w-full bg-black py-10 md:py-14 relative overflow-hidden"
      role="region"
      aria-label="Galeria produktów - zdjęcia dywaników samochodowych EVA Premium"
    >

      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-red-900/8 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-red-800/6 blur-[100px] rounded-full" />
      </div>

      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        <div
          className={`text-center mb-12 md:mb-16 transition-all duration-1000 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 md:mb-6 leading-tight"
            style={{ transitionDelay: isVisible ? "200ms" : "0ms" }}
          >
            Nasza galeria <span className="text-red-500">produktów</span>
          </h2>
          <p
            className="text-sm sm:text-base md:text-lg text-white font-medium max-w-2xl mx-auto leading-relaxed px-2"
            style={{ transitionDelay: isVisible ? "400ms" : "0ms" }}
          >
            Odkryj jakość i precyzję wykonania naszych dywaników. Każdy detal ma znaczenie.
          </p>
        </div>
      </div>

      {/* Auto-scrolling gallery */}
      <div className="relative z-10 w-full py-4">
        <ImageAutoSlider images={productImages} speed={40} />
      </div>

      {/* CTA */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 mt-12 text-center">
        <Link
          href="/dywaniki"
          className="inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-4 text-sm md:text-base font-bold text-white transition-all duration-300 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-full shadow-xl shadow-red-900/30 hover:scale-105 hover:shadow-2xl hover:shadow-red-600/20 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-black min-h-[44px]"
          aria-label="Sprawdź dostępność dywaników dla Twojego auta"
        >
          Sprawdź Dostępność Dla Twojego Auta
        </Link>
      </div>

    </section>
  )
}
