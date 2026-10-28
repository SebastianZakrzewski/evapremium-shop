"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
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
import { buildConfiguratorEntryUrl } from "@/features/car-configurator/utils/buildConfiguratorEntryUrl";
import {
  getBrandInfo,
  resolveBrandFromUrlParam,
  brandNameToNavigationSlug,
  resolveBrandLogo,
  shouldServeBrandImageUnoptimized,
  isModeleBrandPhoto,
} from "@/shared/brands";
import { getDoorsCount } from "@/shared";
import {
  formatBodyTypeDisplayPl,
  formatBrandDisplayName,
  formatModelWithGenerationDisplay,
  formatYearRangeDisplay,
} from "@/shared/vehicle/displayLabels";
import { useCarModelsFilters } from "@/features/brands/hooks";
import { isPinnedModelCard, readModelCardQuery } from "@/features/brands/model/modelCardUrl";
import { formatPriceCurrency } from "@/lib/utils/formatPrice";
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
function modelCountLabel(count: number) {
  if (count === 1) return "1 model";
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} modele`;
  }
  return `${count} modeli`;
}

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
  const cardQuery = useMemo(() => readModelCardQuery(searchParams), [searchParams]);
  const pinnedCard = isPinnedModelCard(cardQuery);
  
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
    queryKey: ['car-brands', 'v3'],
    queryFn: fetchBrands,
    staleTime: 10 * 60 * 1000, // 10 minut
    gcTime: 30 * 60 * 1000, // 30 minut cache
    retry: 2,
    retryDelay: 1000,
    enabled: !pinnedCard,
  });

  // Handler kliknięcia marki
  const handleBrandClick = useCallback((brand: Brand) => {
    setClickedBrandId(brand.id);
    
    // Animacja kliknięcia - reset po 300ms
    setTimeout(() => {
      setClickedBrandId(null);
      // Przekierowanie do strony z modelami dla danej marki (używamy query parameter)
      router.push(`${basePath}?brand=${encodeURIComponent(brandNameToNavigationSlug(brand.name))}`);
    }, 300);
  }, [router, basePath]);

  const resolvedBrand = useMemo(
    () => resolveBrandFromUrlParam(brandParam),
    [brandParam]
  )

  const brandSlug = resolvedBrand?.slug ?? ''
  const brandInfo = brandSlug ? getBrandInfo(brandSlug) : null
  const brandDisplayName = resolvedBrand?.displayName ?? brandInfo?.displayName
  const visibleBrandName = formatBrandDisplayName(brandDisplayName || brandParam || "")
  const brandApiName = resolvedBrand?.apiName ?? ''

  const brandLogo = useMemo(() => {
    if (!brandParam) return null

    const brandName =
      resolvedBrand?.dbName ??
      brandDisplayName ??
      brandApiName ??
      brandParam

    return resolveBrandLogo(brandName, null)
  }, [brandParam, resolvedBrand, brandDisplayName, brandApiName])

  // Użyj React Query do cache'owania modeli
  const { data: apiModels = [], isLoading: loading, error: modelsError } = useQuery({
    queryKey: ['car-models', brandApiName, pinnedCard ? cardQuery : null, 'v3'],
    queryFn: async () => {
      if (!brandApiName) {
        return [];
      }
      if (!pinnedCard) {
        return fetchCarModels(brandApiName);
      }
      const pinnedModels = await fetchCarModels(brandApiName, {
        model: cardQuery.model,
        generation: cardQuery.generation,
        bodyType: cardQuery.bodyType,
      });
      if (pinnedModels.length > 0) {
        return pinnedModels;
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
      nameDisplay: string;
      modelFamilyKey: string;
      brand: string;
      bodyType: string;
      bodyTypeDisplay: string;
      yearFrom?: number;
      yearTo?: number;
      imageSrc: string;
      generation: string;
      generationDisplay: string;
    }> = [];

    const fallbackImage = brandLogo ?? '/images/products/audi.jpg';

    // Map do deduplikacji modeli - klucz: brand-name-bodyType-generation-yearFrom
    const uniqueModelsMap = new Map<string, typeof models[0]>();

    apiModels.forEach((model: any, modelIndex: number) => {
      // API zwraca zgrupowane modele z tablicą generations
      const modelName = model.model || model.name || `Model ${modelIndex + 1}`;
      const modelFamilyKey = model.modelFamilyKey || modelName;
      const modelBrand = model.brand || brandDisplayName || brandParam || 'Unknown';
      
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
              nameDisplay:
                gen.modelDisplay ||
                formatModelWithGenerationDisplay(
                  modelName,
                  gen.modelKey ?? modelName,
                  modelFamilyKey,
                ),
              modelFamilyKey,
              brand: model.brandDisplay || modelBrand,
              bodyType: gen.bodyType || '',
              bodyTypeDisplay:
                gen.bodyTypeDisplay || formatBodyTypeDisplayPl(gen.bodyType || ''),
              yearFrom: gen.yearFrom,
              yearTo: gen.yearTo,
              imageSrc: gen.modelImage || fallbackImage,
              generation: gen.generation || '',
              generationDisplay:
                gen.generationDisplay ||
                formatYearRangeDisplay(gen.yearFrom, gen.yearTo, gen.generation),
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
            nameDisplay: model.modelDisplay || modelName,
            modelFamilyKey,
            brand: model.brandDisplay || modelBrand,
            bodyType: model.bodyType || model.bodyTypes?.[0] || '',
            bodyTypeDisplay: formatBodyTypeDisplayPl(
              model.bodyType || model.bodyTypes?.[0] || '',
            ),
            yearFrom: model.yearFrom,
            yearTo: model.yearTo,
            imageSrc: model.modelImage || fallbackImage,
            generation: model.generation || '',
            generationDisplay: formatYearRangeDisplay(
              model.yearFrom,
              model.yearTo,
              model.generation,
            ),
          };
          uniqueModelsMap.set(uniqueKey, modelData);
          models.push(modelData);
        }
      }
    });

    return models;
  }, [apiModels, brandParam, brandLogo, brandDisplayName]);

  const {
    availableBodyTypes,
    availableGenerations,
    filteredModels,
    activeFiltersCount,
  } = useCarModelsFilters({
    brandParam,
    displayModels,
    modelsWithImages: displayModels,
    filters,
    selectedModel,
    cardQuery,
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
  const uniqueModelNavItems = useMemo(() => {
    if (!brandParam || displayModels.length === 0) {
      return [];
    }
    const items = new Map<string, string>();
    displayModels.forEach((model) => {
      const key = model.modelFamilyKey ?? model.name;
      if (!key) return;
      items.set(key, model.nameDisplay ?? model.name);
    });
    return [...items.entries()]
      .map(([value, label]) => ({ value, label }))
      .sort((left, right) => left.label.localeCompare(right.label, "pl"));
  }, [displayModels, brandParam]);

  // Jeśli nie ma wybranej marki, pokaż sekcję wyboru marek
  if (!brandParam) {
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
              <li className="text-gray-400">/</li>
              <li className="text-white font-medium">Modele aut</li>
            </ol>
          </nav>

          <div className="mb-8 mt-8 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl text-left">
              <p className="text-[11px] uppercase tracking-[0.28em] text-red-500">Kolekcja</p>
              <h1 className="mt-3 text-3xl font-medium leading-tight tracking-tight text-white md:text-4xl">
                Wybierz markę samochodu
              </h1>
              <p className="mt-3 max-w-xl text-sm font-normal leading-relaxed text-white/55 md:text-base">
                Wybierz markę swojego auta i znajdź precyzyjnie dopasowane dywaniki samochodowe EVA Premium
              </p>
            </div>
            {!loadingBrands && (
              <p className="text-sm text-white/40">{availableBrands.length} marek</p>
            )}
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
    <div className={pinnedCard ? "bg-[#111] text-white" : "min-h-screen bg-black text-white pb-20"}>
      {/* Hero Header */}
      {pinnedCard ? null : (
      <div className="bg-black text-white">
        <div className="container mx-auto px-4 pb-10 pt-8 md:pb-12 md:pt-12">
          <nav className="flex items-center gap-2 text-xs tracking-wide text-white/40">
            <Link href="/" className="transition-colors hover:text-white">Home</Link>
            <span>/</span>
            <Link href={basePath} className="transition-colors hover:text-white">
              {basePath === '/dywaniki' ? 'Dywaniki' : 'Modele aut'}
            </Link>
            {brandParam && (
              <>
                <span>/</span>
                <span className="text-white/70">{visibleBrandName || brandParam}</span>
              </>
            )}
          </nav>

          <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] uppercase tracking-[0.28em] text-red-500">Kolekcja</p>
              <h1 className="mt-3 text-3xl font-medium leading-tight tracking-tight text-white md:text-4xl">
                {visibleBrandName || brandParam}
              </h1>
              <p className="mt-3 max-w-xl text-sm font-normal leading-relaxed text-white/55 md:text-base">
                Wybierz model {visibleBrandName || brandParam} i dopasuj dywaniki EVA do swojego auta.
              </p>
            </div>
            <p className="shrink-0 text-sm text-white/40 md:pt-8">{modelCountLabel(filteredModels.length)}</p>
          </div>
        </div>
      </div>
      )}

      {/* Model Navigation Bar */}
      {!pinnedCard && uniqueModelNavItems.length > 0 && (
        <ModelNavigationBar
          models={uniqueModelNavItems}
          selectedModel={selectedModel}
          onModelSelect={setSelectedModel}
        />
      )}

      <div className={pinnedCard ? "flex flex-col" : "container mx-auto px-4 py-12"}>
        <div className={pinnedCard ? "flex" : "flex flex-col lg:flex-row gap-10"}>
          
          {/* Mobile Filter Toggle */}
          {pinnedCard ? null : (
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
          )}

          {/* Sidebar Filters */}
          {pinnedCard ? null : (
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
                          className="text-gray-400 group-hover:text-white cursor-pointer transition-colors font-medium"
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
                      <div key={generation.value} className="flex items-center space-x-3 group">
                        <Checkbox
                          id={`generation-${generation.value}`}
                          checked={filters.generations.includes(generation.value)}
                          onCheckedChange={(checked) =>
                            handleGenerationChange(generation.value, checked as boolean)
                          }
                          className="border-white/20 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                        />
                        <Label
                          htmlFor={`generation-${generation.value}`}
                          className="text-gray-400 group-hover:text-white cursor-pointer transition-colors"
                        >
                          {generation.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
          )}

          {/* Main Content */}
          <main className={pinnedCard ? "w-full" : "flex-1"}>
            {/* Results Header */}
            {pinnedCard ? null : (
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
            )}

            {/* Loading State */}
            {loading ? (
              <div className={pinnedCard ? "grid w-full grid-cols-1" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"}>
                {[...(pinnedCard ? [0] : Array(10))].map((_, i) => (
                  <div key={i} className={pinnedCard ? "flex flex-col bg-white/5 animate-pulse overflow-hidden" : "bg-white/5 rounded-xl animate-pulse overflow-hidden flex flex-col"}>
                    <div className={pinnedCard ? "aspect-[4/3] w-full bg-white/10" : "w-full h-64 md:h-72 bg-white/10"} />
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
                <div className={pinnedCard ? "grid w-full grid-cols-1" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"}>
                  {filteredModels.map((model) => {
                    const imageSrc = model.imageSrc || '/vercel.svg';
                    const configuratorUrl = buildConfiguratorEntryUrl({
                      brand: brandSlug,
                      model: model.modelFamilyKey ?? model.name.toLowerCase(),
                      generation: model.generation,
                      bodyType: model.bodyType,
                      previewImage:
                        imageSrc !== brandLogo &&
                        imageSrc !== '/images/products/audi.jpg' &&
                        imageSrc !== '/vercel.svg'
                          ? imageSrc
                          : null,
                    });
                    const brandLabel = visibleBrandName || model.brand || '';
                    const useBrandPhoto = isModeleBrandPhoto(imageSrc);

                    const card = (
                      <div className={pinnedCard
                        ? "flex flex-col bg-[#111]"
                        : "h-full flex flex-col bg-[#111] border border-white/5 rounded-xl overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:shadow-red-900/10 hover:-translate-y-1"}>
                        <div className={pinnedCard
                          ? "w-full bg-[#111] leading-none"
                          : "relative aspect-square bg-gradient-to-br from-gray-900 to-black overflow-hidden"}>
                          <Image
                            src={imageSrc}
                            alt={`Dywaniki do ${brandLabel} ${model.name} - Spersonalizowane dywaniki samochodowe`}
                            {...(pinnedCard ? { width: 960, height: 720 } : { fill: true })}
                            className={pinnedCard
                              ? "block h-auto w-full"
                              : `transition-transform duration-500 group-hover:scale-110 ${useBrandPhoto ? 'object-cover object-center' : 'object-cover'}`}
                            style={pinnedCard ? { width: '100%', height: 'auto' } : undefined}
                            sizes={pinnedCard ? "420px" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"}
                            priority={pinnedCard || parseInt(String(model.id)) <= 6}
                            quality={pinnedCard ? 60 : 90}
                            unoptimized={shouldServeBrandImageUnoptimized(imageSrc)}
                          />
                        </div>

                        <div className={pinnedCard ? "flex shrink-0 flex-col px-3 pt-3" : "flex-1 flex flex-col p-5"}>
                          <div className={pinnedCard ? "mb-1" : "mb-2"}>
                            <h3 className="text-lg font-bold text-white leading-tight group-hover:text-red-500 transition-colors line-clamp-2">
                              {brandLabel} {model.nameDisplay ?? model.name}
                            </h3>
                          </div>

                          <div className={pinnedCard ? "mb-2 space-y-1 text-sm text-gray-400" : "text-sm text-gray-400 mb-4 flex-1 space-y-1"}>
                            {model.generationDisplay && (
                              <span className="block">{model.generationDisplay}</span>
                            )}
                            {model.bodyTypeDisplay && (
                              <span className="block uppercase tracking-wide text-xs text-gray-500">
                                {model.bodyTypeDisplay}
                              </span>
                            )}
                          </div>

                          <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/5 py-3">
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-400">Cena od</span>
                              <span className="text-xl font-bold text-white">
                                {formatPriceCurrency(150)}
                              </span>
                            </div>

                            {pinnedCard ? (
                              <span className="inline-flex shrink-0 items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white">
                                <ShoppingCart className="w-4 h-4" aria-hidden="true" />
                                Skonfiguruj
                              </span>
                            ) : (
                              <Link href={configuratorUrl}>
                                <Button
                                  className="shrink-0 gap-2 transition-all duration-300 bg-red-600 text-white hover:bg-red-700"
                                  size="sm"
                                >
                                  <ShoppingCart className="w-4 h-4" aria-hidden="true" />
                                  <span className="hidden sm:inline">Skonfiguruj</span>
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    );

                    if (pinnedCard) {
                      return (
                        <a
                          key={model.id}
                          href={configuratorUrl}
                          target="_top"
                          data-pinned-model-card=""
                          className="group block w-full text-inherit no-underline focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500"
                        >
                          {card}
                        </a>
                      );
                    }

                    return (
                      <article
                        key={model.id}
                        className="group block h-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black rounded-xl"
                      >
                        {card}
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
                        ? `Nie znaleziono modeli dla marki ${visibleBrandName || resolvedBrand?.raw || brandParam}. Możliwe, że modele dla tej marki są w trakcie dodawania.`
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
