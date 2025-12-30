"use client";

import { useState, useMemo, useEffect } from "react";
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
import { getBrandInfo, normalizeBrandName } from '@/shared/brands';
import { fetchCarModels } from '@/lib/api/models';
import { apiGet } from '@/lib/api/client';

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

// Mapowanie typów nadwozia na podstawowe kategorie
const normalizeBodyType = (bodyType: string): string => {
  if (!bodyType) return '';
  
  const normalized = bodyType.toLowerCase().trim();
  
  // Normalizacja do podstawowych typów nadwozia
  if (normalized.includes('hatchback') || normalized.includes('hatch')) {
    return 'hatchback';
  }
  if (normalized.includes('suv')) {
    return 'suv';
  }
  if (normalized.includes('sedan')) {
    return 'sedan';
  }
  if (normalized.includes('kombi') || normalized.includes('estate') || normalized.includes('wagon')) {
    return 'kombi';
  }
  if (normalized.includes('minivan') || normalized.includes('mpv')) {
    return 'minivan';
  }
  if (normalized.includes('van') || normalized.includes('dostawczak')) {
    return 'van';
  }
  if (normalized.includes('coupe')) {
    return 'coupe';
  }
  if (normalized.includes('cabrio') || normalized.includes('convertible')) {
    return 'kabriolet';
  }
  if (normalized.includes('roadster')) {
    return 'roadster';
  }
  if (normalized.includes('fastback')) {
    return 'fastback';
  }
  if (normalized.includes('liftback')) {
    return 'liftback';
  }
  if (normalized.includes('shooting brake')) {
    return 'shooting brake';
  }
  
  // Fallback - zwróć znormalizowaną wersję
  return normalized;
};

// Mapowanie znormalizowanych typów nadwozia na polskie nazwy wyświetlane
const bodyTypeDisplayNames: Record<string, string> = {
  'sedan': 'Sedan',
  'suv': 'SUV',
  'hatchback': 'Hatchback',
  'kombi': 'Kombi',
  'minivan': 'Minivan',
  'van': 'Van',
  'coupe': 'Coupe',
  'kabriolet': 'Kabriolet',
  'roadster': 'Roadster',
  'fastback': 'Fastback',
  'liftback': 'Liftback',
  'shooting brake': 'Shooting Brake',
};

