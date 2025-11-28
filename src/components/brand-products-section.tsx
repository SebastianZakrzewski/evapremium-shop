"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { SlidersHorizontal, X, Loader2, Car } from "lucide-react";
import { Mat } from "@/lib/types/mat";
import {
  BrandMeta,
  getBrandMetaBySlug,
  humanizeBrandSlug,
  mapSlugToCanonicalBrand,
} from "@/shared/brands/brandNormalizer";
import { fetchCarModelsByApiName } from "@/shared/brands/carModelsApi";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import ProductCardV2 from "./product-card-v2";

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

const buildFallbackBrand = (slug: string, apiName: string) => {
  const safeSlug = slug.replace(/[\s_]+/g, "-");
  return {
    displayName: humanizeBrandSlug(slug),
    logo: `/images/products/${safeSlug}.png`,
    apiName,
  };
};

// Mapowanie typów nadwozia na polskie nazwy
const bodyTypeMapping: Record<string, string> = {
  'sedan': 'Sedan',
  'suv': 'SUV',
  'hatchback': 'Hatchback',
  'coupe': 'Coupe',
  'roadster': 'Roadster',
  'cabrio': 'Kabriolet',
  'kombi': 'Kombi',
  'minivan': 'Minivan',
  'van': 'Van',
  'dostawczak': 'Dostawczak',
  'fastback': 'Fastback',
  'liftback': 'Liftback',
  'hatchback 2drzwi': 'Hatchback 2-drzwiowy',
  'hatchback 3drzwi': 'Hatchback 3-drzwiowy',
  'hatchback 5drzwi': 'Hatchback 5-drzwiowy',
  'hatchback 3/5drzwi': 'Hatchback 3/5-drzwiowy',
  'SUV 5os.': 'SUV 5-osobowy',
  'SUV 7os.': 'SUV 7-osobowy',
  'kombi/ sedan': 'Kombi/Sedan',
  'van 4drzwi': 'Van 4-drzwiowy',
  'shooting brake': 'Shooting Brake',
};

function formatBodyType(bodyType: string): string {
  const normalized = bodyType.toLowerCase().trim();
  return bodyTypeMapping[normalized] || bodyType.charAt(0).toUpperCase() + bodyType.slice(1).toLowerCase();
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
  brandSlug?: string;
}

