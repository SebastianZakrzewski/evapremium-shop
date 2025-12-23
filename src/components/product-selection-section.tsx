"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { Mat } from "@/lib/types/mat";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Loader2, Car, SlidersHorizontal } from "lucide-react";

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

// Mapowanie nazw marek - rozszerzone o różne warianty
const brandMapping: Record<string, { displayName: string; logo: string; apiName: string }> = {
  bmw: { displayName: "BMW", logo: "/images/products/bmw.png", apiName: "Bmw" },
  mercedes: { displayName: "Mercedes", logo: "/images/products/mercedes.jpg", apiName: "Mercedes-Benz" },
  'mercedes-benz': { displayName: "Mercedes", logo: "/images/products/mercedes.jpg", apiName: "Mercedes-Benz" },
  audi: { displayName: "Audi", logo: "/images/products/audi.jpg", apiName: "Audi" },
  porsche: { displayName: "Porsche", logo: "/images/products/porsche.png", apiName: "Porsche" },
  tesla: { displayName: "Tesla", logo: "/images/products/tesla.avif", apiName: "Tesla" },
  volkswagen: { displayName: "Volkswagen", logo: "/images/products/vw.png", apiName: "Volkswagen" },
  vw: { displayName: "Volkswagen", logo: "/images/products/vw.png", apiName: "Volkswagen" },
  toyota: { displayName: "Toyota", logo: "/images/products/toyota.png", apiName: "Toyota" },
  ford: { displayName: "Ford", logo: "/images/products/ford.png", apiName: "Ford" },
  opel: { displayName: "Opel", logo: "/images/products/opel.png", apiName: "Opel" },
  skoda: { displayName: "Škoda", logo: "/images/products/skoda.png", apiName: "Skoda" },
  seat: { displayName: "SEAT", logo: "/images/products/seat.png", apiName: "Seat" },
  renault: { displayName: "Renault", logo: "/images/products/renault.png", apiName: "Renault" },
  peugeot: { displayName: "Peugeot", logo: "/images/products/peugeot.png", apiName: "Peugeot" },
  citroen: { displayName: "Citroën", logo: "/images/products/citroen.png", apiName: "Citroen" },
  fiat: { displayName: "Fiat", logo: "/images/products/fiat.png", apiName: "Fiat" },
  mazda: { displayName: "Mazda", logo: "/images/products/mazda.png", apiName: "Mazda" },
  honda: { displayName: "Honda", logo: "/images/products/honda.png", apiName: "Honda" },
  nissan: { displayName: "Nissan", logo: "/images/products/nissan.png", apiName: "Nissan" },
  hyundai: { displayName: "Hyundai", logo: "/images/products/hyundai.png", apiName: "Hyundai" },
  kia: { displayName: "Kia", logo: "/images/products/kia.png", apiName: "Kia" },
};

// Funkcja do normalizacji nazwy marki z URL na format z bazy danych
function normalizeBrandName(brandSlug: string): string | null {
  const normalized = brandSlug.toLowerCase().trim();
  const mapping = brandMapping[normalized];
  return mapping ? mapping.apiName : null;
}

// Funkcja do pobrania informacji o marce
function getBrandInfo(brandSlug: string): { displayName: string; logo: string; apiName: string } | null {
  const normalized = brandSlug.toLowerCase().trim();
  return brandMapping[normalized] || null;
}

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

// Funkcja do pobierania modeli - używa car_models_extended z Supabase
const fetchCarModels = async (brandName: string): Promise<any[]> => {
  try {
    const response = await fetch(`/api/models?brand=${encodeURIComponent(brandName)}`);
    if (!response.ok) {
      // Jeśli błąd 500 lub inny, zwróć pustą tablicę zamiast rzucać błąd
      console.warn(`API models returned ${response.status} for brand ${brandName}, using empty array as fallback`);
      return [];
    }
    const data = await response.json();
    // Przekształć dane z API na format CarModel
    return Array.isArray(data) ? data : [];
  } catch (error) {
    // W przypadku błędu zwróć pustą tablicę - komponent użyje tylko mats jeśli dostępne
    console.warn('Error fetching car models, using fallback:', error);
    return [];
  }
};

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
            imageSrc: currentBrand?.logo,
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
                imageSrc: currentBrand?.logo,
              });
            }
          });
        }
      });
    }

    return Array.from(productsMap.values());
  }, [mats, carModels, currentBrand, brand]);

  // Dostępne typy nadwozia z liczbą produktów
  const availableBodyTypes = useMemo(() => {
    const bodyTypeCounts = new Map<string, number>();
    
    displayProducts.forEach((product) => {
      if (product.bodyType) {
        const count = bodyTypeCounts.get(product.bodyType) || 0;
        bodyTypeCounts.set(product.bodyType, count + 1);
      }
    });

    return Array.from(bodyTypeCounts.entries())
      .map(([bodyType, count]) => ({ bodyType, count }))
      .sort((a, b) => a.bodyType.localeCompare(b.bodyType));
  }, [displayProducts]);

  // Dostępne zakresy lat z liczbą produktów
  const availableYearRanges = useMemo(() => {
    const yearRangeCounts = new Map<string, number>();

    displayProducts.forEach((product) => {
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
  }, [displayProducts]);

  // Wyodrębnij unikalne kombinacje modelu i typu nadwozia z produktów
  const availableModels = useMemo(() => {
    const modelBodyTypeMap = new Map<string, { model: string; bodyType: string; count: number }>();
    displayProducts.forEach((product) => {
      const modelName = product.model;
      const bodyType = product.bodyType || 'universal';
      const key = `${modelName}-${bodyType}`;
      
      if (!modelBodyTypeMap.has(key)) {
        modelBodyTypeMap.set(key, {
          model: modelName,
          bodyType: bodyType,
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
  }, [displayProducts]);

  // Filtrowanie produktów
  const filteredProducts = useMemo(() => {
    let filtered = displayProducts;

    // Filtrowanie według wybranego modelu i typu nadwozia
    if (selectedModel && selectedBodyType) {
      filtered = filtered.filter(
        (product) => product.model === selectedModel && (product.bodyType || 'universal') === selectedBodyType
      );
    } else if (selectedModel) {
      // Jeśli wybrano tylko model (bez typu nadwozia), pokaż wszystkie warianty tego modelu
      filtered = filtered.filter((product) => product.model === selectedModel);
    }

    // Filtrowanie według typu nadwozia (dodatkowe filtry)
    if (filters.bodyTypes.length > 0) {
      filtered = filtered.filter(
        (product) => product.bodyType && filters.bodyTypes.includes(product.bodyType)
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
  }, [displayProducts, selectedModel, selectedBodyType, filters]);

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
            <div className="text-center">
              <div className="text-white text-xl mb-4">Brak dostępnych produktów</div>
              <div className="text-gray-400 mb-4">
                Nie znaleziono produktów dla marki {currentBrand.displayName}
              </div>
              <Link href="/dywaniki" className="text-red-500 hover:text-red-400 mt-4 inline-block">
                ← Wróć do wyboru marki
              </Link>
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
            <Link href="/modele" className="hover:text-white transition-colors">Modele aut</Link>
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

