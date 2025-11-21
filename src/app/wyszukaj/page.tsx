"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, Car, Loader2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SearchBrand {
  id: number;
  name: string;
  logo: string;
  description: string;
}

interface SearchModel {
  brand: string;
  model: string;
  bodyTypes: string[];
  isCurrentlyProduced: boolean;
}

interface SearchProduct {
  id: string;
  carBrandSlug: string;
  carModelSlug: string;
  generation?: string;
  bodyType?: string;
  basePrice: number;
}

interface SearchResults {
  brands: SearchBrand[];
  models: SearchModel[];
  products: SearchProduct[];
}

// Hook do debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Funkcja do pobierania wyników wyszukiwania
const fetchSearchResults = async (query: string): Promise<SearchResults> => {
  if (!query.trim()) {
    return { brands: [], models: [], products: [] };
  }

  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 400);

  // Aktualizuj URL gdy query się zmienia
  useEffect(() => {
    if (debouncedQuery.trim()) {
      router.replace(`/wyszukaj?q=${encodeURIComponent(debouncedQuery)}`, { scroll: false });
    } else {
      router.replace('/wyszukaj', { scroll: false });
    }
  }, [debouncedQuery, router]);

  // Pobierz wyniki wyszukiwania
  const { data: searchResults, isLoading, error } = useQuery<SearchResults>({
    queryKey: ['search', debouncedQuery],
    queryFn: () => fetchSearchResults(debouncedQuery),
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const results = searchResults || { brands: [], models: [], products: [] };
  const totalResults = results.brands.length + results.models.length + results.products.length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Query jest już zaktualizowane przez state
  };

  return (
    <div className="min-h-screen bg-neutral-950 pt-24 md:pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Wyszukiwanie
          </h1>
          
          {/* Input wyszukiwania */}
          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
              <Input
                type="text"
                placeholder="Szukaj marek, modeli lub produktów..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="
                  pl-12 pr-4
                  h-14
                  bg-gray-900/80 backdrop-blur-xl
                  border-gray-700/50
                  text-white text-lg
                  placeholder:text-gray-400
                  focus:border-red-500/70 focus:ring-2 focus:ring-red-500/30
                  rounded-xl
                  transition-all duration-300
                "
              />
            </div>
          </form>
        </div>

        {/* Wyniki wyszukiwania */}
        {!debouncedQuery.trim() && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              Wpisz frazę wyszukiwania, aby znaleźć marki, modele lub produkty
            </p>
          </div>
        )}

        {isLoading && debouncedQuery.trim() && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
          </div>
        )}

        {error && debouncedQuery.trim() && (
          <div className="text-center py-16">
            <p className="text-red-400 text-lg mb-2">Wystąpił błąd podczas wyszukiwania</p>
            <p className="text-gray-400 text-sm">Spróbuj ponownie później</p>
          </div>
        )}

        {!isLoading && !error && debouncedQuery.trim() && totalResults === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg mb-2">
              Nie znaleziono wyników dla &quot;{debouncedQuery}&quot;
            </p>
            <p className="text-gray-500 text-sm">Spróbuj wpisać inną frazę</p>
          </div>
        )}

        {!isLoading && !error && debouncedQuery.trim() && totalResults > 0 && (
          <div className="space-y-8">
            {/* Marki */}
            {results.brands.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Car className="w-6 h-6 text-red-500" />
                  Marki ({results.brands.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.brands.map((brand) => (
                    <Link
                      key={brand.id}
                      href={`/konfigurator?brand=${encodeURIComponent(brand.name.toLowerCase())}`}
                      className="
                        group relative
                        bg-gray-900/80 backdrop-blur-xl
                        border border-gray-700/50
                        rounded-xl p-6
                        hover:border-red-500/70
                        hover:shadow-lg hover:shadow-red-500/20
                        transition-all duration-300
                      "
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-red-400 transition-colors">
                            {brand.name}
                          </h3>
                          {brand.description && (
                            <p className="text-gray-400 text-sm">{brand.description}</p>
                          )}
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Modele */}
            {results.models.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Car className="w-6 h-6 text-red-500" />
                  Modele ({results.models.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.models.map((model, index) => (
                    <Link
                      key={`${model.brand}-${model.model}-${index}`}
                      href={`/konfigurator?brand=${encodeURIComponent(model.brand.toLowerCase())}&model=${encodeURIComponent(model.model)}`}
                      className="
                        group relative
                        bg-gray-900/80 backdrop-blur-xl
                        border border-gray-700/50
                        rounded-xl p-6
                        hover:border-red-500/70
                        hover:shadow-lg hover:shadow-red-500/20
                        transition-all duration-300
                      "
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-red-400 transition-colors">
                            {model.brand} {model.model}
                          </h3>
                          {model.bodyTypes.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {model.bodyTypes.slice(0, 3).map((bodyType, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-red-500/20 border border-red-500/30 rounded text-xs text-red-300"
                                >
                                  {bodyType}
                                </span>
                              ))}
                              {model.bodyTypes.length > 3 && (
                                <span className="px-2 py-1 text-xs text-gray-400">
                                  +{model.bodyTypes.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                          {model.isCurrentlyProduced && (
                            <span className="inline-block mt-2 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded text-xs text-green-300">
                              W produkcji
                            </span>
                          )}
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Produkty */}
            {results.products.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Car className="w-6 h-6 text-red-500" />
                  Produkty ({results.products.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/konfigurator?brand=${encodeURIComponent(product.carBrandSlug)}&model=${encodeURIComponent(product.carModelSlug)}`}
                      className="
                        group relative
                        bg-gray-900/80 backdrop-blur-xl
                        border border-gray-700/50
                        rounded-xl p-6
                        hover:border-red-500/70
                        hover:shadow-lg hover:shadow-red-500/20
                        transition-all duration-300
                      "
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-red-400 transition-colors">
                            {product.carBrandSlug} {product.carModelSlug}
                          </h3>
                          <div className="space-y-1">
                            {product.generation && (
                              <p className="text-gray-400 text-sm">Generacja: {product.generation}</p>
                            )}
                            {product.bodyType && (
                              <p className="text-gray-400 text-sm">Typ: {product.bodyType}</p>
                            )}
                            <p className="text-red-400 font-semibold mt-2">
                              Od {product.basePrice.toFixed(2)} zł
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-950 pt-24 md:pt-28 pb-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}

