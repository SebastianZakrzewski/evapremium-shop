"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useQuery, useQueries } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { Model, Brand } from "@/entities/car";
import { getAllModels, brands } from "../data/carouselData";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { CarModel } from "../lib/types/car-model";
import { BrandGridCard } from "./ui/BrandGridCard";
import { fetchBrands, getFallbackBrands } from "@/lib/api/brands";
import { fetchCarModels } from "@/lib/api/models";
import { getBrandInfo, normalizeBrandName } from "@/shared/brands";
import { apiGet } from "@/lib/api/client";
import { Car, Loader2, SlidersHorizontal, X } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface FilterState {
  bodyTypes: string[];
  generations: string[];
}

/**
 * Normalizuje typ nadwozia do podstawowego typu (usuwa szczegóły jak "5drzwi", "3/5drzwi" itp.)
 */
function normalizeBodyType(bodyType: string): string {
  if (!bodyType) return '';
  
  const normalized = bodyType.toLowerCase().trim();
  
  // Normalizacja do podstawowych typów nadwozia
  if (normalized.includes('hatchback') || normalized.includes('hatch')) {
    return 'Hatchback';
  }
  if (normalized.includes('suv')) {
    return 'SUV';
  }
  if (normalized.includes('sedan')) {
    return 'Sedan';
  }
  if (normalized.includes('kombi') || normalized.includes('estate') || normalized.includes('wagon')) {
    return 'Kombi';
  }
  if (normalized.includes('minivan') || normalized.includes('mpv')) {
    return 'Minivan';
  }
  if (normalized.includes('van') || normalized.includes('dostawczak')) {
    return 'Van';
  }
  if (normalized.includes('coupe')) {
    return 'Coupe';
  }
  if (normalized.includes('cabrio') || normalized.includes('convertible')) {
    return 'Kabriolet';
  }
  if (normalized.includes('roadster')) {
    return 'Roadster';
  }
  if (normalized.includes('fastback')) {
    return 'Fastback';
  }
  if (normalized.includes('liftback')) {
    return 'Liftback';
  }
  if (normalized.includes('shooting brake')) {
    return 'Shooting Brake';
  }
  
  // Fallback - zwróć z pierwszą literą wielką
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

/**
 * Mapuje typ nadwozia na liczbę drzwi
 */
function getDoorsCount(bodyType: string): string {
  const bodyTypeLower = bodyType.toLowerCase();
  if (bodyTypeLower.includes('hatchback') || bodyTypeLower.includes('sedan') || bodyTypeLower.includes('wagon')) {
    return '5';
  }
  if (bodyTypeLower.includes('coupe') || bodyTypeLower.includes('convertible')) {
    return '3';
  }
  if (bodyTypeLower.includes('suv') || bodyTypeLower.includes('pickup') || bodyTypeLower.includes('van')) {
    return '5';
  }
  return '5'; // Domyślnie 5 drzwi
}

/**
 * Formatuje typ silnika na podstawie nazwy modelu lub zwraca domyślną wartość
 */
function getEngineType(modelName: string, brand: string): string {
  const nameLower = modelName.toLowerCase();
  const brandLower = brand.toLowerCase();
  
  // Sprawdź czy model jest elektryczny
  if (nameLower.includes('electric') || nameLower.includes('ev') || nameLower.includes('e-') || 
      nameLower.includes('spring') || nameLower.includes('tesla') || nameLower.includes('id.')) {
    return 'Electro';
  }
  
  // Sprawdź czy model jest hybrydowy
  if (nameLower.includes('hybrid') || nameLower.includes('phev') || nameLower.includes('plug-in')) {
    return 'Hybrid';
  }
  
  // Domyślnie - można rozszerzyć o więcej logiki
  return 'Electro'; // Dla większości nowoczesnych modeli
}

/**
 * Formatuje generację na podstawie lat produkcji
 * Zwraca zakres lat (np. "2021-2025") lub "rocznik+" (np. "2021+")
 */
function formatGeneration(
  generation: string | null | undefined,
  yearFrom?: number,
  yearTo?: number
): string {
  // Jeśli mamy zakres lat, użyj go
  if (yearFrom && yearTo) {
    // Jeśli rok końcowy jest w przyszłości lub bardzo duży, użyj formatu "rocznik+"
    const currentYear = new Date().getFullYear();
    if (yearTo >= currentYear || yearTo - yearFrom > 10) {
      return `${yearFrom}+`;
    }
    // W przeciwnym razie użyj zakresu lat
    return `${yearFrom}-${yearTo}`;
  }
  
  // Jeśli mamy tylko rok początkowy
  if (yearFrom) {
    return `${yearFrom}+`;
  }
  
  // Jeśli mamy generację jako string, spróbuj wyciągnąć rok
  if (generation && generation.trim() !== '') {
    const genTrimmed = generation.trim();
    
    // Jeśli generacja zawiera "+", użyj formatu "rocznik+"
    if (genTrimmed.includes('+')) {
      const match = genTrimmed.match(/^(\d{4})/);
      if (match) {
        return `${match[1]}+`;
      }
    }
    
    // Jeśli generacja jest rokiem (4 cyfry), użyj formatu "rocznik+"
    if (/^\d{4}$/.test(genTrimmed)) {
      return `${genTrimmed}+`;
    }
  }
  
  return '';
}

export default function CarModelsSection() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const brandParam = searchParams.get('brand');
  
  // Określ bazową ścieżkę na podstawie aktualnej lokalizacji
  const basePath = useMemo(() => {
    // Jeśli jesteśmy na stronie /dywaniki, użyj /dywaniki
    if (pathname?.startsWith('/dywaniki')) {
      return '/dywaniki';
    }
    // W przeciwnym razie użyj /modele
    return '/modele';
  }, [pathname]);
  
  // Fallback do statycznych danych
  const allModels = getAllModels();
  
  // Stan dla klikniętej marki
  const [clickedBrandId, setClickedBrandId] = useState<number | null>(null);
  
  // Stan filtrów
  const [filters, setFilters] = useState<FilterState>({
    bodyTypes: [],
    generations: []
  });

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Pobierz marki dla sekcji wyboru marek
  const { data: availableBrands = getFallbackBrands(), isLoading: loadingBrands } = useQuery({
    queryKey: ['car-brands'],
    queryFn: fetchBrands,
    staleTime: 10 * 60 * 1000, // 10 minut
    gcTime: 30 * 60 * 1000, // 30 minut cache
    retry: 2,
    retryDelay: 1000,
  });

  // Handler kliknięcia marki
  const handleBrandClick = useCallback((brand: Brand) => {
    setClickedBrandId(brand.id);
    
    // Animacja kliknięcia - reset po 300ms
    setTimeout(() => {
      setClickedBrandId(null);
      // Przekierowanie do strony z modelami dla danej marki (używamy query parameter)
      router.push(`${basePath}?brand=${encodeURIComponent(brand.name)}`);
    }, 300);
  }, [router, basePath]);

  // Pobierz informacje o marce
  const brandSlug = brandParam ? brandParam.toLowerCase().trim() : '';
  const brandInfo = brandSlug ? getBrandInfo(brandSlug) : null;
  
  // Użyj normalizeBrandName jako fallback jeśli getBrandInfo nie znajdzie mapowania
  const brandApiName = useMemo(() => {
    if (brandInfo?.apiName) {
      console.log(`🔍 CarModelsSection: Found brand info for "${brandParam}" -> apiName: "${brandInfo.apiName}"`);
      return brandInfo.apiName;
    }
    
    if (brandSlug) {
      const normalized = normalizeBrandName(brandSlug);
      if (normalized) {
        console.log(`🔍 CarModelsSection: Normalized "${brandSlug}" -> "${normalized}"`);
        return normalized;
      }
    }
    
    // Fallback - użyj pierwszą literę wielką
    const fallback = brandParam 
      ? brandParam.charAt(0).toUpperCase() + brandParam.slice(1).toLowerCase()
      : '';
    console.log(`⚠️ CarModelsSection: No mapping found for "${brandParam}", using fallback: "${fallback}"`);
    return fallback;
  }, [brandParam, brandSlug, brandInfo]);

  // Użyj React Query do cache'owania modeli
  const { data: apiModels = [], isLoading: loading, error: modelsError } = useQuery({
    queryKey: ['car-models', brandApiName],
    queryFn: () => {
      if (!brandApiName) {
        console.warn('🔍 CarModelsSection: No brandApiName, returning empty array');
        return Promise.resolve([]);
      }
      console.log(`🔍 CarModelsSection: Fetching models for brandApiName: "${brandApiName}"`);
      return fetchCarModels(brandApiName);
    },
    enabled: !!brandParam && !!brandApiName,
    staleTime: 5 * 60 * 1000, // 5 minut
    gcTime: 10 * 60 * 1000, // 10 minut cache
  });

  // Debug logowanie
  useEffect(() => {
    if (brandParam) {
      console.log('🔍 CarModelsSection Debug:', {
        brandParam,
        brandSlug,
        brandInfo,
        brandApiName,
        apiModelsCount: apiModels.length,
        loading,
        modelsError
      });
    }
  }, [brandParam, brandSlug, brandInfo, brandApiName, apiModels.length, loading, modelsError]);

  // Przygotuj modele do wyświetlenia - API zwraca zgrupowane modele, więc musimy je rozpakować
  const displayModels = useMemo(() => {
    if (!Array.isArray(apiModels) || apiModels.length === 0) {
      return [];
    }

    const models: Array<{
      id: string;
      name: string;
      brand: string;
      bodyType: string;
      yearFrom?: number;
      yearTo?: number;
      imageSrc: string;
      generation: string;
      // Dodatkowe pola do pobierania zdjęć
      brandForImage: string;
      modelForImage: string;
      yearForImage?: number;
    }> = [];

    apiModels.forEach((model: any, modelIndex: number) => {
      // API zwraca zgrupowane modele z tablicą generations
      const modelName = model.model || model.name || `Model ${modelIndex + 1}`;
      const modelBrand = model.brand || brandParam || 'Unknown';
      
      // Jeśli model ma tablicę generations, rozpakuj je
      if (model.generations && Array.isArray(model.generations)) {
        model.generations.forEach((gen: any, genIndex: number) => {
          models.push({
            id: `${modelIndex}-${genIndex}-${gen.bodyType || ''}-${gen.generation || ''}`,
            name: modelName,
            brand: modelBrand,
            bodyType: gen.bodyType || '',
            yearFrom: gen.yearFrom,
            yearTo: gen.yearTo,
            imageSrc: brandInfo?.logo || '/images/products/audi.jpg', // Fallback, będzie nadpisane
            generation: gen.generation || '',
            brandForImage: brandSlug || brandParam?.toLowerCase() || modelBrand?.toLowerCase() || '',
            modelForImage: modelName.toLowerCase(), // Konwertuj na małe litery dla API
            yearForImage: gen.yearFrom, // Użyj pierwszego roku z zakresu
          });
        });
      } else {
        // Fallback dla modeli bez generations (stary format)
        models.push({
          id: `${modelIndex}-${model.id || modelIndex}`,
          name: modelName,
          brand: modelBrand,
          bodyType: model.bodyType || model.bodyTypes?.[0] || '',
          yearFrom: model.yearFrom,
          yearTo: model.yearTo,
          imageSrc: brandInfo?.logo || '/images/products/audi.jpg', // Fallback, będzie nadpisane
          generation: model.generation || '',
            brandForImage: brandSlug || brandParam?.toLowerCase() || modelBrand?.toLowerCase() || '',
            modelForImage: modelName.toLowerCase(), // Konwertuj na małe litery dla API
            yearForImage: model.yearFrom,
        });
      }
    });

    return models;
  }, [apiModels, brandParam, brandInfo]);

  // Pobierz unikalne kombinacje modeli do zapytania o zdjęcia
  const uniqueModelQueries = useMemo(() => {
    const uniqueModels = new Map<string, typeof displayModels[0]>();
    
    displayModels.forEach((model) => {
      // Normalizuj generację - jeśli jest null, undefined, pusty string lub zawiera "+", użyj pustego stringa
      const normalizedGeneration = (model.generation && model.generation.trim() && !model.generation.includes('+')) ? model.generation : '';
      // Klucz: brand-model-year-generation-bodyType (używamy znormalizowanej generacji)
      const key = `${model.brandForImage}-${model.modelForImage}-${model.yearForImage || ''}-${normalizedGeneration}-${model.bodyType || ''}`;
      if (!uniqueModels.has(key)) {
        uniqueModels.set(key, model);
      }
    });
    
    const queries = Array.from(uniqueModels.values());
    
    // Debug logowanie dla Spring
    queries.forEach((model) => {
      if (model.modelForImage?.toLowerCase().includes('spring')) {
        const normalizedGeneration = (model.generation && model.generation.trim() && !model.generation.includes('+')) ? model.generation : '';
        console.log('🔍 CarModelsSection: Unique query for Spring:', {
          name: model.name,
          brandForImage: model.brandForImage,
          modelForImage: model.modelForImage,
          yearForImage: model.yearForImage,
          generation: model.generation,
          normalizedGeneration,
          bodyType: model.bodyType,
          brandParam,
          brandSlug,
        });
      }
    });
    
    return queries;
  }, [displayModels, brandParam, brandSlug]);

  // Pobierz zdjęcia dla każdego unikalnego modelu
  const imageQueries = useQueries({
    queries: uniqueModelQueries.map((model) => ({
      queryKey: ['mat-product-images', model.brandForImage, model.modelForImage, model.yearForImage, model.generation, model.bodyType],
      queryFn: async () => {
        const searchParams = new URLSearchParams();
        if (model.brandForImage) searchParams.set('brand', model.brandForImage);
        if (model.modelForImage) searchParams.set('model', model.modelForImage);
        if (model.yearForImage) searchParams.set('year', model.yearForImage.toString());
        // Nie przekazuj generacji jeśli jest null, undefined, pusty string lub zawiera "+" (np. "2021+")
        // W bazie danych generation jest null dla Dacia Spring
        if (model.generation && model.generation.trim() && !model.generation.includes('+')) {
          searchParams.set('generation', model.generation);
        }
        if (model.bodyType) searchParams.set('bodyType', model.bodyType);
        
        const url = `/api/mat-product-images?${searchParams.toString()}`;
        console.log(`🔍 CarModelsSection: Fetching images for model: ${model.name}, URL: ${url}`);
        
        const data = await apiGet<{ images: Array<{ image_url: string; [key: string]: any }>; count: number }>(url);
        
        // Użyj normalizowanego klucza (bez generacji jeśli jest null lub zawiera "+")
        const normalizedGeneration = (model.generation && model.generation.trim() && !model.generation.includes('+')) ? model.generation : '';
        const modelKey = `${model.brandForImage}-${model.modelForImage}-${model.yearForImage || ''}-${normalizedGeneration}-${model.bodyType || ''}`;
        
        return { 
          modelKey,
          images: data.images || [] 
        };
      },
      enabled: !!model.brandForImage && !!model.modelForImage && !!brandParam,
      // Dodaj logowanie dla Spring
      onSuccess: (data) => {
        if (model.modelForImage?.toLowerCase().includes('spring')) {
          console.log(`✅ CarModelsSection: Successfully fetched images for Spring:`, {
            modelKey: data.modelKey,
            imagesCount: data.images.length,
            images: data.images.map(img => img.image_url),
          });
        }
      },
      onError: (error) => {
        if (model.modelForImage?.toLowerCase().includes('spring')) {
          console.error(`❌ CarModelsSection: Error fetching images for Spring:`, error);
        }
      },
      staleTime: 10 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    })),
  });

  // Stwórz mapę zdjęć dla każdego modelu
  const imagesMap = useMemo(() => {
    const map = new Map<string, string>();
    
    imageQueries.forEach((query, index) => {
      if (query.data?.images && query.data.images.length > 0) {
        // Użyj pierwszego dostępnego zdjęcia
        const imageUrl = query.data.images[0].image_url;
        map.set(query.data.modelKey, imageUrl);
        console.log(`✅ CarModelsSection: Found image for model key "${query.data.modelKey}": ${imageUrl}`);
      } else if (query.isError) {
        console.error(`❌ CarModelsSection: Error fetching images for query ${index}:`, query.error);
      } else if (query.isSuccess && (!query.data?.images || query.data.images.length === 0)) {
        console.warn(`⚠️ CarModelsSection: No images found for model key "${query.data?.modelKey || 'unknown'}"`);
      }
    });
    
    console.log(`📊 CarModelsSection: Images map size: ${map.size}, total queries: ${imageQueries.length}`);
    return map;
  }, [imageQueries]);

  // Mapuj zdjęcia do modeli
  const modelsWithImages = useMemo(() => {
    return displayModels.map((model) => {
      // Normalizuj generację - jeśli jest null, undefined, pusty string lub zawiera "+", użyj pustego stringa
      const normalizedGeneration = (model.generation && model.generation.trim() && !model.generation.includes('+')) ? model.generation : '';
      const modelKey = `${model.brandForImage}-${model.modelForImage}-${model.yearForImage || ''}-${normalizedGeneration}-${model.bodyType || ''}`;
      const imageUrl = imagesMap.get(modelKey);
      
      // Debug logowanie dla wszystkich modeli Spring
      if (model.modelForImage?.toLowerCase().includes('spring')) {
        console.log('🔍 CarModelsSection: Mapping images for Spring model:', {
          modelName: model.name,
          brandForImage: model.brandForImage,
          modelForImage: model.modelForImage,
          yearForImage: model.yearForImage,
          generation: model.generation,
          bodyType: model.bodyType,
          modelKey,
          imageUrl: imageUrl || 'NOT FOUND',
          imagesMapSize: imagesMap.size,
          allKeysInMap: Array.from(imagesMap.keys()),
          imageQueriesStatus: imageQueries.map(q => ({
            isLoading: q.isLoading,
            isError: q.isError,
            isSuccess: q.isSuccess,
            data: q.data?.modelKey,
          })),
        });
      }
      
      return {
        ...model,
        imageSrc: imageUrl || model.imageSrc, // Fallback do logo marki jeśli brak zdjęcia
      };
    });
  }, [displayModels, imagesMap, imageQueries]);

  // Dostępne typy nadwozia (znormalizowane - tylko ogólne typy bez szczegółów jak "5drzwi")
  const availableBodyTypes = useMemo(() => {
    if (brandParam && displayModels.length > 0) {
      const types = new Set<string>();
      displayModels.forEach(model => {
        if (model.bodyType) {
          // Normalizuj typ nadwozia do podstawowego typu (np. "Hatchback 5drzwi" -> "Hatchback")
          const normalizedType = normalizeBodyType(model.bodyType);
          if (normalizedType) {
            types.add(normalizedType);
          }
        }
      });
      return Array.from(types).sort();
    }
    return [];
  }, [displayModels, brandParam]);

  // Dostępne generacje
  const availableGenerations = useMemo(() => {
    if (brandParam && displayModels.length > 0) {
      const generations = new Set<string>();
      displayModels.forEach(model => {
        if (model.generation) {
          generations.add(model.generation);
        }
      });
      return Array.from(generations).sort();
    }
    return [];
  }, [displayModels, brandParam]);

  // Filtrowanie modeli
  const filteredModels = useMemo(() => {
    if (!brandParam || modelsWithImages.length === 0) {
      return [];
    }

    return modelsWithImages.filter(model => {
      // Filtrowanie po typie nadwozia (użyj znormalizowanych typów)
      if (filters.bodyTypes.length > 0) {
        if (!model.bodyType) {
          return false;
        }
        const normalizedModelType = normalizeBodyType(model.bodyType);
        if (!filters.bodyTypes.includes(normalizedModelType)) {
          return false;
        }
      }
      
      // Filtrowanie po generacji
      if (filters.generations.length > 0) {
        if (!model.generation || !filters.generations.includes(model.generation)) {
          return false;
        }
      }

      return true;
    });
  }, [modelsWithImages, filters, brandParam]);

  // Handlery dla filtrów
  const handleBodyTypeChange = (type: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      bodyTypes: checked 
        ? [...prev.bodyTypes, type]
        : prev.bodyTypes.filter(t => t !== type)
    }));
  };

  const handleGenerationChange = (generation: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      generations: checked 
        ? [...prev.generations, generation]
        : prev.generations.filter(g => g !== generation)
    }));
  };

  const clearFilters = () => {
    setFilters({
      bodyTypes: [],
      generations: []
    });
  };

  const activeFiltersCount = filters.bodyTypes.length + filters.generations.length;

  // Jeśli nie ma wybranej marki, pokaż sekcję wyboru marek
  if (!brandParam) {
    return (
      <section className="py-8 md:py-12 bg-neutral-950">
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
              <li className="text-white font-medium">Modele aut</li>
            </ol>
          </nav>

          {/* Header */}
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              WYBIERZ MARKĘ SAMOCHODU
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
              Wybierz markę swojego auta i znajdź precyzyjnie dopasowane dywaniki samochodowe EVA Premium
            </p>
            <div className="mt-6 text-xs md:text-sm text-gray-400 px-4">
              <span className="bg-gray-800/50 px-3 py-2 md:px-4 md:py-2 rounded-full border border-gray-700 inline-block">
                🚗 Dostępne marki: {availableBrands.length} producentów samochodów
              </span>
            </div>
          </div>

          {/* Grid z markami */}
          {loadingBrands ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
              <p className="text-gray-400 mt-4">Ładowanie marek...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {availableBrands.map((brand, index) => (
                <div
                  key={brand.id}
                  className="animate-fade-in"
                  style={{
                    animationDelay: `${index * 0.05}s`,
                  }}
                >
                  <BrandGridCard
                    brand={brand}
                    onClick={handleBrandClick}
                    isClicked={clickedBrandId === brand.id}
                    isPriority={index < 5}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

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
            <Link href={basePath} className="hover:text-white transition-colors">
              {basePath === '/dywaniki' ? 'Dywaniki' : 'Modele aut'}
            </Link>
            {brandParam && (
              <>
                <span>/</span>
                <span className="text-white">{brandInfo?.displayName || brandParam}</span>
              </>
            )}
          </nav>
          
          <div className="max-w-3xl">
            {brandInfo?.logo && (
              <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 relative">
                  <Image
                    src={brandInfo.logo}
                    alt={`${brandInfo.displayName} logo`}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            )}
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              MODELE <span className="text-red-600">{(brandInfo?.displayName || brandParam || '').toUpperCase()}</span>
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed">
              Wybierz model {(brandInfo?.displayName || brandParam)} i spersonalizuj dywaniki samochodowe EVA Premium. Najwyższa jakość materiałów, precyzyjne dopasowanie i trwałość na lata.
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
                    onClick={clearFilters}
                    className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
                  >
                    WYCZYŚĆ
                  </button>
                )}
              </div>

              {/* Typ nadwozia */}
              {availableBodyTypes.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Typ nadwozia</h4>
                  <div className="space-y-3">
                    {availableBodyTypes.map((type) => (
                      <div key={type} className="flex items-center space-x-3 group">
                        <Checkbox
                          id={`bodyType-${type}`}
                          checked={filters.bodyTypes.includes(type)}
                          onCheckedChange={(checked) =>
                            handleBodyTypeChange(type, checked as boolean)
                          }
                          className="border-white/20 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                        />
                        <Label
                          htmlFor={`bodyType-${type}`}
                          className="text-gray-300 group-hover:text-white cursor-pointer transition-colors font-medium"
                        >
                          {type}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {availableBodyTypes.length > 0 && availableGenerations.length > 0 && (
                <Separator className="bg-white/10" />
              )}

              {/* Generacje */}
              {availableGenerations.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Generacja</h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {availableGenerations.map((generation) => (
                      <div key={generation} className="flex items-center space-x-3 group">
                        <Checkbox
                          id={`generation-${generation}`}
                          checked={filters.generations.includes(generation)}
                          onCheckedChange={(checked) =>
                            handleGenerationChange(generation, checked as boolean)
                          }
                          className="border-white/20 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                        />
                        <Label
                          htmlFor={`generation-${generation}`}
                          className="text-gray-300 group-hover:text-white cursor-pointer transition-colors"
                        >
                          {generation}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
              <p className="text-gray-400">
                Znaleziono <span className="text-white font-semibold">{filteredModels.length}</span> modeli
              </p>
              
              {brandParam && (
                <Link 
                  href={basePath} 
                  className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Wyczyść markę
                </Link>
              )}
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="bg-white/5 rounded-xl animate-pulse overflow-hidden flex flex-col">
                    <div className="w-full h-64 md:h-72 bg-white/10" />
                    <div className="p-4 md:p-5 flex-1 flex flex-col">
                      <div className="h-5 bg-white/10 rounded mb-2" />
                      <div className="h-4 bg-white/10 rounded mb-4 flex-1" />
                      <div className="h-10 bg-white/10 rounded mt-auto" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Model Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
                  {filteredModels.map((model) => {
                    const yearParam = model.yearFrom ? `&year=${model.yearFrom}` : '';
                    const configuratorUrl = `/konfigurator?brand=${encodeURIComponent(brandSlug)}&model=${encodeURIComponent(model.name.toLowerCase())}${yearParam}${model.generation ? `&generation=${encodeURIComponent(model.generation)}` : ""}${model.bodyType ? `&bodyType=${encodeURIComponent(model.bodyType)}` : ""}`;

                    return (
                      <article
                        key={model.id}
                        className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group flex flex-col"
                      >
                        {/* Car Model Image */}
                        <div className="relative w-full h-64 md:h-72 bg-gray-100 overflow-hidden">
                          <Image
                            src={model.imageSrc}
                            alt={`Dywaniki do ${model.brand} ${model.name} - Spersonalizowane dywaniki samochodowe`}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, (max-width: 1536px) 25vw, 20vw"
                            priority={parseInt(String(model.id)) <= 6}
                            quality={95}
                          />
                        </div>
                        
                        {/* Car Model Info */}
                        <div className="p-4 md:p-5 flex-1 flex flex-col bg-black">
                          <h3 className="text-base md:text-lg font-semibold text-white mb-3 line-clamp-2">
                            {model.brand} {model.name}
                          </h3>
                          <div className="text-xs md:text-sm text-gray-300 mb-4 flex-1">
                            <p className="leading-relaxed">
                              <span className="text-red-500 font-semibold">od 150.00 zł</span>
                              <span className="mx-2">•</span>
                              {formatGeneration(model.generation, model.yearFrom, model.yearTo) && (
                                <span>{formatGeneration(model.generation, model.yearFrom, model.yearTo)} </span>
                              )}
                              <span>rok </span>
                              <span>{getEngineType(model.name, model.brand)} </span>
                              {model.bodyType && <span className="uppercase">{model.bodyType} </span>}
                              {model.bodyType && <span>{getDoorsCount(model.bodyType)} drzwi</span>}
                            </p>
                          </div>

                          {/* Przycisk do konfiguratora */}
                          <Link href={configuratorUrl} className="mt-auto">
                            <Button
                              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 md:py-2.5 px-2 md:px-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-[10px] md:text-xs leading-tight"
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
                {filteredModels.length === 0 && (
                  <div className="py-20 text-center border border-dashed border-white/10 rounded-xl">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-white mb-2">Nie znaleziono modeli</h3>
                    <p className="text-gray-400 max-w-md mx-auto mb-6">
                      {displayModels.length === 0 
                        ? `Nie znaleziono modeli dla marki ${brandInfo?.displayName || brandParam}. Możliwe, że modele dla tej marki są w trakcie dodawania.`
                        : 'Spróbuj zmienić kryteria wyszukiwania lub usuń filtry, aby zobaczyć więcej wyników.'
                      }
                    </p>
                    {displayModels.length === 0 ? (
                      <Link href={basePath}>
                        <Button variant="secondary">
                          ← Wróć do wyboru marki
                        </Button>
                      </Link>
                    ) : (
                      <Button onClick={clearFilters} variant="secondary">
                        Wyczyść wszystkie filtry
                      </Button>
                    )}
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