"use client";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ShoppingCart, AlertCircle } from "lucide-react";
import { getAvailableColors, getColorInfo } from "@/lib/color-mapping";
import { getMatImagePath } from "@/lib/image-mapping";
import { useCart } from "@/hooks/useCart.new";
import { useMat } from "@/hooks/useMat";
import { PricingService } from "@/lib/services/PricingService";
import { brands, getModelsByBrand } from "@/data/carouselData";
import { Brand, Model } from "@/types/carousel";
import { getYearsForModel, getModelData, findGenerationByYear, getAvailableModels, getBodyTypesForYear, getBodyTypesForModel } from "@/data/car-model-years.utils";
import { debugLog } from "@/lib/config/features";

// Dodaj event do otwierania modala koszyka
const openCartModal = () => {
  window.dispatchEvent(new CustomEvent('openCartModal'));
};

// Mapowanie ID na typy dla funkcji getMatImagePath
const getMatTypeForImage = (setTypeId: string): '3d' | 'classic' => {
  if (setTypeId === 'classic') return 'classic';
  return '3d'; // dla '3d-with-rims' i '3d-without-rims'
};

type MatColor = {
  id: string;
  name: string;
  swatch: string; // image path
};

type EdgeColor = {
  id: string;
  name: string;
  hex: string;
};

type SetType = {
  id: string;
  name: string;
  description: string;
  priceModifier: number;
  image: string;
};

type CellType = {
  id: string;
  name: string;
  description: string;
  priceModifier: number;
};

type SetVariant = {
  id: string;
  name: string;
  description: string;
  priceModifier: number;
};

// Struktura cenowa dla dynamicznego systemu cen
const PRICING = {
  matTypes: {
    '3d-with-rims': { modifier: 0, label: '+0 zł' },
    'classic': { modifier: -40, label: '-40 zł' }
  },
  setVariants: {
    'front': 150,
    'basic': 300,
    'premium': 450,
    'complete': 600
  },
  extras: {
    cellType: { diamonds: 0, honey: 10 },
    heelPad: 30
  }
};

const setTypes: SetType[] = [
  { id: "3d-with-rims", name: "3D z rantami", description: "Dywaniki 3D z wysokimi rantami", priceModifier: 0, image: "/images/zalety/dywanik_z_rantami.png" },
  { id: "classic", name: "3D bez rantów", description: "Dywaniki standardowe", priceModifier: -40, image: "/images/konfigurator/dywaniki/klasyczne/romby/romby czarne/5os-classic-diamonds-black-black.webp" },
];

const cellTypes: CellType[] = [
  { id: "diamonds", name: "Romby", description: "Struktura rombowa", priceModifier: 0 },
  { id: "honey", name: "Plaster miodu", description: "Struktura plastra miodu", priceModifier: 10 },
];

const setVariants: SetVariant[] = [
  { id: "front", name: "Przód", description: "2 dywaniki przednie", priceModifier: 150 },
  { id: "basic", name: "Podstawowy", description: "4 dywaniki", priceModifier: 300 },
  { id: "premium", name: "Premium", description: "4 dywaniki + bagażnik", priceModifier: 450 },
  { id: "complete", name: "Kompletny", description: "4 dywaniki + bagażnik + dodatki", priceModifier: 600 },
];

/**
 * Nowy Configurator używający V2 backendu
 * 
 * Różnice względem starej wersji:
 * - Używa useMat hook do pobierania danych z API
 * - Używa useCart.new.ts (V2) do dodawania do koszyka
 * - Używa PricingService do obliczania cen
 * - Dynamiczne pobieranie dostępnych opcji z backendu
 * - Zachowuje identyczny wygląd i funkcjonalność
 */
