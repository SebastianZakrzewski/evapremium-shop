"use client";

import React, { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BrandPopularGridCard from "@/components/brands/BrandPopularGridCard";
import { Brand } from "@/entities/car";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useBrands } from "@/features/brands/hooks/useBrands";
import { brandNameToNavigationSlug } from "@/shared/brands/brandParam";

function brandCountLabel(count: number) {
  if (count === 1) return "1 marka";
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} marki`;
  }
  return `${count} marek`;
}

export default function BrandSelectionGrid() {
  const router = useRouter();
  const [clickedBrandId, setClickedBrandId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Użyj hooka useBrands do pobierania marek
  const { brands, isLoading: loading, error } = useBrands();

  // Filtrowanie marek na podstawie wyszukiwania
  const filteredBrands = useMemo(() => {
    let result = brands.filter(brand => {
      const isImage = brand.logo.includes('.jpg') || 
                      brand.logo.includes('.png') || 
                      brand.logo.includes('.jpeg') || 
                      brand.logo.includes('.avif') || 
                      brand.logo.includes('.webp');
      const isExcluded = ['asia', 'bestune'].includes(brand.name.toLowerCase());
      return isImage && !isExcluded;
    });

    if (!searchQuery.trim()) {
      return result;
    }
    
    const query = searchQuery.toLowerCase().trim();
    return result.filter(brand => 
      brand.name.toLowerCase().includes(query) ||
      brand.description?.toLowerCase().includes(query)
    );
  }, [brands, searchQuery]);

  const handleBrandClick = useCallback((brand: Brand) => {
    setClickedBrandId(brand.id);
    
    // Animacja kliknięcia - reset po 300ms
    setTimeout(() => {
      setClickedBrandId(null);
      // Przekierowanie do sekcji produktów (tak jak w karuzeli marek)
      router.push(`/dywaniki?brand=${encodeURIComponent(brandNameToNavigationSlug(brand.name))}`);
    }, 300);
  }, [router]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);


  return (
    <section id="brand-selection" className="bg-black pb-20 text-white">
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 md:px-6 md:pt-12">
        <nav className="flex items-center gap-2 text-xs tracking-wide text-white/40">
          <Link href="/" className="transition-colors hover:text-white">
            Home
          </Link>
          <span>/</span>
          <span className="text-white/70">Dywaniki</span>
        </nav>

        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.28em] text-red-500">Kolekcja</p>
            <h1 className="mt-3 text-3xl font-medium leading-tight tracking-tight text-white md:text-4xl">
              Dywaniki samochodowe
            </h1>
            <p className="mt-3 max-w-xl text-sm font-normal leading-relaxed text-white/55 md:text-base">
              Wybierz markę i dopasuj dywaniki EVA do swojego auta.
            </p>
          </div>
          {!loading && (
            <p className="text-sm text-white/40">{brandCountLabel(filteredBrands.length)}</p>
          )}
        </div>

        <div className="mt-10 border-b border-white/10 pb-5">
          <div className="relative max-w-xs">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-white/40" />
            <Input
              type="text"
              placeholder="Szukaj marki"
              value={searchQuery}
              onChange={handleSearchChange}
              className="h-10 rounded-full border-white/10 bg-transparent pl-10 pr-10 text-sm text-white shadow-none placeholder:text-white/40 focus:border-white/25 focus:ring-0"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3.5 top-1/2 z-10 -translate-y-1/2 text-white/40 transition-colors hover:text-white"
                aria-label="Wyczyść wyszukiwanie"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {error && (
            <p className="mt-3 text-sm text-white/50">
              Używamy ograniczonych danych. Katalog marek jest tymczasowo niepełny.
            </p>
          )}
        </div>

        <div className="mt-10">
          {loading ? (
            <div className="grid grid-cols-4 gap-3 lg:grid-cols-8">
              {[...Array(8)].map((_, index) => (
                <div
                  key={index}
                  className="aspect-[4/5] animate-pulse rounded-md border border-white/15 bg-white/10"
                />
              ))}
            </div>
          ) : filteredBrands.length > 0 ? (
            <div className="grid grid-cols-4 gap-3 lg:grid-cols-8">
              {filteredBrands.map((brand) => (
                <BrandPopularGridCard
                  key={brand.id}
                  brand={brand}
                  compact
                  isClicked={clickedBrandId === brand.id}
                  onClick={handleBrandClick}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <h2 className="text-xl font-medium text-white">Brak marek</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-white/50">
                Wpisz inną nazwę, żeby zobaczyć resztę kolekcji.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
