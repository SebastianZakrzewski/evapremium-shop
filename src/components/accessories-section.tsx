"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Accessory } from "@/lib/types/accessory";
import { useAccessories } from "@/hooks/useAccessories";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";

interface FilterState {
  categories: string[];
  priceRange: [number, number];
  inStock: boolean;
}

export default function AccessoriesSection() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  // Hook do pobierania danych z bazy
  const { 
    accessories, 
    categories, 
    isLoading, 
    error,
    getAccessoriesByCategory: getAccessoriesByCategorySlug 
  } = useAccessories();
  
  // Stan filtrów
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: [0, 1000],
    inStock: false
  });

  // Dostępne kategorie z bazy danych
  const availableCategories = useMemo(() => {
    return categories.map(cat => cat.name).sort();
  }, [categories]);

  // Filtrowanie akcesoriów
  const filteredAccessories = useMemo(() => {
    let filtered = accessories;

    // Filtrowanie według kategorii
    if (filters.categories.length > 0) {
      filtered = filtered.filter(accessory => 
        accessory.category && filters.categories.includes(accessory.category.name)
      );
    }

    // Filtrowanie według ceny
    const [minPrice, maxPrice] = filters.priceRange;
    filtered = filtered.filter(accessory => {
      return accessory.price >= minPrice && accessory.price <= maxPrice;
    });

    // Filtrowanie według dostępności
    if (filters.inStock) {
      filtered = filtered.filter(accessory => accessory.inStock);
    }

    return filtered;
  }, [accessories, filters]);

  // Obsługa filtrów
  const handleCategoryChange = (categoryName: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      categories: checked 
        ? [...prev.categories, categoryName]
        : prev.categories.filter(cat => cat !== categoryName)
    }));
  };

  const handlePriceRangeChange = (minValue: number, maxValue: number) => {
    setFilters(prev => ({
      ...prev,
      priceRange: [minValue, maxValue]
    }));
  };

  const handleInStockChange = (checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      inStock: checked
    }));
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      priceRange: [0, 1000],
      inStock: false
    });
  };

  // Stan dla akcesoriów z konkretnej kategorii
  const [categoryAccessories, setCategoryAccessories] = useState<Accessory[]>([]);
  const [loadingCategory, setLoadingCategory] = useState(false);

  // Pobierz akcesoria dla konkretnej kategorii jeśli podano parametr
  useEffect(() => {
    if (categoryParam) {
      setLoadingCategory(true);
      getAccessoriesByCategorySlug(categoryParam).then(accessories => {
        setCategoryAccessories(accessories);
        setLoadingCategory(false);
      }).catch(() => {
        setCategoryAccessories([]);
        setLoadingCategory(false);
      });
    }
  }, [categoryParam, getAccessoriesByCategorySlug]);

  const currentAccessories = categoryParam ? categoryAccessories : filteredAccessories;

  // Obsługa stanu ładowania
  if (isLoading || loadingCategory) {
    return (
      <section className="py-8 md:py-12 bg-black">
        <div className="container mx-auto px-4">
          <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-white text-xl">Ładowanie akcesoriów...</div>
          </div>
        </div>
      </section>
    );
  }

  // Obsługa błędów
  if (error) {
    return (
      <section className="py-8 md:py-12 bg-black">
        <div className="container mx-auto px-4">
          <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-center">
              <div className="text-red-400 text-xl mb-4">Błąd ładowania akcesoriów</div>
              <div className="text-gray-400">{error}</div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 md:py-12 bg-black">
      <div className="container mx-auto px-4">
        {/* Breadcrumbs */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-gray-400">
            <li>
              <Link href="/" className="hover:text-white transition-colors">
                Strona główna
              </Link>
            </li>
            <li className="text-gray-600">/</li>
            <li className="text-white font-medium">Akcesoria</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            {categoryParam ? `AKCESORIA - ${categoryParam.toUpperCase()}` : 'AKCESORIA SAMOCHODOWE'}
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            {categoryParam 
              ? `Wysokiej jakości akcesoria z kategorii ${categoryParam} do Twojego samochodu.`
              : 'Kompletna gama akcesoriów samochodowych do ochrony, organizacji i zwiększenia komfortu jazdy. Wszystko w jednym miejscu!'
            }
          </p>
          {categoryParam && (
            <div className="mt-4">
              <Link 
                href="/akcesoria" 
                className="text-red-400 hover:text-red-300 text-sm font-medium"
              >
                ← Zobacz wszystkie kategorie
              </Link>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Panel filtrowania - lewa strona */}
          <div className="lg:w-1/4">
            <div className="bg-gray-900 rounded-lg p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Filtry</h2>
                <button
                  onClick={clearFilters}
                  className="text-red-400 hover:text-red-300 text-sm font-medium"
                >
                  Wyczyść wszystkie
                </button>
              </div>

              {/* Kategorie */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-3">Kategorie</h3>
                <div className="space-y-2">
                  {availableCategories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={filters.categories.includes(category)}
                        onCheckedChange={(checked) => 
                          handleCategoryChange(category, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={`category-${category}`}
                        className="text-gray-300 hover:text-white cursor-pointer"
                      >
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="bg-gray-700 mb-6" />

              {/* Zakres cenowy */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-3">Zakres cenowy</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>{filters.priceRange[0].toLocaleString()} PLN</span>
                    <span>{filters.priceRange[1].toLocaleString()} PLN</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="10"
                    value={filters.priceRange[1]}
                    onChange={(e) => handlePriceRangeChange(filters.priceRange[0], parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>

              <Separator className="bg-gray-700 mb-6" />

              {/* Dostępność */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-3">Dostępność</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="inStock"
                      checked={filters.inStock}
                      onCheckedChange={(checked) => handleInStockChange(checked as boolean)}
                    />
                    <Label 
                      htmlFor="inStock"
                      className="text-gray-300 hover:text-white cursor-pointer"
                    >
                      Tylko dostępne
                    </Label>
                  </div>
                </div>
              </div>

              {/* Liczba wyników */}
              <div className="text-center">
                <p className="text-gray-400 text-sm">
                  Znaleziono: <span className="text-white font-semibold">{filteredAccessories.length}</span> akcesoriów
                </p>
              </div>
            </div>
          </div>

          {/* Grid z akcesoriami - prawa strona */}
          <div className="lg:w-3/4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {currentAccessories.map((accessory) => (
                <article
                  key={accessory.id}
                  className="flex items-center justify-center group cursor-pointer"
                >
                  <Link 
                    href={`/akcesoria/${accessory.category?.slug || 'all'}`}
                    className="flex flex-col items-center text-center transition-all duration-300 transform hover:scale-105"
                  >
                    {/* Accessory Window */}
                    <div className="mb-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl w-40 h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 relative overflow-hidden transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl">
                      {/* Image or placeholder */}
                      {accessory.imageSrc ? (
                        <Image
                          src={accessory.imageSrc}
                          alt={accessory.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-6xl text-gray-400">📦</div>
                        </div>
                      )}
                      {/* Overlay for better text readability */}
                      <div className="absolute inset-0 bg-black/20" />
                    </div>
                    
                    {/* Accessory Info */}
                    <div className="text-center">
                      <h3 className="text-lg md:text-xl font-semibold text-white transition-all duration-300 group-hover:text-red-400 mb-2">
                        {accessory.name}
                      </h3>
                      <p className="text-sm md:text-base text-gray-300 transition-all duration-300 group-hover:text-white mb-2">
                        {accessory.category?.name || 'Brak kategorii'}
                      </p>
                      <p className="text-red-400 font-semibold text-base md:text-lg transition-all duration-300 group-hover:text-red-300">
                        {accessory.price.toLocaleString('pl-PL')} PLN
                      </p>
                      <p className="text-xs md:text-sm text-gray-400 mt-2 max-w-xs transition-all duration-300 group-hover:text-gray-300">
                        {accessory.description || 'Brak opisu'}
                      </p>
                    </div>
                  </Link>
                </article>
              ))}
            </div>

            {currentAccessories.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">Nie znaleziono akcesoriów spełniających kryteria</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