export default function BrandProductsSection({ brandSlug: brandSlugProp }: BrandProductsSectionProps = {}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const brandParam = brandSlugProp || searchParams.get('brand');

  const [filters, setFilters] = useState<FilterState>({
    bodyTypes: [],
    yearRanges: [],
  });
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedBodyType, setSelectedBodyType] = useState<string | null>(null);

  // Normalizuj brandSlug - dekoduj URL i zamień na lowercase
  const brandSlug = brandParam ? decodeURIComponent(brandParam).toLowerCase().trim() : "";
  const brandMeta: BrandMeta | null = brandSlug ? getBrandMetaBySlug(brandSlug) : null;
  const canonicalBrandName = brandSlug ? mapSlugToCanonicalBrand(brandSlug) : null;
  const fallbackApiName = brandSlug ? humanizeBrandSlug(brandSlug) : "";
  const brandApiName = brandSlug ? (canonicalBrandName ?? fallbackApiName) : "";
  
  // Debug: szczegółowe logowanie mapowania
  useEffect(() => {
    console.log('🔍 BrandProductsSection: Brand mapping details', {
      brandParam,
      brandSlug,
      brandMeta: brandMeta ? { displayName: brandMeta.displayName, apiName: brandMeta.apiName } : null,
      brandApiName,
      canonicalBrandName,
      queryEnabled: !!(brandSlug && brandApiName),
    });
  }, [brandParam, brandSlug, brandMeta, brandApiName, canonicalBrandName]);
  
  console.log('🔍 BrandProductsSection: Brand mapping', {
    brandParam,
    brandSlug,
    brandApiName,
    brandApiNameLength: brandApiName?.length || 0,
    brandApiNameTruthy: !!brandApiName,
    brandMeta: brandMeta ? { displayName: brandMeta.displayName, apiName: brandMeta.apiName } : null,
    mappedViaFallback: !canonicalBrandName,
  });
  
  // Debug: wyświetl brandApiName w osobnym logu dla łatwiejszego debugowania
  if (brandApiName) {
    console.log(`📌 BrandProductsSection: Using brandApiName: "${brandApiName}" (length: ${brandApiName.length})`);
  } else {
    console.warn('⚠️ BrandProductsSection: brandApiName is empty!', {
      brandParam,
      brandSlug,
      brandMeta,
    });
  }
  
  // Debug: jeśli nie znaleziono kanonicznej nazwy w mapowaniu
  useEffect(() => {
    if (brandSlug && !canonicalBrandName) {
      console.warn('⚠️ BrandProductsSection: canonical brand name missing, using fallback', {
        brandSlug,
        fallbackApiName,
      });
    }
  }, [brandSlug, canonicalBrandName, fallbackApiName]);
  
  const currentBrand = brandMeta || (brandSlug ? buildFallbackBrand(brandSlug, brandApiName) : null);

  // Pobierz modele dla marki
  const queryEnabled = !!(brandSlug && brandApiName);
  
  // Debug: loguj czy zapytanie powinno być wykonywane
  useEffect(() => {
    console.log('🔍 BrandProductsSection: Query enabled check', {
      brandSlug,
      brandApiName,
      queryEnabled,
      brandSlugTruthy: !!brandSlug,
      brandApiNameTruthy: !!brandApiName,
    });
  }, [brandSlug, brandApiName, queryEnabled]);
  
  const {
    data: carModels = [],
    isLoading: loadingModels,
    error: modelsError,
    isFetching: isFetchingModels,
    dataUpdatedAt: modelsDataUpdatedAt,
    status: queryStatus,
  } = useQuery({
    queryKey: ["car-models", brandApiName],
    queryFn: () => {
      console.log('🚀 BrandProductsSection: React Query executing fetchCarModels with:', brandApiName);
      return fetchCarModelsByApiName(brandApiName);
    },
    enabled: queryEnabled,
    staleTime: 0, // Wyłącz cache podczas debugowania
    gcTime: 0, // Wyłącz cache podczas debugowania
    retry: 1, // Spróbuj raz ponownie przy błędzie
    retryDelay: 1000,
  });

  // Logowanie stanu pobierania modeli (bez availableModels - będzie dodane później)
  useEffect(() => {
    console.log('🔍 BrandProductsSection: Models query state', {
      brandSlug,
      brandApiName,
      queryEnabled,
      queryStatus,
      isLoading: loadingModels,
      isFetching: isFetchingModels,
      carModelsCount: carModels?.length || 0,
      error: modelsError,
      dataUpdatedAt: modelsDataUpdatedAt,
      carModelsSample: carModels?.slice(0, 2),
      carModelsFull: carModels?.length > 0 ? carModels[0] : null,
    });
    
    // Jeśli zapytanie jest enabled ale nie wykonuje się, sprawdź dlaczego
    if (queryEnabled && !loadingModels && !isFetchingModels && carModels.length === 0 && !modelsError) {
      console.warn('⚠️ BrandProductsSection: Query enabled but no data and no loading/error state');
      console.warn('   This may indicate that the API request is not being made or is failing silently');
    }
  }, [brandSlug, brandApiName, queryEnabled, queryStatus, loadingModels, isFetchingModels, carModels, modelsError, modelsDataUpdatedAt]);

  // Pobierz produkty (dywaniki) dla marki
  const {
    data: mats = [],
    isLoading: loadingMats,
  } = useQuery({
    queryKey: ["mats", brandSlug],
    queryFn: () => fetchMats(brandSlug),
    enabled: !!brandSlug,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
  });

  const isLoading = loadingModels || loadingMats;

  // Przygotuj produkty do wyświetlenia
  const displayProducts = useMemo(() => {
    if (!brandSlug) return [];

    const productsMap = new Map<string, ProductDisplayItem>();

    // Najpierw dodaj produkty z mats jeśli są dostępne
    if (mats.length > 0) {
      mats.forEach((mat) => {
        // Pomiń maty bez nazwy modelu
        if (!mat.carModelSlug || mat.carModelSlug.trim() === '') {
          return;
        }
        
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
            imageSrc: currentBrand?.logo,
          });
        } else {
          const existing = productsMap.get(key)!;
          if (mat.basePrice < existing.price) {
            existing.price = mat.basePrice;
          }
        }
      });
    }
    
    // Następnie dodaj modele z carModels (nawet jeśli są mats, żeby mieć pełną listę modeli)
    if (carModels && carModels.length > 0) {
      carModels.forEach((model: any) => {
        // Pomiń modele bez nazwy
        if (!model.model || model.model.trim() === '') {
          return;
        }
        
        if (model.generations && model.generations.length > 0) {
          model.generations.forEach((gen: any) => {
            const key = `${model.model}-${gen.generation || ""}-${gen.bodyType || ""}`;
            // Dodaj tylko jeśli nie ma już produktu z mats dla tego klucza
            if (!productsMap.has(key)) {
              productsMap.set(key, {
                id: `${model.brand || brandSlug}-${model.model}-${gen.generation || ""}`,
                brand: currentBrand?.displayName || brandSlug,
                model: model.model,
                generation: gen.generation || undefined,
                bodyType: gen.bodyType || undefined,
                yearFrom: gen.yearFrom || undefined,
                yearTo: gen.yearTo || undefined,
                price: 150,
                imageSrc: currentBrand?.logo,
              });
            }
          });
        } else {
          // Jeśli model nie ma generacji, dodaj go jako uniwersalny produkt
          const key = `${model.model}-universal`;
          if (!productsMap.has(key)) {
            productsMap.set(key, {
              id: `${model.brand || brandSlug}-${model.model}`,
              brand: currentBrand?.displayName || brandSlug,
              model: model.model,
              generation: undefined,
              bodyType: undefined,
              yearFrom: undefined,
              yearTo: undefined,
              price: 150,
              imageSrc: currentBrand?.logo,
            });
          }
        }
      });
    }

    const result = Array.from(productsMap.values());
    console.log('📦 BrandProductsSection: displayProducts', {
      count: result.length,
      fromMats: mats.length,
      fromCarModels: carModels.length,
      products: result.slice(0, 5).map(p => `${p.model} (${p.bodyType || 'N/A'})`)
    });
    
    return result;
  }, [mats, carModels, currentBrand, brandSlug]);

  // Dostępne typy nadwozia - filtrowane po wybranym modelu
  const availableBodyTypes = useMemo(() => {
    const bodyTypeCounts = new Map<string, number>();
    
    // Jeśli wybrano model, pokaż tylko typy nadwozia dla tego modelu
    let productsToFilter = displayProducts;
    if (selectedModel) {
      productsToFilter = displayProducts.filter((product) => product.model === selectedModel);
    }
    
    productsToFilter.forEach((product) => {
      if (product.bodyType) {
        const count = bodyTypeCounts.get(product.bodyType) || 0;
        bodyTypeCounts.set(product.bodyType, count + 1);
      }
    });

    return Array.from(bodyTypeCounts.entries())
      .map(([bodyType, count]) => ({ bodyType, count }))
      .sort((a, b) => a.bodyType.localeCompare(b.bodyType));
  }, [displayProducts, selectedModel]);

  // Dostępne zakresy lat - filtrowane po wybranym modelu
  const availableYearRanges = useMemo(() => {
    const yearRangeCounts = new Map<string, number>();

    // Jeśli wybrano model, pokaż tylko roczniki dla tego modelu
    let productsToFilter = displayProducts;
    if (selectedModel) {
      productsToFilter = displayProducts.filter((product) => product.model === selectedModel);
    }

    productsToFilter.forEach((product) => {
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
        return bStart - aStart;
      });
  }, [displayProducts, selectedModel]);

  // Wyodrębnij unikalne modele z carModels API - grupowane po nazwie modelu z listą dostępnych typów nadwozia
  const availableModels = useMemo(() => {
    const modelMap = new Map<string, { 
      model: string; 
      bodyTypes: Set<string>; 
      years: Set<number>;
      count: number;
    }>();
    
    console.log('🔍 BrandProductsSection: Processing carModels for availableModels', {
      carModelsCount: carModels?.length || 0,
      carModelsSample: carModels?.slice(0, 2)
    });
    
    // Najpierw wyodrębnij modele z carModels API
    if (carModels && carModels.length > 0) {
      console.log('📦 BrandProductsSection: Processing carModels', {
        count: carModels.length,
        firstModel: carModels[0],
        firstModelKeys: carModels[0] ? Object.keys(carModels[0]) : [],
      });
      
      carModels.forEach((apiModel: any, index: number) => {
        // Debug: loguj pierwsze 3 modele
        if (index < 3) {
          console.log(`📦 BrandProductsSection: Processing model ${index}:`, {
            apiModel,
            hasModel: !!apiModel.model,
            hasGenerations: !!apiModel.generations,
            generationsCount: apiModel.generations?.length || 0,
            hasBodyTypes: !!apiModel.bodyTypes,
            bodyTypesCount: apiModel.bodyTypes?.length || 0,
          });
        }
        
        const modelName = apiModel.model?.trim();
        if (!modelName) {
          console.warn('⚠️ Skipping model without name:', apiModel);
          return;
        }
        
        if (!modelMap.has(modelName)) {
          modelMap.set(modelName, {
            model: modelName,
            bodyTypes: new Set(),
            years: new Set(),
            count: 0,
          });
        }
        
        const modelData = modelMap.get(modelName)!;
        
        // Dodaj typy nadwozia z generacji
        if (apiModel.generations && Array.isArray(apiModel.generations)) {
          apiModel.generations.forEach((gen: any) => {
            if (gen.bodyType) {
              modelData.bodyTypes.add(gen.bodyType);
            }
            if (gen.yearFrom) {
              modelData.years.add(gen.yearFrom);
            }
            if (gen.yearTo) {
              modelData.years.add(gen.yearTo);
            }
            modelData.count += 1;
          });
        }
        
        // Dodaj typy nadwozia z bodyTypes array jeśli istnieje
        if (apiModel.bodyTypes && Array.isArray(apiModel.bodyTypes)) {
          apiModel.bodyTypes.forEach((bt: string) => {
            modelData.bodyTypes.add(bt);
          });
        }
        
        // Dodaj lata z years array jeśli istnieje
        if (apiModel.years && Array.isArray(apiModel.years)) {
          apiModel.years.forEach((year: number) => {
            modelData.years.add(year);
          });
        }
      });
    }
    
    // Następnie dodaj modele z displayProducts (z mats) jeśli nie ma ich już w mapie
    displayProducts.forEach((product) => {
      const modelName = product.model?.trim();
      if (!modelName) return;
      
      if (!modelMap.has(modelName)) {
        modelMap.set(modelName, {
          model: modelName,
          bodyTypes: new Set(),
          years: new Set(),
          count: 0,
        });
      }
      
      const modelData = modelMap.get(modelName)!;
      
      if (product.bodyType) {
        modelData.bodyTypes.add(product.bodyType);
      }
      if (product.yearFrom) {
        modelData.years.add(product.yearFrom);
      }
      if (product.yearTo) {
        modelData.years.add(product.yearTo);
      }
      modelData.count += 1;
    });

    const result = Array.from(modelMap.values())
      .map((modelData) => ({
        model: modelData.model,
        bodyTypes: Array.from(modelData.bodyTypes).sort(),
        years: Array.from(modelData.years).sort((a, b) => b - a),
        count: modelData.count,
      }))
      .sort((a, b) => a.model.localeCompare(b.model));
    
    console.log('📊 BrandProductsSection: availableModels result', {
      count: result.length,
      fromCarModels: carModels?.length || 0,
      fromDisplayProducts: displayProducts.length,
      models: result.slice(0, 5).map(m => `${m.model} (${m.bodyTypes.length} body types, ${m.count} variants)`)
    });
    
    if (result.length === 0 && carModels && carModels.length > 0) {
      console.error('❌ BrandProductsSection: CRITICAL - No models extracted but carModels has data!', {
        carModelsCount: carModels.length,
        firstModel: carModels[0],
        firstModelKeys: carModels[0] ? Object.keys(carModels[0]) : [],
        firstModelStructure: JSON.stringify(carModels[0], null, 2),
      });
    }
    
    if (result.length === 0 && (!carModels || carModels.length === 0)) {
      console.warn('⚠️ BrandProductsSection: No models available - carModels is empty', {
        carModelsCount: carModels?.length || 0,
      });
    }
    
    return result;
  }, [carModels, displayProducts]);

  // Logowanie availableModels po jego inicjalizacji
  useEffect(() => {
    console.log('🔍 BrandProductsSection: AvailableModels state', {
      availableModelsCount: availableModels?.length || 0,
      carModelsCount: carModels?.length || 0,
    });
    
    // Jeśli są carModels ale brak availableModels, to problem w przetwarzaniu
    if (carModels.length > 0 && availableModels.length === 0) {
      console.error('❌ BrandProductsSection: CRITICAL - carModels has data but availableModels is empty!');
      console.error('   carModels sample:', carModels.slice(0, 2));
      console.error('   This indicates a problem in the availableModels calculation');
    }
  }, [availableModels, carModels]);

  // Filtrowanie produktów
  const filteredProducts = useMemo(() => {
    let filtered = displayProducts;

    // Filtruj po wybranym modelu i typie nadwozia
    if (selectedModel && selectedBodyType) {
      filtered = filtered.filter(
        (product) => product.model === selectedModel && product.bodyType === selectedBodyType
      );
    } else if (selectedModel) {
      filtered = filtered.filter((product) => product.model === selectedModel);
    }

    // Filtruj po typach nadwozia z checkboxów
    if (filters.bodyTypes.length > 0) {
      filtered = filtered.filter(
        (product) => product.bodyType && filters.bodyTypes.includes(product.bodyType)
      );
    }

    // Filtruj po zakresach lat
    if (filters.yearRanges.length > 0) {
      filtered = filtered.filter((product) => {
        if (!product.yearFrom || !product.yearTo) return false;
        const productRange = `${product.yearFrom}-${product.yearTo}`;
        return filters.yearRanges.includes(productRange);
      });
    }

    return filtered;
  }, [displayProducts, filters, selectedModel, selectedBodyType]);

  // Jeśli nie ma wybranej marki, nie renderuj sekcji
  if (!brandParam || !currentBrand) {
    return null;
  }

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
    setSelectedModel(null);
    setSelectedBodyType(null);
  };

  const handleModelClick = (model: string) => {
    if (selectedModel === model) {
      // Jeśli kliknięto już wybrany model, odznacz go
      setSelectedModel(null);
      setSelectedBodyType(null);
      setFilters({ bodyTypes: [], yearRanges: [] });
    } else {
      // Wybierz model i zaktualizuj filtry
      setSelectedModel(model);
      setSelectedBodyType(null);
      // Wyczyść filtry które nie są dostępne dla wybranego modelu
      const modelData = availableModels.find(m => m.model === model);
      if (modelData) {
        setFilters((prev) => ({
          bodyTypes: prev.bodyTypes.filter(bt => modelData.bodyTypes.includes(bt)),
          yearRanges: prev.yearRanges.filter(yr => {
            const [yearFrom, yearTo] = yr.split('-').map(Number);
            return modelData.years.some(y => y >= yearFrom && y <= yearTo);
          }),
        }));
      } else {
        setFilters({ bodyTypes: [], yearRanges: [] });
      }
    }
  };

  const clearBrand = () => {
    // Jeśli jesteśmy na stronie /dywaniki/[brand], przekieruj do /dywaniki
    // W przeciwnym razie usuń parametr brand z URL głównej strony
    if (brandSlugProp) {
      router.push('/dywaniki', { scroll: false });
    } else {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete('brand');
      router.push(`/?${newParams.toString()}`, { scroll: false });
    }
  };

  const activeFiltersCount = filters.bodyTypes.length + filters.yearRanges.length;

  return (
    <div id="brand-products" className="min-h-screen bg-neutral-950 text-white pb-20 scroll-mt-24">
      {/* Hero Header */}
      <div className="relative bg-[#0a0a0a] border-b border-white/5 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-red-600/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white">Dywaniki do {currentBrand.displayName}</span>
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
              <div>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-2">
                  DYWANIKI DO <span className="text-red-600">{currentBrand.displayName.toUpperCase()}</span>
                </h1>
              </div>
            </div>
            <p className="text-lg text-gray-400 leading-relaxed">
              Znajdź idealnie dopasowane dywaniki EVA do Twojego modelu {currentBrand.displayName}. 
              Wybierz rok produkcji i typ nadwozia, aby zobaczyć dedykowane produkty.
            </p>
          </div>
        </div>
      </div>

      {/* Model Selection Section */}
      {(isLoading || carModels.length > 0 || availableModels.length > 0 || modelsError) && (
        <div className="container mx-auto px-4 py-8 border-b border-white/5">
          <div className="mb-4 text-center">
            <h2 className="text-xl font-semibold text-white mb-2">Wybierz model</h2>
            <p className="text-sm text-gray-400">
              {isLoading 
                ? 'Ładowanie dostępnych modeli...' 
                : modelsError 
                  ? `Błąd podczas ładowania modeli: ${modelsError.message || 'Nieznany błąd'}` 
                  : availableModels.length > 0 
                    ? 'Kliknij na model, aby zobaczyć dostępne produkty i filtry' 
                    : carModels.length > 0 
                      ? 'Przetwarzanie modeli...' 
                      : 'Brak dostępnych modeli dla tej marki'}
            </p>
            {/* Debug info - tylko w development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-2 text-xs text-gray-500">
                Debug: carModels={carModels.length}, availableModels={availableModels.length}, 
                queryEnabled={queryEnabled ? 'true' : 'false'}, 
                status={queryStatus}, 
                error={modelsError ? 'yes' : 'no'}
              </div>
            )}
          </div>
          
          {isLoading ? (
            <div className="flex justify-center">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-2 max-w-6xl">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-16 bg-white/5 rounded-md animate-pulse border border-white/10" />
                ))}
              </div>
            </div>
          ) : availableModels.length > 0 ? (
            <div className="flex justify-center">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-2 max-w-6xl">
              <button
                onClick={() => {
                  setSelectedModel(null);
                  setSelectedBodyType(null);
                  setFilters({ bodyTypes: [], yearRanges: [] });
                }}
                className={`group relative px-3 py-2 rounded-md font-medium transition-all duration-200 text-xs ${
                  selectedModel === null
                    ? 'bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg shadow-red-500/30 ring-2 ring-red-500/50'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10 hover:border-white/20 hover:shadow-md hover:shadow-white/5'
                }`}
              >
                Wszystkie
                {selectedModel === null && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                )}
              </button>
              {availableModels.map((modelData) => {
                const isSelected = selectedModel === modelData.model;
                const bodyTypesCount = modelData.bodyTypes.length;
                const yearsCount = modelData.years.length;
                
                return (
                  <button
                    key={modelData.model}
                    onClick={() => handleModelClick(modelData.model)}
                    className={`group relative px-3 py-2 rounded-md font-medium transition-all duration-200 text-xs ${
                      isSelected
                        ? 'bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg shadow-red-500/30 ring-2 ring-red-500/50'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10 hover:border-white/20 hover:shadow-md hover:shadow-white/5'
                    }`}
                    title={`${modelData.model.toUpperCase()} - ${bodyTypesCount} typ${bodyTypesCount !== 1 ? 'ów' : ''} nadwozia`}
                  >
                    <div className="flex flex-col items-center text-center gap-0.5">
                      <span className={`font-semibold leading-tight ${isSelected ? 'text-white' : 'text-white group-hover:text-white'}`}>
                        {modelData.model.toUpperCase()}
                      </span>
                      {bodyTypesCount > 0 && (
                        <span className={`text-[9px] leading-tight ${isSelected ? 'text-red-100' : 'text-gray-400 group-hover:text-gray-300'}`}>
                          {bodyTypesCount} typ{bodyTypesCount !== 1 ? 'ów' : ''}
                        </span>
                      )}
                      {yearsCount > 0 && (
                        <span className={`text-[9px] leading-tight ${isSelected ? 'text-red-200' : 'text-gray-500 group-hover:text-gray-400'}`}>
                          {modelData.years[modelData.years.length - 1]}-{modelData.years[0]}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                    )}
                  </button>
                );
              })}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center border border-dashed border-white/10 rounded-xl">
              <Car className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Brak dostępnych modeli dla tej marki</p>
            </div>
          )}
        </div>
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

              {/* Body Types */}
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
                        className="text-gray-300 group-hover:text-white cursor-pointer transition-colors flex-1 flex justify-between"
                      >
                        <span>{formatBodyType(bodyType)}</span>
                        <span className="text-gray-600">({count})</span>
                      </Label>
                    </div>
                  ))}
                  {availableBodyTypes.length === 0 && (
                    <p className="text-gray-500 text-sm italic">Brak typów nadwozia</p>
                  )}
                </div>
              </div>

              <Separator className="bg-white/10" />

              {/* Year Ranges */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Rok produkcji</h4>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
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
                        className="text-gray-300 group-hover:text-white cursor-pointer transition-colors flex-1 flex justify-between"
                      >
                        <span>{range}</span>
                        <span className="text-gray-600">({count})</span>
                      </Label>
                    </div>
                  ))}
                  {availableYearRanges.length === 0 && (
                    <p className="text-gray-500 text-sm italic">Brak roczników</p>
                  )}
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
              
              <button 
                onClick={clearBrand} 
                className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
              >
                <X className="w-4 h-4" />
                Wybierz inną markę
              </button>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-[400px] bg-white/5 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCardV2 
                      key={product.id} 
                      product={product}
                    />
                  ))}
                </div>

                {/* Empty State */}
                {filteredProducts.length === 0 && (
                  <div className="py-20 text-center border border-dashed border-white/10 rounded-xl">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-white mb-2">Nie znaleziono produktów</h3>
                    <p className="text-gray-400 max-w-md mx-auto mb-6">
                      Spróbuj zmienić kryteria wyszukiwania lub usuń filtry, aby zobaczyć więcej wyników.
                    </p>
                    <Button onClick={clearFilters} variant="secondary">
                      Wyczyść filtry
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
