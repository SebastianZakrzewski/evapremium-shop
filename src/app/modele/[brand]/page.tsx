"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Car, ArrowLeft, Search, Filter } from "lucide-react";
import { CarModel } from "@/lib/types/car-model";
import { Separator } from "@/components/ui/separator";

interface BrandPageProps {
  params: Promise<{
    brand: string;
  }>;
}

export default function BrandPage({ params }: BrandPageProps) {
  const router = useRouter();
  const [brand, setBrand] = useState<string>("");
  const [carModels, setCarModels] = useState<CarModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBodyType, setSelectedBodyType] = useState<string>("");
  const [selectedEngineType, setSelectedEngineType] = useState<string>("");

  // Mapowanie nazw marek
  const brandMapping: Record<string, { displayName: string; logo: string }> = {
    bmw: { displayName: "BMW", logo: "/images/products/bmw.png" },
    mercedes: { displayName: "Mercedes", logo: "/images/products/mercedes.jpg" },
    audi: { displayName: "Audi", logo: "/images/products/audi.jpg" },
    porsche: { displayName: "Porsche", logo: "/images/products/porsche.png" },
    tesla: { displayName: "Tesla", logo: "/images/products/tesla.avif" }
  };

  const currentBrand = brandMapping[brand.toLowerCase()];

  // Pobierz brand z params
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setBrand(resolvedParams.brand);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    const fetchCarModels = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/car-models?brandName=${brand.toLowerCase()}`);
        if (response.ok) {
          const data = await response.json();
          setCarModels(data);
        } else {
          console.error("Failed to fetch car models");
        }
      } catch (error) {
        console.error("Error fetching car models:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentBrand && brand) {
      fetchCarModels();
    }
  }, [brand, currentBrand]);

  // Filtrowanie modeli
  const filteredModels = carModels.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.displayName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBodyType = !selectedBodyType || model.bodyType === selectedBodyType;
    const matchesEngineType = !selectedEngineType || model.engineType === selectedEngineType;
    
    return matchesSearch && matchesBodyType && matchesEngineType;
  });

  // Unikalne typy nadwozi i silników
  const bodyTypes = [...new Set(carModels.map(model => model.bodyType).filter(Boolean))];
  const engineTypes = [...new Set(carModels.map(model => model.engineType).filter(Boolean))];

  if (!currentBrand) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Marka nie została znaleziona</h1>
          <Link href="/modele" className="text-red-500 hover:text-red-400">
            ← Wróć do wszystkich marek
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-900 to-black py-8">
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
              <li>
                <Link href="/modele" className="hover:text-white transition-colors">
                  Modele aut
                </Link>
              </li>
              <li className="text-gray-600">/</li>
              <li className="text-white font-medium">{currentBrand.displayName}</li>
            </ol>
          </nav>

          {/* Brand Header */}
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 relative">
              <Image
                src={currentBrand.logo}
                alt={`${currentBrand.displayName} logo`}
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {currentBrand.displayName}
              </h1>
              <p className="text-xl text-gray-300">
                Dywaniki samochodowe dopasowane do modeli {currentBrand.displayName}
              </p>
            </div>
          </div>


        </div>
      </div>

      {/* Models Grid with Filters */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Panel filtrowania - lewa strona */}
          <div className="lg:w-1/4">
            <div className="bg-gray-900/50 rounded-lg p-6 sticky top-4 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Filtry</h2>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedBodyType("");
                    setSelectedEngineType("");
                  }}
                  className="text-red-400 hover:text-red-300 text-sm font-medium"
                >
                  Wyczyść
                </button>
              </div>

              {/* Wyszukiwanie */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-3">Wyszukiwanie</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Szukaj modelu..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  />
                </div>
              </div>

              <Separator className="bg-gray-700 mb-6" />

              {/* Typ nadwozia */}
              {bodyTypes.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-white mb-3">Typ nadwozia</h3>
                  <div className="space-y-2">
                    {bodyTypes.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={`body-${type}`}
                          name="bodyType"
                          value={type}
                          checked={selectedBodyType === type}
                          onChange={(e) => setSelectedBodyType(e.target.value)}
                          className="text-red-500 focus:ring-red-500"
                        />
                        <label 
                          htmlFor={`body-${type}`}
                          className="text-gray-300 hover:text-white cursor-pointer text-sm"
                        >
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {bodyTypes.length > 0 && <Separator className="bg-gray-700 mb-6" />}

              {/* Typ silnika */}
              {engineTypes.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-white mb-3">Typ silnika</h3>
                  <div className="space-y-2">
                    {engineTypes.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={`engine-${type}`}
                          name="engineType"
                          value={type}
                          checked={selectedEngineType === type}
                          onChange={(e) => setSelectedEngineType(e.target.value)}
                          className="text-red-500 focus:ring-red-500"
                        />
                        <label 
                          htmlFor={`engine-${type}`}
                          className="text-gray-300 hover:text-white cursor-pointer text-sm"
                        >
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Grid modeli - prawa strona */}
          <div className="lg:w-3/4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
                <p className="text-gray-400 mt-4">Ładowanie modeli...</p>
              </div>
            ) : filteredModels.length === 0 ? (
              <div className="text-center py-12">
                <Car className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Brak modeli</h3>
                <p className="text-gray-400">
                  Nie znaleziono modeli spełniających kryteria wyszukiwania.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredModels.map((model) => (
                  <div
                    key={model.id}
                    className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-red-500/50 transition-all duration-300 group cursor-pointer"
                    onClick={() => router.push(`/modele/${brand}`)}
                  >
                    {/* Model Image */}
                    <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                      <Image
                        src={currentBrand.logo}
                        alt={`${model.displayName || model.name}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                    </div>

                    {/* Model Info */}
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors">
                        {model.displayName || model.name}
                      </h3>
                      
                      <div className="flex flex-wrap gap-2">
                        {model.bodyType && (
                          <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded">
                            {model.bodyType}
                          </span>
                        )}
                        {model.engineType && (
                          <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded">
                            {model.engineType}
                          </span>
                        )}
                        {model.yearFrom && (
                          <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">
                            od {model.yearFrom}
                          </span>
                        )}
                      </div>

                      <p className="text-gray-400 text-sm">
                        Kliknij aby skonfigurować dywaniki
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="container mx-auto px-4 pb-8">
        <Link
          href="/modele"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Wróć do wszystkich marek
        </Link>
      </div>
    </div>
  );
} 