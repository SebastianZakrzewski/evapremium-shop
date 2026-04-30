"use client";

import { useState, useMemo } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { Mat } from "@/entities/product";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Car, SlidersHorizontal } from "lucide-react";
import { getBrandInfo } from '@/shared/brands';
import { normalizeBodyTypeKey, formatBodyTypeLabel } from '@/shared';
import { fetchCarModels } from '@/lib/api/models';
import { apiGet } from '@/lib/api/client';
import { useProductSelectionFilters } from '@/features/products/hooks';

interface FilterState {
  bodyTypes: string[];
  yearRanges: string[];
}

interface ProductDisplayItem {
  id: string;
  brand: string;
  model: string;
  generation?: string;
  bodyType?: string;
  yearFrom?: number;
  yearTo?: number;
  price: number;
  imageSrc?: string;
}

// Funkcja do pobierania produktów (dywaników)
const fetchMats = async (brandSlug: string): Promise<Mat[]> => {
  try {
    const response = await fetch(`/api/mats?brandSlug=${encodeURIComponent(brandSlug)}&isActive=true`);
    if (!response.ok) {
      console.warn(`API mats returned ${response.status} for brand ${brandSlug}, using empty array as fallback`);
      return [];
    }
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.warn('Error fetching mats, using fallback:', error);
    return [];
  }
};

interface BrandProductsSectionProps {
  brandSlug: string;
}

