"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, TrendingUp, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatPriceCurrency } from "@/lib/utils/formatPrice"

// TODO: Replace with real data from purchase tracking logic once implemented
interface PopularProduct {
  id: string
  brand: string
  model: string
  generation: string
  bodyType: string
  yearFrom: number
  yearTo: number
  price: number
  imageUrl: string
  configuratorUrl: string
}

const POPULAR_PRODUCTS: PopularProduct[] = [
  {
    id: "toyota-corolla-xii",
    brand: "Toyota",
    model: "Corolla",
    generation: "XII",
    bodyType: "Sedan",
    yearFrom: 2019,
    yearTo: 2023,
    price: 299,
    imageUrl: "/galeria/photo_2024-10-21_16.32.33_1.jpg",
    configuratorUrl: "/konfigurator?brand=toyota&model=corolla",
  },
  {
    id: "bmw-seria3-g20",
    brand: "BMW",
    model: "Seria 3",
    generation: "G20",
    bodyType: "Sedan",
    yearFrom: 2019,
    yearTo: 2024,
    price: 349,
    imageUrl: "/galeria/photo_2025-04-25_16.57.33.webp",
    configuratorUrl: "/konfigurator?brand=bmw&model=seria+3",
  },
  {
    id: "volkswagen-golf-viii",
    brand: "Volkswagen",
    model: "Golf",
    generation: "VIII",
    bodyType: "Hatchback",
    yearFrom: 2020,
    yearTo: 2024,
    price: 299,
    imageUrl: "/galeria/photo_2025-04-25_16.57.37.webp",
    configuratorUrl: "/konfigurator?brand=volkswagen&model=golf",
  },
  {
    id: "audi-a4-b9",
    brand: "Audi",
    model: "A4",
    generation: "B9",
    bodyType: "Sedan",
    yearFrom: 2016,
    yearTo: 2024,
    price: 349,
    imageUrl: "/galeria/photo_2025-04-25_16.57.43.jpg",
    configuratorUrl: "/konfigurator?brand=audi&model=a4",
  },
  {
    id: "ford-focus-iv",
    brand: "Ford",
    model: "Focus",
    generation: "IV",
    bodyType: "Kombi",
    yearFrom: 2018,
    yearTo: 2024,
    price: 279,
    imageUrl: "/galeria/photo_2025-04-25_17.04.39.webp",
    configuratorUrl: "/konfigurator?brand=ford&model=focus",
  },
  {
    id: "skoda-octavia-iv",
    brand: "Skoda",
    model: "Octavia",
    generation: "IV",
    bodyType: "Kombi",
    yearFrom: 2020,
    yearTo: 2024,
    price: 299,
    imageUrl: "/galeria/photo_2025-04-25_17.08.33.webp",
    configuratorUrl: "/konfigurator?brand=skoda&model=octavia",
  },
]

const ProductCard = ({ product }: { product: PopularProduct }) => (
  <article
    className="group block h-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black rounded-xl"
  >
    <div className="h-full flex flex-col bg-[#111] border border-white/5 rounded-xl overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:shadow-red-900/10 hover:-translate-y-1">
      {/* Car image */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-900 to-black overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={`Dywaniki do ${product.brand} ${product.model} - Spersonalizowane dywaniki samochodowe`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          quality={90}
        />
      </div>

      {/* Card info */}
      <div className="flex-1 flex flex-col p-5">
        <div className="mb-2">
          <h3 className="text-lg font-bold text-white leading-tight group-hover:text-red-500 transition-colors line-clamp-2">
            {product.brand} {product.model}
          </h3>
        </div>

        <div className="text-sm text-gray-400 mb-4 flex-1">
          <div className="flex flex-wrap gap-2">
            <span>{product.generation} · {product.yearFrom}–{product.yearTo}</span>
            {product.bodyType && (
              <span className="uppercase">{product.bodyType}</span>
            )}
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">Cena od</span>
            <span className="text-xl font-bold text-white">
              {formatPriceCurrency(product.price)}{" "}
              <span className="text-red-500">PLN</span>
            </span>
          </div>

          <Link href={product.configuratorUrl} aria-label={`Konfiguruj dywaniki EVA dla ${product.brand} ${product.model}`}>
            <Button
              className="shrink-0 gap-2 transition-all duration-300 bg-red-600 text-white hover:bg-red-700"
              size="sm"
            >
              <ShoppingCart className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Skonfiguruj</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  </article>
)

export default function PopularProductsSection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="popular-products"
        className="w-full bg-black py-10 md:py-14 relative overflow-hidden"
      role="region"
      aria-label="Najczęściej wybierane produkty – dywaniki EVA Premium"
    >

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[700px] bg-red-900/5 blur-[160px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Heading */}
        <div
          className={cn(
            "text-center mb-12 md:mb-16 transition-all duration-1000 ease-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-500/20 rounded-full px-4 py-1.5 mb-6">
            <TrendingUp className="w-4 h-4 text-red-500" aria-hidden="true" />
            <span className="text-sm font-medium text-red-400">Najczęściej kupowane</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Najczęściej{" "}
            <span className="text-red-500">Wybierane</span>
          </h2>
          <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Odkryj dywaniki EVA Premium, które najczęściej trafiają do koszyków naszych klientów.
            Sprawdź czy Twój model jest na liście.
          </p>
        </div>

        {/* Cards grid */}
        <div
          className={cn(
            "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-1000 ease-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
          style={{ transitionDelay: isVisible ? "200ms" : "0ms" }}
        >
          {POPULAR_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* CTA */}
        <div
          className={cn(
            "text-center mt-12 md:mt-16 transition-all duration-1000 ease-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
          style={{ transitionDelay: isVisible ? "400ms" : "0ms" }}
        >
          <p className="text-gray-400 text-sm mb-4">
            Nie ma Twojego modelu? Sprawdź pełny katalog.
          </p>
          <Link
            href="/dywaniki"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white transition-all duration-300 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-full shadow-xl shadow-red-900/30 hover:scale-105 hover:shadow-2xl hover:shadow-red-600/20 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-black min-h-[44px]"
            aria-label="Zobacz wszystkie modele dywaników EVA"
          >
            Zobacz Wszystkie Modele
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
          </Link>
        </div>
      </div>

    </section>
  )
}
