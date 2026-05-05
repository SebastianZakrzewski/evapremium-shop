"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ShoppingCart, TrendingUp, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

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
  <Link
    href={product.configuratorUrl}
    aria-label={`Konfiguruj dywaniki EVA dla ${product.brand} ${product.model}`}
    className="group block rounded-2xl bg-[#1a1a1a] overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-red-900/20 focus:outline-none focus:ring-2 focus:ring-red-500/50"
    tabIndex={0}
  >
    {/* Car image */}
    <div className="relative h-52 overflow-hidden bg-zinc-900">
      <img
        src={product.imageUrl}
        alt={`${product.brand} ${product.model} ${product.generation}`}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" />
    </div>

    {/* Card body */}
    <div className="px-5 pt-4 pb-5 space-y-3">
      {/* Brand & model */}
      <div>
        <h3 className="text-lg font-bold text-white leading-tight">
          {product.brand} {product.model}
        </h3>
        <p className="text-sm text-gray-400 mt-0.5">
          {product.yearFrom}–{product.yearTo}&nbsp;&nbsp;{product.bodyType}
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-white/10" />

      {/* Price + CTA */}
      <div className="flex items-end justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            Cena od
          </span>
          <span className="text-2xl font-bold text-white leading-none mt-0.5">
            {product.price.toFixed(2)}
          </span>
          <span className="text-sm font-semibold text-red-500 leading-none mt-0.5">
            PLN
          </span>
        </div>

        <span
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors duration-200 shrink-0"
          aria-hidden="true"
        >
          <ShoppingCart className="w-4 h-4" />
          Skonfiguruj
        </span>
      </div>
    </div>
  </Link>
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