export default function BrandProductsSection({ brandSlug }: BrandProductsSectionProps) {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedBodyType, setSelectedBodyType] = useState<string | null>(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    bodyTypes: [],
    yearRanges: [],
  });

  const brandInfo = getBrandInfo(brandSlug);
  
  // Normalizuj nazwę marki dla API - użyj mapowania lub fallback do nazwy z URL
  const brandApiName = brandInfo 
    ? brandInfo.apiName 
    : brandSlug.charAt(0).toUpperCase() + brandSlug.slice(1).toLowerCase();

  // Jeśli nie ma mapowania, spróbuj użyć nazwy z URL jako fallback
  const currentBrand = brandInfo || {
    displayName: brandSlug.charAt(0).toUpperCase() + brandSlug.slice(1),
    logo: `/images/products/${brandSlug}.png`,
    apiName: brandApiName,
  };

  // Pobierz modele dla marki
  const {
    data: carModels = [],
    isLoading: loadingModels,
    error: modelsError,
  } = useQuery({
    queryKey: ["car-models", brandApiName],
    queryFn: () => fetchCarModels(brandApiName),
    enabled: !!brandSlug && !!brandApiName,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
  });

  // Pobierz produkty (dywaniki) dla marki
  const {
    data: mats = [],
    isLoading: loadingMats,
    error: matsError,
  } = useQuery({
    queryKey: ["mats", brandSlug],
    queryFn: () => fetchMats(brandSlug),
    enabled: !!brandSlug,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
  });

  // Przygotuj produkty do wyświetlenia - grupuj po modelu, generacji, typie nadwozia
  const displayProducts = useMemo(() => {
    const productsMap = new Map<string, ProductDisplayItem>();

    // Jeśli mamy produkty (mats), użyj ich
    if (mats.length > 0) {
      mats.forEach((mat) => {
        const key = `${mat.carModelSlug}-${mat.generation || ""}-${mat.bodyType || ""}`;
        
        if (!productsMap.has(key)) {
          productsMap.set(key, {
            id: mat.id,
            brand: currentBrand?.displayName || brandSlug,
            model: mat.carModelSlug,
            generation: mat.generation,
            bodyType: mat.bodyType,
            yearFrom: mat.yearFrom,
            yearTo: mat.yearTo,
            price: mat.basePrice,
            imageSrc: undefined, // Będzie ustawione później z bazy danych
          });
        } else {
          // Aktualizuj cenę jeśli jest niższa
          const existing = productsMap.get(key)!;
          if (mat.basePrice < existing.price) {
            existing.price = mat.basePrice;
          }
        }
      });
    } else {
      // Jeśli nie ma produktów, użyj modeli z carModels
      carModels.forEach((model: any) => {
        if (model.generations && model.generations.length > 0) {
          model.generations.forEach((gen: any) => {
            const key = `${model.model}-${gen.generation || ""}-${gen.bodyType || ""}`;
            if (!productsMap.has(key)) {
              productsMap.set(key, {
                id: `${model.brand}-${model.model}-${gen.generation || ""}`,
                brand: currentBrand?.displayName || brandSlug,
                model: model.model,
                generation: gen.generation,
                bodyType: gen.bodyType,
                yearFrom: gen.yearFrom,
                yearTo: gen.yearTo,
                price: 150, // Domyślna cena
                imageSrc: undefined, // Będzie ustawione później z bazy danych
              });
            }
          });
        }
      });
    }

    return Array.from(productsMap.values());
  }, [mats, carModels, currentBrand, brandSlug]);

  // Przygotuj zapytania o zdjęcia produktów dla każdego unikalnego produktu
  const uniqueProductQueries = useMemo(() => {
    const queries: Array<{
      brandForImage: string;
      modelForImage: string;
      yearForImage: number | undefined;
      generation: string | undefined;
      bodyType: string | undefined;
      productKey: string;
    }> = [];

    displayProducts.forEach((product) => {
      // Normalizuj nazwę marki dla API
      const brandForImage = brandInfo?.apiName || brandSlug.charAt(0).toUpperCase() + brandSlug.slice(1);
      const modelForImage = product.model;
      const yearForImage = product.yearFrom;
      const generation = product.generation && product.generation.trim() && !product.generation.includes('+') 
        ? product.generation 
        : undefined;
      const bodyType = product.bodyType;
      const productKey = `${product.model}-${product.generation || ""}-${product.bodyType || ""}`;

      // Sprawdź czy już nie ma takiego zapytania
      if (!queries.find(q => q.productKey === productKey)) {
        queries.push({
          brandForImage,
          modelForImage,
          yearForImage,
          generation,
          bodyType,
          productKey,
        });
      }
    });

    return queries;
  }, [displayProducts, brandInfo, brandSlug]);

  // Pobierz zdjęcia dla każdego unikalnego produktu
  const imageQueries = useQueries({
    queries: uniqueProductQueries.map((product) => ({
      queryKey: ['mat-product-images', product.brandForImage, product.modelForImage, product.yearForImage, product.generation, product.bodyType],
      queryFn: async () => {
        const searchParams = new URLSearchParams();
        if (product.brandForImage) searchParams.set('brand', product.brandForImage);
        if (product.modelForImage) searchParams.set('model', product.modelForImage);
        if (product.yearForImage) searchParams.set('year', product.yearForImage.toString());
        if (product.generation) searchParams.set('generation', product.generation);
        if (product.bodyType) searchParams.set('bodyType', product.bodyType);
        
        const url = `/api/mat-product-images?${searchParams.toString()}`;
        const data = await apiGet<{ images: Array<{ image_url: string; [key: string]: any }>; count: number }>(url);
        
        return { 
          productKey: product.productKey,
          images: data.images || [] 
        };
      },
      enabled: !!product.brandForImage && !!product.modelForImage,
      staleTime: 10 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    })),
  });

  // Stwórz mapę zdjęć dla każdego produktu
  const imagesMap = useMemo(() => {
    const map = new Map<string, string>();
    
    imageQueries.forEach((query) => {
      if (query.data?.images && query.data.images.length > 0) {
        // Użyj pierwszego dostępnego zdjęcia
        const imageUrl = query.data.images[0].image_url;
        map.set(query.data.productKey, imageUrl);
      }
    });
    
    return map;
  }, [imageQueries]);

  // Zaktualizuj produkty z zdjęciami
  const productsWithImages = useMemo(() => {
    return displayProducts.map((product) => {
      const productKey = `${product.model}-${product.generation || ""}-${product.bodyType || ""}`;
      const imageUrl = imagesMap.get(productKey);
      
      return {
        ...product,
        imageSrc: imageUrl || currentBrand?.logo, // Użyj zdjęcia produktu lub logo marki jako fallback
      };
    });
  }, [displayProducts, imagesMap, currentBrand]);

  const {
    availableBodyTypes,
    availableYearRanges,
    availableModels,
    filteredProducts,
    activeFiltersCount,
  } = useProductSelectionFilters({
    products: productsWithImages,
    filters,
    selectedModel,
    selectedBodyType,
  });

  // Obsługa filtrów
  const handleBodyTypeChange = (bodyType: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      bodyTypes: checked
        ? [...prev.bodyTypes, bodyType]
        : prev.bodyTypes.filter((bt) => bt !== bodyType),
    }));
  };

  const handleYearRangeChange = (yearRange: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      yearRanges: checked
        ? [...prev.yearRanges, yearRange]
        : prev.yearRanges.filter((yr) => yr !== yearRange),
    }));
  };

  const clearFilters = () => {
    setFilters({
      bodyTypes: [],
      yearRanges: [],
    });
  };

  // Obsługa stanu ładowania
  if (loadingModels || loadingMats) {
    return (
      <section className="py-8 md:py-12 bg-black relative overflow-hidden">
        {/* Animowane tło */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-black to-red-800/5"></div>
        <div className="container mx-auto px-4">
          <div className="min-h-screen bg-black flex items-center justify-center relative z-10">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-red-500 animate-spin mx-auto mb-4" />
              <div className="text-white text-xl">Ładowanie produktów...</div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Jeśli nie ma ani modeli ani produktów, pokaż komunikat
  if (!loadingModels && !loadingMats && carModels.length === 0 && mats.length === 0) {
    return (
      <section className="py-8 md:py-12 bg-black">
        <div className="container mx-auto px-4">
          <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-6">🚗</div>
              <h2 className="text-2xl font-bold text-white mb-4">Brak dostępnych produktów</h2>
              <p className="text-gray-400 mb-6">
                Nie znaleziono produktów dla marki <span className="text-white font-semibold">{currentBrand.displayName}</span>.
                <br />
                Możliwe, że produkty dla tej marki są w trakcie dodawania.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/dywaniki" 
                  className="inline-flex items-center justify-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                >
                  ← Wróć do wyboru marki
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Hero Header */}
      <div className="relative bg-[#0a0a0a] border-b border-white/5 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-red-600/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/dywaniki" className="hover:text-white transition-colors">Dywaniki</Link>
            <span>/</span>
            <span className="text-white">{currentBrand.displayName}</span>
          </nav>
          
          <div className="max-w-3xl">
            <div className="flex items-center gap-6 mb-6">
              {currentBrand.logo && (
                <div className="w-20 h-20 relative">
                  <Image
                    src={currentBrand.logo}
                    alt={`${currentBrand.displayName} logo`}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              DYWANIKI <span className="text-red-600">{currentBrand.displayName.toUpperCase()}</span>
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed">
              Precyzyjnie dopasowane dywaniki samochodowe EVA Premium dla modeli {currentBrand.displayName}. Najwyższa jakość materiałów, precyzyjne dopasowanie i trwałość na lata.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mb-6">
            <Button 
              onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
              variant="outline" 
              className="w-full flex items-center justify-between border-white/20 bg-transparent text-white hover:bg-white/5"
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Filtry
              </span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="bg-red-600 text-white hover:bg-red-700 border-none">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Sidebar Filters */}
          <aside className={`
            lg:w-72 shrink-0 space-y-8
            ${isMobileFiltersOpen ? 'block' : 'hidden lg:block'}
          `}>
            <div className="sticky top-24 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Filtrowanie</h3>
                {activeFiltersCount > 0 && (
                  <button 
                    onClick={() => {
                      clearFilters();
                      setSelectedModel(null);
                      setSelectedBodyType(null);
                    }}
                    className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
                  >
                    WYCZYŚĆ
                  </button>
                )}
              </div>

              {/* Typ nadwozia */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Typ nadwozia</h4>
                <div className="space-y-3">
                  {availableBodyTypes.map(({ key, label, count }) => (
                    <div key={key} className="flex items-center space-x-3 group">
                      <Checkbox
                        id={`bodyType-${key}`}
                        checked={filters.bodyTypes.includes(key)}
                        onCheckedChange={(checked) =>
                          handleBodyTypeChange(key, checked as boolean)
                        }
                        className="border-white/20 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                      />
                      <Label
                        htmlFor={`bodyType-${key}`}
                        className="text-gray-300 group-hover:text-white cursor-pointer transition-colors font-medium"
                      >
                        {label} ({count})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="bg-white/10" />

              {/* Rok produkcji */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Rok produkcji</h4>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {availableYearRanges.map(({ range, count }) => (
                    <div key={range} className="flex items-center space-x-3 group">
                      <Checkbox
                        id={`yearRange-${range}`}
                        checked={filters.yearRanges.includes(range)}
                        onCheckedChange={(checked) =>
                          handleYearRangeChange(range, checked as boolean)
                        }
                        className="border-white/20 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                      />
                      <Label
                        htmlFor={`yearRange-${range}`}
                        className="text-gray-300 group-hover:text-white cursor-pointer transition-colors"
                      >
                        {range} ({count})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
              <p className="text-gray-400">
                Znaleziono <span className="text-white font-semibold">{filteredProducts.length}</span> produktów
              </p>
            </div>

            {/* Loading State */}
            {(loadingModels || loadingMats) ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-[400px] bg-white/5 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => {
                const configuratorUrl = `/konfigurator?brand=${encodeURIComponent(brandSlug)}&model=${encodeURIComponent(product.model.toLowerCase())}${product.generation ? `&generation=${encodeURIComponent(product.generation)}` : ""}${product.bodyType ? `&bodyType=${encodeURIComponent(product.bodyType)}` : ""}`;

                return (
                  <article
                    key={product.id}
                    className="bg-[#111] rounded-xl border border-white/5 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group"
                  >
                    {/* Obraz produktu */}
                    <div className="relative w-full h-48 bg-neutral-800/50">
                      {product.imageSrc ? (
                        <Image
                          src={product.imageSrc}
                          alt={`${product.brand} ${product.model}`}
                          fill
                          className="object-contain p-4"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Car className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Informacje o produkcie */}
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                        {product.brand} {product.model}
                        {product.generation && ` (${product.generation})`}
                      </h3>
                      
                      <div className="text-sm text-gray-400 mb-2">
                        {product.yearFrom && product.yearTo && (
                          <p>{product.yearFrom}-{product.yearTo} rok</p>
                        )}
                        {product.bodyType && (
                          <p className="uppercase">{formatBodyTypeLabel(product.bodyType)}</p>
                        )}
                      </div>

                      <p className="text-2xl font-bold text-red-600 mb-4">
                        Od {product.price.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł
                      </p>

                      {/* Przycisk */}
                      <Link href={configuratorUrl}>
                        <Button
                          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                          size="lg"
                        >
                          WYBIERZ KOLORY I ZESTAW
                        </Button>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>

                {/* Empty State */}
                {filteredProducts.length === 0 && (
                  <div className="py-20 text-center border border-dashed border-white/10 rounded-xl">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-white mb-2">Nie znaleziono produktów</h3>
                    <p className="text-gray-400 max-w-md mx-auto mb-6">
                      Spróbuj zmienić kryteria wyszukiwania lub usuń filtry, aby zobaczyć więcej wyników.
                    </p>
                    <Button 
                      onClick={() => {
                        clearFilters();
                        setSelectedModel(null);
                        setSelectedBodyType(null);
                      }} 
                      variant="secondary"
                    >
                      Wyczyść wszystkie filtry
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
