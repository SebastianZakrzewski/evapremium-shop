"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Car, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

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

export default function SearchDropdown() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 400);

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

  // Flatten results dla nawigacji klawiaturą
  const allResults = [
    ...results.brands.map(b => ({ type: 'brand' as const, data: b })),
    ...results.models.map(m => ({ type: 'model' as const, data: m })),
    ...results.products.map(p => ({ type: 'product' as const, data: p }))
  ];

  // Reset selectedIndex gdy wyniki się zmieniają
  useEffect(() => {
    setSelectedIndex(-1);
  }, [debouncedQuery]);

  // Focus input gdy modal się otwiera
  useEffect(() => {
    if (isModalOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isModalOpen]);

  // Obsługa kliknięcia poza komponentem
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        // Nie zamykaj modala przy kliknięciu w overlay - tylko przy Escape
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Obsługa Escape do zamykania modala
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
        setQuery("");
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isModalOpen]);

  // Obsługa klawiatury
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < allResults.length - 1 ? prev + 1 : prev
      );
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
      return;
    }

    if (e.key === 'Enter' && selectedIndex >= 0 && selectedIndex < allResults.length) {
      e.preventDefault();
      handleResultClick(allResults[selectedIndex]);
      return;
    }
  }, [selectedIndex, allResults]);

  const handleResultClick = useCallback((result: { type: 'brand' | 'model' | 'product'; data: any }) => {
    if (result.type === 'brand') {
      router.push(`/konfigurator?brand=${encodeURIComponent(result.data.name.toLowerCase())}`);
    } else if (result.type === 'model') {
      router.push(`/konfigurator?brand=${encodeURIComponent(result.data.brand.toLowerCase())}&model=${encodeURIComponent(result.data.model)}`);
    } else if (result.type === 'product') {
      router.push(`/konfigurator?brand=${encodeURIComponent(result.data.carBrandSlug)}&model=${encodeURIComponent(result.data.carModelSlug)}`);
    }
    setIsModalOpen(false);
    setQuery("");
    setSelectedIndex(-1);
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setSelectedIndex(-1);
  };

  const clearSearch = () => {
    setQuery("");
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setQuery("");
    setSelectedIndex(-1);
  };

  return (
    <>
      {/* Przycisk z ikoną lupy */}
      <button
        onClick={handleOpenModal}
        className="text-white/90 hover:text-white transition-colors p-2 group"
        aria-label="Otwórz wyszukiwanie"
      >
        <Search className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>

      {/* Modal z wyszukiwaniem */}
      {isModalOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/70 z-[100] transition-opacity duration-300"
            onClick={handleCloseModal}
          />
          
          {/* Modal */}
          <div className="
            fixed
            top-4 left-4 right-4 bottom-4
            md:top-20 md:left-1/2 md:right-auto md:bottom-auto
            md:transform md:-translate-x-1/2
            w-auto
            max-w-2xl
            bg-gray-900
            border border-gray-700
            rounded-lg
            shadow-2xl
            z-[101]
            max-h-[calc(100vh-2rem)]
            md:max-h-[calc(100vh-5rem)]
            flex flex-col
          ">
            {/* Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-700 flex-shrink-0">
              <h2 className="text-lg sm:text-xl font-bold text-white">Wyszukiwanie</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white transition-colors p-1"
                aria-label="Zamknij"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Input wyszukiwania */}
            <div className="p-3 sm:p-4 border-b border-gray-700 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Szukaj marek, modeli lub produktów..."
                  value={query}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  className="
                    pl-10 pr-10
                    h-11 sm:h-12
                    w-full
                    bg-gray-800/80 backdrop-blur-xl
                    border-gray-700/50
                    text-white text-sm sm:text-base
                    placeholder:text-gray-400
                    focus:border-red-500/70 focus:ring-2 focus:ring-red-500/30
                    rounded-lg
                    transition-all duration-300
                  "
                  aria-label="Wyszukaj marki, modele lub produkty"
                  aria-expanded={debouncedQuery.trim().length > 0}
                  aria-haspopup="listbox"
                />
                {query && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors z-10"
                    aria-label="Wyczyść wyszukiwanie"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Dropdown z wynikami */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {debouncedQuery.trim() ? (
                <div
                  ref={dropdownRef}
                  className="p-2 sm:p-3"
                  role="listbox"
                >
                  {isLoading && (
                    <div className="flex items-center justify-center p-6 sm:p-8">
                      <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 animate-spin" />
                    </div>
                  )}

                  {!isLoading && error && (
                    <div className="p-4 sm:p-6 text-center text-gray-400 text-sm">
                      Wystąpił błąd podczas wyszukiwania
                    </div>
                  )}

                  {!isLoading && !error && totalResults === 0 && (
                    <div className="p-4 sm:p-6 text-center text-gray-400 text-sm">
                      Nie znaleziono wyników dla &quot;{debouncedQuery}&quot;
                    </div>
                  )}

                  {!isLoading && !error && totalResults > 0 && (
                    <div className="py-1 sm:py-2">
                      {/* Marki */}
                      {results.brands.length > 0 && (
                        <div className="px-2 sm:px-3 py-1 sm:py-2">
                          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Marki ({results.brands.length})
                          </div>
                          {results.brands.map((brand, index) => {
                            const flatIndex = index;
                            return (
                              <button
                                key={brand.id}
                                onClick={() => handleResultClick({ type: 'brand', data: brand })}
                                className={`
                                  w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg mb-1
                                  transition-colors text-left
                                  ${selectedIndex === flatIndex 
                                    ? 'bg-red-500/20 text-white' 
                                    : 'hover:bg-gray-800/50 text-gray-300 hover:text-white'
                                  }
                                `}
                                role="option"
                                aria-selected={selectedIndex === flatIndex}
                              >
                                <Car className="w-4 h-4 text-red-500 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium truncate text-sm sm:text-base">{brand.name}</div>
                                  {brand.description && (
                                    <div className="text-xs text-gray-400 truncate">{brand.description}</div>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Modele */}
                      {results.models.length > 0 && (
                        <div className="px-2 sm:px-3 py-1 sm:py-2 border-t border-gray-700/50">
                          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Modele ({results.models.length})
                          </div>
                          {results.models.map((model, index) => {
                            const flatIndex = results.brands.length + index;
                            return (
                              <button
                                key={`${model.brand}-${model.model}`}
                                onClick={() => handleResultClick({ type: 'model', data: model })}
                                className={`
                                  w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg mb-1
                                  transition-colors text-left
                                  ${selectedIndex === flatIndex 
                                    ? 'bg-red-500/20 text-white' 
                                    : 'hover:bg-gray-800/50 text-gray-300 hover:text-white'
                                  }
                                `}
                                role="option"
                                aria-selected={selectedIndex === flatIndex}
                              >
                                <Car className="w-4 h-4 text-red-500 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium truncate text-sm sm:text-base">
                                    {model.brand} {model.model}
                                  </div>
                                  {model.bodyTypes.length > 0 && (
                                    <div className="text-xs text-gray-400 truncate">
                                      {model.bodyTypes.slice(0, 2).join(', ')}
                                      {model.bodyTypes.length > 2 && '...'}
                                    </div>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Produkty */}
                      {results.products.length > 0 && (
                        <div className="px-2 sm:px-3 py-1 sm:py-2 border-t border-gray-700/50">
                          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Produkty ({results.products.length})
                          </div>
                          {results.products.map((product, index) => {
                            const flatIndex = results.brands.length + results.models.length + index;
                            return (
                              <button
                                key={product.id}
                                onClick={() => handleResultClick({ type: 'product', data: product })}
                                className={`
                                  w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg mb-1
                                  transition-colors text-left
                                  ${selectedIndex === flatIndex 
                                    ? 'bg-red-500/20 text-white' 
                                    : 'hover:bg-gray-800/50 text-gray-300 hover:text-white'
                                  }
                                `}
                                role="option"
                                aria-selected={selectedIndex === flatIndex}
                              >
                                <Car className="w-4 h-4 text-red-500 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium truncate text-sm sm:text-base">
                                    {product.carBrandSlug} {product.carModelSlug}
                                  </div>
                                  {product.generation && (
                                    <div className="text-xs text-gray-400 truncate">
                                      {product.generation}
                                      {product.bodyType && ` • ${product.bodyType}`}
                                    </div>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 sm:p-8 text-center text-gray-400">
                  <Search className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                  <p className="text-xs sm:text-sm px-4">Wpisz frazę wyszukiwania, aby znaleźć marki, modele lub produkty</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