function formatBodyType(bodyType: string): string {
  const normalized = normalizeBodyType(bodyType);
  return bodyTypeDisplayNames[normalized] || normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

// Funkcja do pobierania produktów (dywaników)
const fetchMats = async (brandSlug: string): Promise<Mat[]> => {
  try {
    const response = await fetch(`/api/mats?brandSlug=${encodeURIComponent(brandSlug)}&isActive=true`);
    if (!response.ok) {
      // Jeśli błąd 500 lub inny, zwróć pustą tablicę zamiast rzucać błąd
      console.warn(`API mats returned ${response.status} for brand ${brandSlug}, using empty array as fallback`);
      return [];
    }
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    // W przypadku błędu zwróć pustą tablicę - komponent użyje fallback do carModels
    console.warn('Error fetching mats, using fallback:', error);
    return [];
  }
};

interface ProductSelectionSectionProps {
  params: Promise<{ brand: string }>;
}

export default function ProductSelectionSection({ params }: ProductSelectionSectionProps) {
  const [brand, setBrand] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedBodyType, setSelectedBodyType] = useState<string | null>(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    bodyTypes: [],
    yearRanges: [],
  });

  // Pobierz brand z params
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setBrand(resolvedParams.brand);
    };
    getParams();
  }, [params]);

  const brandSlug = brand.toLowerCase();
  const brandInfo = getBrandInfo(brandSlug);
  
  // Normalizuj nazwę marki dla API - użyj mapowania lub fallback do nazwy z URL
  const brandApiName = brandInfo 
    ? brandInfo.apiName 
    : brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase();

  // Jeśli nie ma mapowania, spróbuj użyć nazwy z URL jako fallback
  const currentBrand = brandInfo || {
    displayName: brand.charAt(0).toUpperCase() + brand.slice(1),
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
    enabled: !!brand && !!brandApiName,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false, // Nie próbuj ponownie przy błędzie - użyj fallback
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
    retry: false, // Nie próbuj ponownie przy błędzie - użyj fallback
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
            brand: currentBrand?.displayName || brand,
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
                brand: currentBrand?.displayName || brand,
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
  }, [mats, carModels, currentBrand, brand]);

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
      const brandForImage = brandInfo?.apiName || brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase();
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
  }, [displayProducts, brandInfo, brand]);

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

  // Dostępne typy nadwozia z liczbą produktów (znormalizowane do podstawowych typów)
  const availableBodyTypes = useMemo(() => {
    const bodyTypeCounts = new Map<string, number>();
    
    productsWithImages.forEach((product) => {
      if (product.bodyType) {
        const normalizedType = normalizeBodyType(product.bodyType);
        if (normalizedType) {
          const count = bodyTypeCounts.get(normalizedType) || 0;
          bodyTypeCounts.set(normalizedType, count + 1);
        }
      }
    });

    // Sortuj według kolejności podstawowych typów
    const order = ['sedan', 'hatchback', 'kombi', 'suv', 'minivan', 'van', 'coupe', 'kabriolet', 'roadster', 'fastback', 'liftback', 'shooting brake'];
    return Array.from(bodyTypeCounts.entries())
      .map(([bodyType, count]) => ({ bodyType, count }))
      .sort((a, b) => {
        const indexA = order.indexOf(a.bodyType);
        const indexB = order.indexOf(b.bodyType);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.bodyType.localeCompare(b.bodyType);
      });
  }, [productsWithImages]);

  // Dostępne zakresy lat z liczbą produktów
  const availableYearRanges = useMemo(() => {
    const yearRangeCounts = new Map<string, number>();

    productsWithImages.forEach((product) => {
      if (product.yearFrom && product.yearTo) {
        const range = `${product.yearFrom}-${product.yearTo}`;
        const count = yearRangeCounts.get(range) || 0;
        yearRangeCounts.set(range, count + 1);
      }
    });

    return Array.from(yearRangeCounts.entries())
      .map(([range, count]) => ({ range, count }))
      .sort((a, b) => {
        const aStart = parseInt(a.range.split("-")[0]);
        const bStart = parseInt(b.range.split("-")[0]);
        return bStart - aStart; // Sortuj od najnowszych
      });
  }, [productsWithImages]);

  // Wyodrębnij unikalne kombinacje modelu i typu nadwozia z produktów (użyj znormalizowanych typów)
  const availableModels = useMemo(() => {
    const modelBodyTypeMap = new Map<string, { model: string; bodyType: string; count: number }>();
    productsWithImages.forEach((product) => {
      const modelName = product.model;
      const normalizedBodyType = product.bodyType ? normalizeBodyType(product.bodyType) : 'universal';
      const key = `${modelName}-${normalizedBodyType}`;
      
      if (!modelBodyTypeMap.has(key)) {
        modelBodyTypeMap.set(key, {
          model: modelName,
          bodyType: normalizedBodyType,
          count: 1
        });
      } else {
        const existing = modelBodyTypeMap.get(key)!;
        existing.count += 1;
      }
    });
    
    return Array.from(modelBodyTypeMap.values())
      .sort((a, b) => {
        // Sortuj najpierw po modelu, potem po typie nadwozia
        if (a.model !== b.model) {
          return a.model.localeCompare(b.model);
        }
        return a.bodyType.localeCompare(b.bodyType);
      });
  }, [productsWithImages]);

  // Filtrowanie produktów
  const filteredProducts = useMemo(() => {
    let filtered = productsWithImages;

    // Filtrowanie według wybranego modelu i typu nadwozia (użyj znormalizowanych typów)
    if (selectedModel && selectedBodyType) {
      filtered = filtered.filter(
        (product) => {
          if (product.model !== selectedModel) return false;
          if (!product.bodyType) return false;
          const normalizedProductType = normalizeBodyType(product.bodyType);
          const normalizedSelectedType = normalizeBodyType(selectedBodyType);
          return normalizedProductType === normalizedSelectedType;
        }
      );
    } else if (selectedModel) {
      // Jeśli wybrano tylko model (bez typu nadwozia), pokaż wszystkie warianty tego modelu
      filtered = filtered.filter((product) => product.model === selectedModel);
    }

    // Filtrowanie według typu nadwozia (dodatkowe filtry) - użyj znormalizowanych typów
    if (filters.bodyTypes.length > 0) {
      filtered = filtered.filter(
        (product) => {
          if (!product.bodyType) return false;
          const normalizedType = normalizeBodyType(product.bodyType);
          return filters.bodyTypes.includes(normalizedType);
        }
      );
    }

    // Filtrowanie według zakresu lat
    if (filters.yearRanges.length > 0) {
      filtered = filtered.filter((product) => {
        if (!product.yearFrom || !product.yearTo) return false;
        const productRange = `${product.yearFrom}-${product.yearTo}`;
        return filters.yearRanges.includes(productRange);
      });
    }

    return filtered;
  }, [productsWithImages, selectedModel, selectedBodyType, filters]);

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
  if (!brand) {
    return (
      <section className="py-8 md:py-12 bg-neutral-950">
        <div className="container mx-auto px-4">
          <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-red-500 animate-spin mx-auto mb-4" />
              <div className="text-white text-xl">Ładowanie...</div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (loadingModels || loadingMats) {
    return (
      <section className="py-8 md:py-12 bg-neutral-950 relative overflow-hidden">
        {/* Animowane tło */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-black to-red-800/5"></div>
        <div className="container mx-auto px-4">
          <div className="min-h-screen bg-neutral-950 flex items-center justify-center relative z-10">
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
  // Ale tylko jeśli nie ładują się dane (nie podczas ładowania)
  if (!loadingModels && !loadingMats && carModels.length === 0 && mats.length === 0) {
    return (
      <section className="py-8 md:py-12 bg-neutral-950">
        <div className="container mx-auto px-4">
          <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
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
                <Link 
                  href="/modele" 
                  className="inline-flex items-center justify-center px-6 py-3 border border-white/20 hover:bg-white/5 text-white font-semibold rounded-lg transition-colors"
                >
                  Zobacz wszystkie modele
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const activeFiltersCount = filters.bodyTypes.length + filters.yearRanges.length + (selectedModel ? 1 : 0);

  return (
    <div className="min-h-screen bg-neutral-950 text-white pb-20">
      {/* Hero Header */}
      <div className="relative bg-[#0a0a0a] border-b border-white/5 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-red-600/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
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
                  {availableBodyTypes.map(({ bodyType, count }) => (
                    <div key={bodyType} className="flex items-center space-x-3 group">
                      <Checkbox
                        id={`bodyType-${bodyType}`}
                        checked={filters.bodyTypes.includes(bodyType)}
                        onCheckedChange={(checked) =>
                          handleBodyTypeChange(bodyType, checked as boolean)
                        }
                        className="border-white/20 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                      />
                      <Label
                        htmlFor={`bodyType-${bodyType}`}
                        className="text-gray-300 group-hover:text-white cursor-pointer transition-colors font-medium"
                      >
                        {formatBodyType(bodyType)} ({count})
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
                    className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group"
                  >
                    {/* Obraz produktu */}
                    <div className="relative w-full h-48 bg-gray-100">
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
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {product.brand} {product.model}
                        {product.generation && ` (${product.generation})`}
                      </h3>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        {product.yearFrom && product.yearTo && (
                          <p>{product.yearFrom}-{product.yearTo} rok</p>
                        )}
                        {product.bodyType && (
                          <p className="uppercase">{formatBodyType(product.bodyType)}</p>
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

