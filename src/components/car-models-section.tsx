"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useQuery, useQueries } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { Brand } from "@/entities/car";
import { getAllModels, brands } from "../data/carouselData";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { CarModel } from "../lib/types/car-model";
import { BrandGridCard } from "./ui/BrandGridCard";
import { fetchBrands, getFallbackBrands } from "@/lib/api/brands";
import { fetchCarModels } from "@/lib/api/models";
import { getBrandInfo, normalizeBrandName } from "@/shared/brands";
import { getDoorsCount, formatGenerationLabel } from "@/shared";
import { useCarModelsFilters } from "@/features/brands/hooks";
import { apiGet } from "@/lib/api/client";
import { Car, Loader2, SlidersHorizontal, X, ShoppingCart } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import ModelNavigationBar from "./model-navigation-bar";

interface FilterState {
  bodyTypes: string[];
  generations: string[];
}
  
/**
 * Formatuje typ silnika na podstawie nazwy modelu lub zwraca pusty string jeśli nie można określić
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
  
  // Zwróć pusty string jeśli nie można określić typu silnika
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
  
  // Stan dla wybranego modelu (filtrowanie)
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

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
      return brandInfo.apiName;
    }
    
    if (brandSlug) {
      const normalized = normalizeBrandName(brandSlug);
      if (normalized) {
        return normalized;
      }
    }
    
    // Fallback - użyj pierwszą literę wielką
    const fallback = brandParam 
      ? brandParam.charAt(0).toUpperCase() + brandParam.slice(1).toLowerCase()
      : '';
    return fallback;
  }, [brandParam, brandSlug, brandInfo]);

  // Użyj React Query do cache'owania modeli
  const { data: apiModels = [], isLoading: loading, error: modelsError } = useQuery({
    queryKey: ['car-models', brandApiName],
    queryFn: () => {
      if (!brandApiName) {
        return Promise.resolve([]);
      }
      return fetchCarModels(brandApiName);
    },
    enabled: !!brandParam && !!brandApiName,
    staleTime: 5 * 60 * 1000, // 5 minut
    gcTime: 10 * 60 * 1000, // 10 minut cache
  });

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

    // Map do deduplikacji modeli - klucz: brand-name-bodyType-generation-yearFrom
    const uniqueModelsMap = new Map<string, typeof models[0]>();

    apiModels.forEach((model: any, modelIndex: number) => {
      // API zwraca zgrupowane modele z tablicą generations
      const modelName = model.model || model.name || `Model ${modelIndex + 1}`;
      const modelBrand = model.brand || brandParam || 'Unknown';
      
      // Jeśli model ma tablicę generations, rozpakuj je
      if (model.generations && Array.isArray(model.generations)) {
        model.generations.forEach((gen: any, genIndex: number) => {
          // Utwórz unikalny klucz dla deduplikacji
          const normalizedGeneration = gen.generation || '';
          const uniqueKey = `${modelBrand.toLowerCase()}-${modelName.toLowerCase()}-${gen.bodyType || ''}-${normalizedGeneration}-${gen.yearFrom || ''}`;
          
          // Sprawdź czy model już istnieje
          if (!uniqueModelsMap.has(uniqueKey)) {
            const modelData = {
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
            };
            uniqueModelsMap.set(uniqueKey, modelData);
            models.push(modelData);
          }
        });
      } else {
        // Fallback dla modeli bez generations (stary format)
        const normalizedGeneration = model.generation || '';
        const uniqueKey = `${modelBrand.toLowerCase()}-${modelName.toLowerCase()}-${model.bodyType || model.bodyTypes?.[0] || ''}-${normalizedGeneration}-${model.yearFrom || ''}`;
        
        // Sprawdź czy model już istnieje
        if (!uniqueModelsMap.has(uniqueKey)) {
          const modelData = {
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
          };
          uniqueModelsMap.set(uniqueKey, modelData);
          models.push(modelData);
        }
      }
    });

    return models;
  }, [apiModels, brandParam, brandInfo, brandSlug]);

  // Pobierz unikalne kombinacje modeli do zapytania o zdjęcia
  const uniqueModelQueries = useMemo(() => {
    const uniqueModels = new Map<string, typeof displayModels[0]>();
    
    displayModels.forEach((model) => {
      // Użyj pełnej generacji (włączając "+" jak "2024+") - nie usuwaj jej
      const generation = (model.generation && model.generation.trim()) ? model.generation : '';
      // Normalizuj bodyType do lowercase (jak w bazie danych)
      const normalizedBodyType = (model.bodyType && model.bodyType.trim()) ? model.bodyType.toLowerCase() : '';
      // Klucz: brand-model-year-generation-bodyType (używamy pełnej generacji i znormalizowanego bodyType)
      const key = `${model.brandForImage}-${model.modelForImage}-${model.yearForImage || ''}-${generation}-${normalizedBodyType}`;
      if (!uniqueModels.has(key)) {
        uniqueModels.set(key, model);
      }
    });
    
    return Array.from(uniqueModels.values());
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
        // Przekazuj generację jeśli istnieje (włączając "+" jak "2024+")
        if (model.generation && model.generation.trim()) {
          searchParams.set('generation', model.generation);
        }
        if (model.bodyType) searchParams.set('bodyType', model.bodyType);
        
        const url = `/api/mat-product-images?${searchParams.toString()}`;
        
        const data = await apiGet<{ images: Array<{ image_url: string; [key: string]: any }>; count: number }>(url);
        
        // Użyj pełnej generacji w kluczu (włączając "+")
        const generation = (model.generation && model.generation.trim()) ? model.generation : '';
        // Normalizuj bodyType do lowercase (jak w bazie danych)
        const normalizedBodyType = (model.bodyType && model.bodyType.trim()) ? model.bodyType.toLowerCase() : '';
        const modelKey = `${model.brandForImage}-${model.modelForImage}-${model.yearForImage || ''}-${generation}-${normalizedBodyType}`;
        
        return { 
          modelKey,
          images: data.images || [] 
        };
      },
      enabled: !!model.brandForImage && !!model.modelForImage && !!brandParam,
      staleTime: 10 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    })),
  });

  // Stwórz mapę zdjęć dla każdego modelu
  const imagesMap = useMemo(() => {
    const map = new Map<string, string>();
    
    imageQueries.forEach((query) => {
      if (query.data?.images && query.data.images.length > 0) {
        // Użyj pierwszego dostępnego zdjęcia
        const imageUrl = query.data.images[0].image_url;
        map.set(query.data.modelKey, imageUrl);
      }
    });
    
    return map;
  }, [imageQueries]);

  // Mapuj zdjęcia do modeli
  const modelsWithImages = useMemo(() => {
    return displayModels.map((model) => {
      // Użyj pełnej generacji w kluczu (włączając "+")
      const generation = (model.generation && model.generation.trim()) ? model.generation : '';
      // Normalizuj bodyType do lowercase (jak w bazie danych)
      const normalizedBodyType = (model.bodyType && model.bodyType.trim()) ? model.bodyType.toLowerCase() : '';
      const modelKey = `${model.brandForImage}-${model.modelForImage}-${model.yearForImage || ''}-${generation}-${normalizedBodyType}`;
      const imageUrl = imagesMap.get(modelKey);
      
      return {
        ...model,
        imageSrc: imageUrl || model.imageSrc, // Fallback do logo marki jeśli brak zdjęcia
      };
    });
  }, [displayModels, imagesMap, imageQueries]);

  const {
    availableBodyTypes,
    availableGenerations,
    filteredModels,
    activeFiltersCount,
  } = useCarModelsFilters({
    brandParam,
    displayModels,
    modelsWithImages,
    filters,
    selectedModel,
  });

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
    setSelectedModel(null);
  };

  // Pobierz unikalne nazwy modeli dla nawigacji
  const uniqueModelNames = useMemo(() => {
    if (!brandParam || modelsWithImages.length === 0) {
      return [];
    }
    const modelNames = new Set<string>();
    modelsWithImages.forEach(model => {
      if (model.name) {
        modelNames.add(model.name);
      }
    });
    return Array.from(modelNames).sort();
  }, [modelsWithImages, brandParam]);

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
              <span className="bg-white/5 px-3 py-2 md:px-4 md:py-2 rounded-full border border-white/10 inline-block backdrop-blur-sm">
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
      <div className="relative bg-neutral-950 border-b border-white/5 py-16 md:py-24 overflow-hidden">
        {/* Gradient background – spójny z hero (H1 + opis) na Galeria / O nas */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-neutral-950 to-red-900/5 opacity-50"></div>
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
                <div className="w-20 h-20 relative p-2 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                  <Image
                    src={brandInfo.logo}
                    alt={`${brandInfo.displayName} logo`}
                    fill
                    className="object-contain p-2"
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

      {/* Model Navigation Bar */}
      {uniqueModelNames.length > 0 && (
        <ModelNavigationBar
          models={uniqueModelNames}
          selectedModel={selectedModel}
          onModelSelect={setSelectedModel}
        />
      )}

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
                    {availableBodyTypes.map(({ key, label }) => (
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
                          {label}
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
                  <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pr-2">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredModels.map((model) => {
                    const yearParam = model.yearFrom ? `&year=${model.yearFrom}` : '';
                    const configuratorUrl = `/konfigurator?brand=${encodeURIComponent(brandSlug)}&model=${encodeURIComponent(model.name.toLowerCase())}${yearParam}${model.generation ? `&generation=${encodeURIComponent(model.generation)}` : ""}${model.bodyType ? `&bodyType=${encodeURIComponent(model.bodyType)}` : ""}`;
                    const imageSrc = model.imageSrc || '/vercel.svg';
                    const brandLabel = model.brand || '';

                    return (
                      <article
                        key={model.id}
                        className="group block h-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-neutral-950 rounded-xl"
                      >
                        <div className="h-full flex flex-col bg-[#111] border border-white/5 rounded-xl overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:shadow-red-900/10 hover:-translate-y-1">
                          {/* Car Model Image */}
                          <div className="relative aspect-square bg-gradient-to-br from-gray-900 to-black overflow-hidden">
                            <Image
                              src={imageSrc}
                              alt={`Dywaniki do ${brandLabel} ${model.name} - Spersonalizowane dywaniki samochodowe`}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                              priority={parseInt(String(model.id)) <= 6}
                              quality={90}
                            />
                          </div>
                          
                          {/* Car Model Info */}
                          <div className="flex-1 flex flex-col p-5">
                            <div className="mb-2">
                              <h3 className="text-lg font-bold text-white leading-tight group-hover:text-red-500 transition-colors line-clamp-2">
                                {model.brand} {model.name}
                              </h3>
                            </div>
                            
                            <div className="text-sm text-gray-400 mb-4 flex-1">
                              <div className="flex flex-wrap gap-2">
                                {formatGenerationLabel(model.generation, model.yearFrom, model.yearTo) && (
                                  <span>{formatGenerationLabel(model.generation, model.yearFrom, model.yearTo)}</span>
                                )}
                                {getEngineType(model.name, brandLabel) && (
                                  <span>{getEngineType(model.name, brandLabel)}</span>
                                )}
                                {model.bodyType && <span className="uppercase">{model.bodyType}</span>}
                              </div>
                            </div>

                            <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between gap-3">
                              <div className="flex flex-col">
                                <span className="text-xs text-gray-500">Cena od</span>
                                <span className="text-xl font-bold text-white">
                                  150.00 <span className="text-red-500">PLN</span>
                                </span>
                              </div>

                              {/* Przycisk do konfiguratora */}
                              <Link href={configuratorUrl}>
                                <Button
                                  className="shrink-0 gap-2 transition-all duration-300 bg-white text-black hover:bg-red-600 hover:text-white"
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
