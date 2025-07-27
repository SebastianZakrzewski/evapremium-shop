"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Model } from "../types/carousel";
import { getAllModels, brands } from "../data/carouselData";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { CarModel } from "../lib/types/car-model";

interface FilterState {
  years: number[];
  priceRange: [number, number];
  vehicleType: string[];
}

export default function CarModelsSection() {
  const searchParams = useSearchParams();
  const brandParam = searchParams.get('brand');
  
  // Stan dla modeli z API
  const [apiModels, setApiModels] = useState<CarModel[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Fallback do statycznych danych
  const allModels = getAllModels();
  
  // Stan filtrów
  const [filters, setFilters] = useState<FilterState>({
    years: [],
    priceRange: [0, 500000],
    vehicleType: []
  });

  // Pobieranie modeli z API gdy podano markę
  useEffect(() => {
    if (brandParam) {
      setLoading(true);
      fetch(`/api/car-models?brandName=${brandParam}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          // Upewnij się, że data jest tablicą
          setApiModels(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching models:', error);
          setApiModels([]);
          setLoading(false);
        });
    } else {
      setApiModels([]);
    }
  }, [brandParam]);

  // Mapowanie modeli z API na format komponentu
  const mappedApiModels: Model[] = useMemo(() => {
    if (!Array.isArray(apiModels) || apiModels.length === 0) {
      return [];
    }
    return apiModels.map(model => ({
      id: model.id,
      name: model.name,
      brand: model.carBrand?.displayName || model.carBrand?.name || 'Unknown',
      year: model.yearFrom || 2024,
      imageSrc: model.carBrand?.logo || '/images/products/audi.jpg',
      price: '200,000 PLN',
      description: `${model.bodyType || 'Samochód'} ${model.engineType || 'silnik'}`
    }));
  }, [apiModels]);

  // Używaj modeli z API jeśli są dostępne, w przeciwnym razie statyczne
  const modelsToDisplay = brandParam && mappedApiModels.length > 0 ? mappedApiModels : allModels;

  // Dostępne opcje filtrowania
  const availableYears = useMemo(() => {
    const years = [...new Set(modelsToDisplay.map(model => model.year))];
    return years.sort((a, b) => b - a);
  }, [modelsToDisplay]);

  const availableVehicleTypes = useMemo(() => {
    const types = new Set<string>();
    modelsToDisplay.forEach(model => {
      if (model.description?.includes('SUV')) types.add('SUV');
      if (model.description?.includes('sedan')) types.add('Sedan');
      if (model.description?.includes('sportowy')) types.add('Sportowy');
      if (model.description?.includes('elektryczny')) types.add('Elektryczny');
      if (model.description?.includes('luksusowy')) types.add('Luksusowy');
      if (model.description?.includes('suv')) types.add('SUV');
      if (model.description?.includes('petrol')) types.add('Benzyna');
      if (model.description?.includes('electric')) types.add('Elektryczny');
    });
    return Array.from(types);
  }, [modelsToDisplay]);

  // Filtrowanie modeli
  const filteredModels = useMemo(() => {
    return modelsToDisplay.filter(model => {
      // Filtrowanie po roku
      if (filters.years.length > 0 && !filters.years.includes(model.year)) {
        return false;
      }

      // Filtrowanie po cenie
      const price = parseInt(model.price?.replace(/[^\d]/g, '') || '0');
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
        return false;
      }

      // Filtrowanie po typie pojazdu
      if (filters.vehicleType.length > 0) {
        const modelType = filters.vehicleType.some(type => 
          model.description?.toLowerCase().includes(type.toLowerCase())
        );
        if (!modelType) return false;
      }

      return true;
    });
  }, [modelsToDisplay, filters]);

  // Handlery dla filtrów
  const handleYearChange = (year: number, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      years: checked 
        ? [...prev.years, year]
        : prev.years.filter(y => y !== year)
    }));
  };

  const handleVehicleTypeChange = (type: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      vehicleType: checked 
        ? [...prev.vehicleType, type]
        : prev.vehicleType.filter(t => t !== type)
    }));
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    setFilters(prev => ({
      ...prev,
      priceRange: [min, max]
    }));
  };

  const clearFilters = () => {
    setFilters({
      years: [],
      priceRange: [0, 500000],
      vehicleType: []
    });
  };

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
            <li className="text-white font-medium">Modele aut</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            {brandParam ? `MODELE ${brandParam.toUpperCase()}` : 'MODELE AUT'}
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            {brandParam 
              ? `Wybierz model ${brandParam} i spersonalizuj dywaniki samochodowe.`
              : 'Wybierz model swojego auta i spersonalizuj dywaniki samochodowe. Oferujemy dywaniki do Audi, BMW, Mercedes, Tesla i Porsche.'
            }
          </p>
          {brandParam && (
            <div className="mt-4">
              <Link 
                href="/modele" 
                className="text-red-400 hover:text-red-300 text-sm font-medium"
              >
                ← Zobacz wszystkie marki
              </Link>
              {mappedApiModels.length === 0 && !loading && (
                <div className="mt-2">
                  <p className="text-yellow-400 text-sm">
                    ⚠️ Używamy statycznych danych (API tymczasowo niedostępne)
                  </p>
                </div>
              )}
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

              {/* Rok produkcji */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-3">Rok produkcji</h3>
                <div className="space-y-2">
                  {availableYears.map((year) => (
                    <div key={year} className="flex items-center space-x-2">
                      <Checkbox
                        id={`year-${year}`}
                        checked={filters.years.includes(year)}
                        onCheckedChange={(checked) => 
                          handleYearChange(year, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={`year-${year}`}
                        className="text-gray-300 hover:text-white cursor-pointer"
                      >
                        {year}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="bg-gray-700 mb-6" />

              {/* Typ pojazdu */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-3">Typ pojazdu</h3>
                <div className="space-y-2">
                  {availableVehicleTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${type}`}
                        checked={filters.vehicleType.includes(type)}
                        onCheckedChange={(checked) => 
                          handleVehicleTypeChange(type, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={`type-${type}`}
                        className="text-gray-300 hover:text-white cursor-pointer"
                      >
                        {type}
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
                    max="500000"
                    step="10000"
                    value={filters.priceRange[1]}
                    onChange={(e) => handlePriceRangeChange(filters.priceRange[0], parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>

              {/* Liczba wyników */}
              <div className="text-center">
                <p className="text-gray-400 text-sm">
                  Znaleziono: <span className="text-white font-semibold">{filteredModels.length}</span> modeli
                </p>
              </div>
            </div>
          </div>

          {/* Grid z modelami - prawa strona */}
          <div className="lg:w-3/4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
                <p className="text-gray-400 mt-4">Ładowanie modeli...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredModels.map((model) => (
                  <article
                    key={model.id}
                    className="flex items-center justify-center group cursor-pointer"
                  >
                    <Link 
                      href={`/modele/${model.brand.toLowerCase()}/${model.name.toLowerCase()}-${model.year}`}
                      className="flex flex-col items-center text-center transition-all duration-300 transform hover:scale-105"
                    >
                      {/* Car Model Window */}
                      <div className="mb-4 bg-black rounded-xl p-4 w-40 h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl">
                        <div className="w-full h-full relative">
                          <Image
                            src={model.imageSrc}
                            alt={`Dywaniki do ${model.brand} ${model.name} ${model.year} - Spersonalizowane dywaniki samochodowe`}
                            fill
                            className="object-cover rounded-lg transition-all duration-300 group-hover:scale-110"
                            sizes="(max-width: 768px) 160px 160px, (max-width: 1024px) 192px 192px, 224px 224px"
                            priority={model.id <= 6}
                            quality={95}
                            placeholder="blur"
                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                          />
                          {/* Overlay for better text readability */}
                          <div className="absolute inset-0 bg-black/30 rounded-lg" />
                        </div>
                      </div>
                      
                      {/* Car Model Info */}
                      <div className="text-center">
                        <h3 className="text-lg md:text-xl font-semibold text-white transition-all duration-300 group-hover:text-red-400 mb-2">
                          {model.name}
                        </h3>
                        <p className="text-sm md:text-base text-gray-300 transition-all duration-300 group-hover:text-white mb-2">
                          {model.brand} • {model.year}
                        </p>
                        {model.price && (
                          <p className="text-red-400 font-semibold text-base md:text-lg transition-all duration-300 group-hover:text-red-300">
                            {model.price}
                          </p>
                        )}
                        {model.description && (
                          <p className="text-xs md:text-sm text-gray-400 mt-2 max-w-xs transition-all duration-300 group-hover:text-gray-300">
                            {model.description}
                          </p>
                        )}
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            )}

            {/* Brak wyników */}
            {!loading && filteredModels.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">
                  Nie znaleziono modeli spełniających kryteria wyszukiwania.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-red-400 hover:text-red-300 font-medium"
                >
                  Wyczyść filtry
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
} 