export default function ConfiguratorNew() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart, isLoading: cartLoading } = useCart();

  // Stan konfiguracji
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedGeneration, setSelectedGeneration] = useState<string | null>(null);
  const [selectedBodyType, setSelectedBodyType] = useState<string | null>(null);
  const [selectedMatType, setSelectedMatType] = useState<string>("3d-with-rims");
  const [selectedSetVariant, setSelectedSetVariant] = useState<string>("front");
  const [selectedCellType, setSelectedCellType] = useState<string>("diamonds");
  const [selectedColor, setSelectedColor] = useState<string>("black");
  const [selectedEdgeColor, setSelectedEdgeColor] = useState<string>("gray");
  const [selectedHeelPad, setSelectedHeelPad] = useState<boolean>(false);

  // Pobierz dane dywaników z API
  const { mat, loading: matLoading, error: matError } = useMat({
    brandSlug: selectedBrand?.name?.toLowerCase().replace(/\s+/g, '-'),
    modelSlug: selectedModel?.name?.toLowerCase().replace(/\s+/g, '-'),
    generation: selectedGeneration || undefined,
    bodyType: selectedBodyType || undefined,
  });

  // Dostępne modele dla wybranej marki
  const availableModels = useMemo(() => {
    if (!selectedBrand) return [];
    return getModelsByBrand(selectedBrand.name);
  }, [selectedBrand]);

  // Dostępne lata dla wybranego modelu
  const availableYears = useMemo(() => {
    if (!selectedModel) return [];
    return getYearsForModel(selectedBrand?.name || '', selectedModel.name);
  }, [selectedModel, selectedBrand]);

  // Dostępne generacje dla wybranego roku
  const availableGenerations = useMemo(() => {
    if (!selectedYear || !selectedModel) return [];
    const generation = findGenerationByYear(selectedBrand?.name || '', selectedModel.name, selectedYear);
    return generation ? [generation] : [];
  }, [selectedYear, selectedModel, selectedBrand]);

  // Dostępne typy nadwozia dla wybranego roku
  const availableBodyTypesForYear = useMemo(() => {
    if (!selectedYear || !selectedModel) return [];
    return getBodyTypesForYear(selectedBrand?.name || '', selectedModel.name, selectedYear);
  }, [selectedYear, selectedModel, selectedBrand]);

  // Dostępne kolory materiału (z backendu lub fallback)
  const availableColors = useMemo(() => {
    if (mat?.availableColors) {
      return mat.availableColors.map(color => {
        const colorInfo = getColorInfo(color);
        return {
          id: color,
          name: colorInfo.name,
          swatch: `/images/kolory dywanikow/${color}.jpg`
        };
      });
    }
    return getAvailableColors(selectedCellType, 'material').map(color => {
      const colorInfo = getColorInfo(color);
      return {
        id: color,
        name: colorInfo.name,
        swatch: `/images/kolory dywanikow/${color}.jpg`
      };
    });
  }, [mat?.availableColors, selectedCellType]);

  // Dostępne kolory obszycia (z backendu lub fallback)
  const availableEdgeColors = useMemo(() => {
    if (mat?.availableEdgeColors) {
      return mat.availableEdgeColors.map(color => {
        const colorInfo = getColorInfo(color);
        return {
          id: color,
          name: colorInfo.name,
          hex: colorInfo.color
        };
      });
    }
    return [
      { id: "black", name: "Czarny", hex: "#000000" },
      { id: "gray", name: "Szary", hex: "#666666" },
      { id: "red", name: "Czerwony", hex: "#FF0000" },
      { id: "blue", name: "Niebieski", hex: "#0000FF" },
    ];
  }, [mat?.availableEdgeColors]);

  // Dostępne typy zestawów (z backendu lub fallback)
  const availableSetTypes = useMemo(() => {
    if (mat?.availableSetTypes) {
      return setTypes.filter(type => mat.availableSetTypes.includes(type.id));
    }
    return setTypes;
  }, [mat?.availableSetTypes]);

  // Dostępne typy komórek (z backendu lub fallback)
  const availableCellTypes = useMemo(() => {
    if (mat?.availableCellTypes) {
      return cellTypes.filter(type => mat.availableCellTypes.includes(type.id));
    }
    return cellTypes;
  }, [mat?.availableCellTypes]);

  // Oblicz cenę
  const calculatePrice = useCallback(() => {
    if (!mat) return 0;
    
    const configuration = {
      setType: selectedSetVariant,
      cellType: selectedCellType,
      heelPad: selectedHeelPad ? 'yes' : 'no'
    };
    
    return PricingService.calculateMatPrice(mat.basePrice, configuration);
  }, [mat, selectedSetVariant, selectedCellType, selectedHeelPad]);

  const currentPrice = calculatePrice();

  // Reset selections when dependencies change
  useEffect(() => {
    if (selectedBrand && !availableModels.find(m => m.name === selectedModel?.name)) {
      setSelectedModel(null);
    }
  }, [selectedBrand, availableModels, selectedModel]);

  useEffect(() => {
    if (selectedModel && !availableYears.includes(selectedYear || 0)) {
      setSelectedYear(null);
    }
  }, [selectedModel, availableYears, selectedYear]);

  useEffect(() => {
    if (selectedYear && availableGenerations && Array.isArray(availableGenerations) && availableGenerations.length > 0) {
      const currentGeneration = selectedGeneration || '';
      if (!availableGenerations.includes(currentGeneration)) {
        setSelectedGeneration(availableGenerations[0]);
      }
    }
  }, [selectedYear, availableGenerations, selectedGeneration]);

  useEffect(() => {
    if (selectedYear && availableBodyTypesForYear.length > 0 && !availableBodyTypesForYear.includes(selectedBodyType || '')) {
      setSelectedBodyType(availableBodyTypesForYear[0]);
    }
  }, [selectedYear, availableBodyTypesForYear, selectedBodyType]);

  // Handle adding to cart
  const handleAddToCart = async () => {
    if (!mat || !selectedBrand || !selectedModel) {
      console.error('Missing required data for cart');
      return;
    }

    try {
      const configuration = {
        carDetails: {
          brand: selectedBrand.name,
          model: selectedModel.name,
          generation: selectedGeneration,
          bodyType: selectedBodyType,
          year: selectedYear || new Date().getFullYear()
        },
        setType: selectedSetVariant,
        cellType: selectedCellType,
        materialColor: selectedColor,
        edgeColor: selectedEdgeColor,
        heelPad: selectedHeelPad ? 'yes' : 'no'
      };

      await addToCart({
        productType: 'mat',
        productId: mat.id,
        quantity: 1,
        configuration
      });

      debugLog('Configurator: Added to cart', configuration);
      openCartModal();
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  // Initialize from URL params
  useEffect(() => {
    const brandName = searchParams.get('brand');
    const modelName = searchParams.get('model');
    const year = searchParams.get('year');

    if (brandName) {
      const brand = brands.find(b => b.name.toLowerCase() === brandName.toLowerCase());
      if (brand) {
        setSelectedBrand(brand);
        
        if (modelName) {
          const models = getModelsByBrand(brandName);
          const model = models.find(m => m.name.toLowerCase() === modelName.toLowerCase());
          if (model) {
            setSelectedModel(model);
            
            if (year) {
              const years = getYearsForModel(brandName, modelName);
              if (years.includes(parseInt(year))) {
                setSelectedYear(parseInt(year));
              }
            }
          }
        }
      }
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Konfigurator Dywaników
          </h1>
          <p className="text-lg text-gray-600">
            Wybierz swój samochód i skonfiguruj idealne dywaniki
          </p>
        </div>

        {/* Loading State */}
        {matLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-lg">Ładowanie danych...</span>
          </div>
        )}

        {/* Error State */}
        {matError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Błąd ładowania danych
            </h3>
            <p className="text-red-600 mb-4">{matError}</p>
            <Button onClick={() => window.location.reload()}>
              Spróbuj ponownie
            </Button>
          </div>
        )}

        {/* Main Content */}
        {!matLoading && !matError && (
          <div className="space-y-8">
            {/* Step 1: Wybór samochodu */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                1. Wybierz swój samochód
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Marka */}
                <div>
                  <Label className="text-lg font-semibold mb-3 block">Marka</Label>
                  <RadioGroup value={selectedBrand?.name || ''} onValueChange={(value) => {
                    const brand = brands.find(b => b.name === value);
                    setSelectedBrand(brand || null);
                    setSelectedModel(null);
                    setSelectedYear(null);
                    setSelectedGeneration(null);
                    setSelectedBodyType(null);
                  }}>
                    {brands.map((brand) => (
                      <div key={brand.name} className="flex items-center space-x-2">
                        <RadioGroupItem value={brand.name} id={brand.name} />
                        <Label htmlFor={brand.name} className="flex items-center">
                          <Image
                            src={brand.logo}
                            alt={brand.name}
                            width={24}
                            height={24}
                            className="mr-2"
                          />
                          {brand.name}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Model */}
                <div>
                  <Label className="text-lg font-semibold mb-3 block">Model</Label>
                  <RadioGroup 
                    value={selectedModel?.name || ''} 
                    onValueChange={(value) => {
                      const model = availableModels.find(m => m.name === value);
                      setSelectedModel(model || null);
                      setSelectedYear(null);
                      setSelectedGeneration(null);
                      setSelectedBodyType(null);
                    }}
                    disabled={!selectedBrand}
                  >
                    {availableModels.map((model) => (
                      <div key={model.name} className="flex items-center space-x-2">
                        <RadioGroupItem value={model.name} id={model.name} />
                        <Label htmlFor={model.name}>{model.name}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Rok */}
                <div>
                  <Label className="text-lg font-semibold mb-3 block">Rok produkcji</Label>
                  <RadioGroup 
                    value={selectedYear?.toString() || ''} 
                    onValueChange={(value) => {
                      setSelectedYear(parseInt(value));
                      setSelectedGeneration(null);
                      setSelectedBodyType(null);
                    }}
                    disabled={!selectedModel}
                  >
                    {availableYears.map((year) => (
                      <div key={year} className="flex items-center space-x-2">
                        <RadioGroupItem value={year.toString()} id={year.toString()} />
                        <Label htmlFor={year.toString()}>{year}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>

              {/* Generacja i nadwozie - tylko gdy dostępne */}
              {((availableGenerations && availableGenerations.length > 0) || availableBodyTypesForYear.length > 0) && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Generacja */}
                  {availableGenerations && availableGenerations.length > 0 && (
                    <div>
                      <Label className="text-lg font-semibold mb-3 block">Generacja</Label>
                      <RadioGroup 
                        value={selectedGeneration || ''} 
                        onValueChange={setSelectedGeneration}
                      >
                        {Array.isArray(availableGenerations) && availableGenerations.map((generation: string) => (
                          <div key={generation} className="flex items-center space-x-2">
                            <RadioGroupItem value={generation} id={generation} />
                            <Label htmlFor={generation}>{generation}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  )}

                  {/* Typ nadwozia */}
                  {availableBodyTypesForYear.length > 0 && (
                    <div>
                      <Label className="text-lg font-semibold mb-3 block">Typ nadwozia</Label>
                      <RadioGroup 
                        value={selectedBodyType || ''} 
                        onValueChange={setSelectedBodyType}
                      >
                        {availableBodyTypesForYear.map((bodyType) => (
                          <div key={bodyType} className="flex items-center space-x-2">
                            <RadioGroupItem value={bodyType} id={bodyType} />
                            <Label htmlFor={bodyType} className="capitalize">{bodyType}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 2: Wybór rodzaju dywaników */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                2. Wybierz rodzaj dywaników
              </h2>
              
              <RadioGroup value={selectedMatType} onValueChange={setSelectedMatType}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableSetTypes.map((type) => (
                    <Label
                      key={type.id}
                      htmlFor={type.id}
                      className={`flex items-center justify-between border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        selectedMatType === type.id
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value={type.id} id={type.id} />
                        <div>
                          <div className="text-lg font-semibold text-gray-900">
                            {type.name}
                          </div>
                          <p className="text-gray-600 text-sm">{type.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-green-600">
                          {type.priceModifier >= 0 ? '+' : ''}{type.priceModifier} zł
                        </span>
                      </div>
                    </Label>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Step 3: Wybór zestawu */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                3. Wybierz zestaw
              </h2>
              
              <RadioGroup value={selectedSetVariant} onValueChange={setSelectedSetVariant}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {setVariants.map((variant) => (
                    <div key={variant.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="text-center">
                        <Image
                          src={getMatImagePath(getMatTypeForImage(selectedMatType), selectedCellType as any, selectedColor, selectedEdgeColor)}
                          alt={variant.name}
                          width={120}
                          height={80}
                          className="mx-auto mb-3 rounded"
                        />
                        <RadioGroupItem value={variant.id} id={variant.id} className="mb-2" />
                        <Label htmlFor={variant.id} className="block text-lg font-semibold">
                          {variant.name}
                        </Label>
                        <p className="text-gray-600 text-sm mb-2">{variant.description}</p>
                        <span className="text-lg font-bold text-green-600">
                          {PricingService.formatPrice(variant.priceModifier)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Step 4: Wybór struktury komórek */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                4. Wybierz strukturę komórek
              </h2>
              
              <RadioGroup value={selectedCellType} onValueChange={setSelectedCellType}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableCellTypes.map((type) => (
                    <div key={type.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value={type.id} id={type.id} />
                        <div className="flex-1">
                          <Label htmlFor={type.id} className="text-lg font-semibold">
                            {type.name}
                          </Label>
                          <p className="text-gray-600 text-sm">{type.description}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-green-600">
                            {type.priceModifier >= 0 ? '+' : ''}{type.priceModifier} zł
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Step 5: Wybór kolorów */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                5. Wybierz kolory
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Kolor materiału */}
                <div>
                  <Label className="text-lg font-semibold mb-4 block">Kolor materiału</Label>
                  <RadioGroup value={selectedColor} onValueChange={setSelectedColor}>
                    <div className="grid grid-cols-2 gap-3">
                      {availableColors.map((color) => (
                        <div key={color.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={color.id} id={color.id} />
                          <Label htmlFor={color.id} className="flex items-center">
                            <Image
                              src={color.swatch}
                              alt={color.name}
                              width={24}
                              height={24}
                              className="mr-2 rounded"
                            />
                            {color.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                {/* Kolor obszycia */}
                <div>
                  <Label className="text-lg font-semibold mb-4 block">Kolor obszycia</Label>
                  <RadioGroup value={selectedEdgeColor} onValueChange={setSelectedEdgeColor}>
                    <div className="grid grid-cols-2 gap-3">
                      {availableEdgeColors.map((color) => (
                        <div key={color.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={color.id} id={color.id} />
                          <Label htmlFor={color.id} className="flex items-center">
                            <div
                              className="w-6 h-6 rounded mr-2 border"
                              style={{ backgroundColor: color.hex }}
                            />
                            {color.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>

            {/* Step 6: Dodatki */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                6. Dodatki
              </h2>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="heelPad"
                  checked={selectedHeelPad}
                  onChange={(e) => setSelectedHeelPad(e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="heelPad" className="text-lg">
                  Ochraniacze pod pięty (+30 zł)
                </Label>
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Aktualna cena konfiguracji
                </h2>
                <div className="text-4xl font-bold text-green-600 mb-6">
                  {PricingService.formatPrice(currentPrice)}
                </div>
                <Button
                  onClick={handleAddToCart}
                  disabled={!mat || cartLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                >
                  {cartLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Dodawanie...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Dodaj do koszyka
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
