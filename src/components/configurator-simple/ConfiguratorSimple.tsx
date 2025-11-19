"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart.new";
import { PricingService } from "@/lib/services/PricingService";
import { getMatImagePath } from "@/lib/image-mapping";
import { getColorInfo } from "@/lib/color-mapping";
import { Brand } from "@/types/carousel";
import { StepProgress } from "./StepProgress";
import { StepAccordion } from "./StepAccordion";
import { CarSelectionStep } from "./CarSelectionStep";
import { MatTypeStep } from "./MatTypeStep";
import { VariantStep } from "./VariantStep";
import { StructureStep } from "./StructureStep";
import { CombinedColorPicker } from "./CombinedColorPicker";
import { SummaryStep } from "./SummaryStep";

export interface ConfiguratorState {
  // Step 1: Wybór samochodu
  brand: string;
  model: string;
  year: string;
  bodyType: string;
  
  // Step 2: Typ dywaników
  matType: "3d-with-rims" | "classic";
  
  // Step 3: Wariant zestawu
  variant: "front" | "basic" | "premium" | "complete";
  
  // Step 4: Struktura
  structure: "diamonds" | "honey";
  
  // Step 5: Kolor dywaników
  color: string;
  
  // Step 6: Kolor obszycia
  edgeColor: string;
  
  // Step 7: Dodatki
  heelPad: boolean;
}

const TOTAL_STEPS = 7;

// Mapowanie ID na typy dla funkcji getMatImagePath
const getMatTypeForImage = (setTypeId: string): '3d' | 'classic' => {
  if (setTypeId === 'classic') return 'classic';
  return '3d'; // dla '3d-with-rims'
};

// Funkcja do pobierania marek
const fetchBrands = async (): Promise<Brand[]> => {
  const response = await fetch('/api/car-brands');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export default function ConfiguratorSimple() {
  const searchParams = useSearchParams();
  const { addToCart, isLoading: cartLoading } = useCart();
  
  // Pobierz marki
  const { data: brands = [] } = useQuery<Brand[]>({
    queryKey: ['car-brands'],
    queryFn: fetchBrands,
    staleTime: 10 * 60 * 1000,
  });
  
  // Funkcja do pobierania logo marki
  const getBrandLogo = (brandName: string): string | null => {
    if (!brandName || !brands.length) return null;
    const brand = brands.find(b => b.name.toLowerCase() === brandName.toLowerCase());
    return brand?.logo || null;
  };
  
  // Funkcje nawigacji dla galerii zdjęć produktu typu "classic"
  const goToPreviousClassicImage = () => {
    const currentIndex = classicProductImages.indexOf(selectedClassicProductImage);
    const previousIndex = currentIndex === 0 ? classicProductImages.length - 1 : currentIndex - 1;
    setSelectedClassicProductImage(classicProductImages[previousIndex]);
  };
  
  const goToNextClassicImage = () => {
    const currentIndex = classicProductImages.indexOf(selectedClassicProductImage);
    const nextIndex = currentIndex === classicProductImages.length - 1 ? 0 : currentIndex + 1;
    setSelectedClassicProductImage(classicProductImages[nextIndex]);
  };
  
  // Funkcje nawigacji dla galerii zdjęć produktu typu "3d-with-rims"
  const goToPreviousRimsImage = () => {
    const currentIndex = rimsProductImages.indexOf(selectedRimsProductImage);
    const previousIndex = currentIndex === 0 ? rimsProductImages.length - 1 : currentIndex - 1;
    setSelectedRimsProductImage(rimsProductImages[previousIndex]);
  };
  
  const goToNextRimsImage = () => {
    const currentIndex = rimsProductImages.indexOf(selectedRimsProductImage);
    const nextIndex = currentIndex === rimsProductImages.length - 1 ? 0 : currentIndex + 1;
    setSelectedRimsProductImage(rimsProductImages[nextIndex]);
  };
  
  // Stan konfiguracji
  const [config, setConfig] = useState<ConfiguratorState>({
    brand: searchParams.get('brand') || '',
    model: searchParams.get('model') || '',
    year: '',
    bodyType: searchParams.get('bodyType') || '',
    matType: '3d-with-rims',
    variant: 'front',
    structure: 'diamonds',
    color: 'black',
    edgeColor: 'black',
    heelPad: false,
  });

  // Aktualny aktywny krok (dla accordion)
  const [activeStep, setActiveStep] = useState<number>(1);

  // Refs dla każdego kroku (do przewijania)
  const stepRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // Mapuj parametr marki z URL na właściwą nazwę marki z listy
  useEffect(() => {
    const brandParam = searchParams.get('brand');
    if (brandParam && brands.length > 0) {
      // Znajdź markę w liście marek (porównując lowercase)
      const foundBrand = brands.find(b => b.name.toLowerCase() === brandParam.toLowerCase());
      if (foundBrand) {
        // Zaktualizuj config.brand właściwą nazwą marki (z wielką literą)
        setConfig(prev => {
          // Aktualizuj tylko jeśli marka się różni
          if (prev.brand !== foundBrand.name) {
            return { ...prev, brand: foundBrand.name };
          }
          return prev;
        });
      }
    }
  }, [brands, searchParams]);
  
  // Stan dodawania do koszyka
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Stan modala z podglądem
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [modalImageType, setModalImageType] = useState<'dynamic' | 'product' | null>(null);
  
  // Stan aktywnego widoku podglądu (tabs)
  const [activePreviewTab, setActivePreviewTab] = useState<'dynamic' | 'product'>('dynamic');
  
  // Stan wybranego zdjęcia produktu dla typu "classic" (bez rantów)
  const [selectedClassicProductImage, setSelectedClassicProductImage] = useState<string>('/bezrantowprodukt/1_-_1.webp');
  
  // Lista dostępnych zdjęć produktu dla typu "classic"
  const classicProductImages = [
    '/bezrantowprodukt/1_-_1.webp',
    '/bezrantowprodukt/5_-_1_red.webp',
    '/bezrantowprodukt/5-_3_red.webp',
    '/bezrantowprodukt/5-_4_red.webp',
    '/bezrantowprodukt/5-_5_red.webp',
    '/bezrantowprodukt/6_-_1.webp',
    '/bezrantowprodukt/4_-_2_1.webp',
  ];
  
  // Stan wybranego zdjęcia produktu dla typu "3d-with-rims" (z rantami)
  const [selectedRimsProductImage, setSelectedRimsProductImage] = useState<string>('/zrantamiprodukt/5_-_1.webp');
  
  // Lista dostępnych zdjęć produktu dla typu "3d-with-rims"
  const rimsProductImages = [
    '/zrantamiprodukt/5_-_1.webp',
    '/zrantamiprodukt/5_-_2.webp',
    '/zrantamiprodukt/5_-_4.webp',
    '/zrantamiprodukt/5_-_5.webp',
    '/zrantamiprodukt/5_-_8.webp',
    '/zrantamiprodukt/6_-_2.webp',
    '/zrantamiprodukt/komplet5dyw.webp',
  ];

  // Oblicz cenę na podstawie konfiguracji
  const priceBreakdown = useMemo(() => {
    return PricingService.calculateConfiguratorPrice(config.matType, config.variant);
  }, [config.matType, config.variant]);

  // Generuj ścieżkę do dynamicznego obrazu dywanika (zmienia się z kolorami/strukturą)
  const dynamicPreviewPath = useMemo(() => {
    if (!config.structure || !config.color || !config.edgeColor) {
      return '/dywaniki/3d/diamonds/black/5os-3d-diamonds-black-black.webp'; // Fallback
    }
    
    const matType = getMatTypeForImage(config.matType);
    return getMatImagePath(
      matType,
      config.structure,
      config.color,
      config.edgeColor
    );
  }, [config.matType, config.structure, config.color, config.edgeColor]);

  // Generuj ścieżkę do zdjęcia produktu (wybrane zdjęcie z galerii)
  // Pokazuj tylko jeśli użytkownik faktycznie przeszedł przez krok wyboru typu dywaników (activeStep >= 2)
  const productPreviewPath = useMemo(() => {
    // Jeśli użytkownik jeszcze nie wybrał typu dywaników, nie pokazuj zdjęcia produktu
    if (activeStep < 2) {
      return null;
    }
    if (config.matType === '3d-with-rims') {
      return selectedRimsProductImage;
    } else if (config.matType === 'classic') {
      return selectedClassicProductImage;
    }
    return null;
  }, [config.matType, activeStep, selectedClassicProductImage, selectedRimsProductImage]);
  
  // Resetuj wybrane zdjęcie gdy zmienia się typ dywaników
  useEffect(() => {
    if (config.matType === 'classic' && !classicProductImages.includes(selectedClassicProductImage)) {
      setSelectedClassicProductImage(classicProductImages[0]);
    } else if (config.matType === '3d-with-rims' && !rimsProductImages.includes(selectedRimsProductImage)) {
      setSelectedRimsProductImage(rimsProductImages[0]);
    }
  }, [config.matType, selectedClassicProductImage, selectedRimsProductImage]);

  // Sprawdź czy mamy pełny podgląd (wszystkie opcje wybrane)
  const hasFullPreview = config.structure && config.color && config.edgeColor;

  // Automatyczne przełączanie na dostępny tab
  useEffect(() => {
    if (activePreviewTab === 'dynamic' && !hasFullPreview && productPreviewPath) {
      setActivePreviewTab('product');
    } else if (activePreviewTab === 'product' && !productPreviewPath && hasFullPreview) {
      setActivePreviewTab('dynamic');
    }
  }, [activePreviewTab, hasFullPreview, productPreviewPath]);

  // Zapisz konfigurację do localStorage
  useEffect(() => {
    localStorage.setItem('configurator-simple-state', JSON.stringify(config));
  }, [config]);

  // Załaduj konfigurację z localStorage przy starcie (ale nie nadpisuj wartości z URL)
  useEffect(() => {
    const brandParam = searchParams.get('brand');
    const modelParam = searchParams.get('model');
    const bodyTypeParam = searchParams.get('bodyType');
    
    const saved = localStorage.getItem('configurator-simple-state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig(prev => {
          // Zachowaj wartości z URL jeśli istnieją
          const updates: Partial<ConfiguratorState> = { ...parsed };
          if (brandParam) {
            // Marka z URL ma priorytet - zostanie zmapowana przez osobny useEffect
            delete updates.brand;
          }
          if (modelParam) {
            updates.model = modelParam;
          }
          if (bodyTypeParam) {
            updates.bodyType = bodyTypeParam;
          }
          return { ...prev, ...updates };
        });
      } catch (e) {
        console.error('Error loading saved config:', e);
      }
    }
  }, [searchParams]);

  // Aktualizuj konfigurację
  const updateConfig = (updates: Partial<ConfiguratorState>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  // Walidacja kroku
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(config.brand && config.model && config.year && config.bodyType);
      case 2:
        return !!config.matType;
      case 3:
        return !!config.variant;
      case 4:
        return !!config.structure;
      case 5:
        return !!(config.color && config.edgeColor);
      case 6:
        return true; // Heel pad jest opcjonalny
      case 7:
        return isStepValid(1) && isStepValid(2) && isStepValid(3) && isStepValid(4) && isStepValid(5);
      default:
        return false;
    }
  };

  // Przejdź do następnego kroku
  const goToNextStep = () => {
    if (activeStep < TOTAL_STEPS && isStepValid(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  // Przejdź do poprzedniego kroku
  const goToPreviousStep = () => {
    if (activeStep > 1) {
      setActiveStep(prev => prev - 1);
    }
  };

  // Przejdź do konkretnego kroku
  const goToStep = (step: number) => {
    if (step >= 1 && step <= TOTAL_STEPS) {
      setActiveStep(step);
    }
  };

  // Zamknij modal ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPreviewModalOpen) {
        setIsPreviewModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isPreviewModalOpen]);

  // Automatyczne przewijanie do aktywnego kroku
  useEffect(() => {
    const stepElement = stepRefs.current[activeStep];
    if (!stepElement) return;

    // Opóźnienie aby akordeon zdążył się otworzyć przed przewinięciem
    const scrollTimeout = setTimeout(() => {
      // Oblicz offset dla sticky progress bar na górze (~100px)
      const topOffset = 100;
      
      // Pobierz pozycję elementu
      const elementRect = stepElement.getBoundingClientRect();
      const elementTop = elementRect.top + window.pageYOffset;
      
      // Oblicz docelową pozycję z uwzględnieniem offsetu górnego
      const targetPosition = elementTop - topOffset;
      
      // Przewiń do pozycji z smooth behavior
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });
    }, 150); // Opóźnienie 150ms dla animacji akordeonu

    return () => clearTimeout(scrollTimeout);
  }, [activeStep]);

  // Dodaj do koszyka
  const handleAddToCart = async () => {
    if (!isStepValid(7)) {
      return;
    }

    setIsAddingToCart(true);
    try {
      // Generuj unikalny UUID dla produktu (jak w starym konfiguratorze)
      const productId = crypto.randomUUID();
      console.log('🆔 ConfiguratorSimple: Generated UUID productId:', productId);
      
      // Mapuj typ dywanika dla funkcji getMatImagePath ('3d-with-rims' -> '3d', 'classic' -> 'classic')
      const matTypeForImage: '3d' | 'classic' = config.matType === '3d-with-rims' ? '3d' : 'classic';
      
      // Generuj ścieżkę do obrazka na podstawie konfiguracji
      const productImagePath = getMatImagePath(
        matTypeForImage,
        config.structure as 'diamonds' | 'honey',
        config.color,
        config.edgeColor
      );

      await addToCart({
        productType: 'mat',
        productId: productId, // UUID zamiast stringa
        quantity: 1,
        unitPrice: priceBreakdown.totalPrice,
        productName: `Dywaniki ${config.brand} ${config.model}`,
        productSku: `MAT-${config.brand.toUpperCase()}-${config.model.toUpperCase()}`,
        productImage: productImagePath,
        configuration: {
          carDetails: {
            brand: config.brand,
            model: config.model,
            year: config.year,
            bodyType: config.bodyType,
          },
          setType: config.matType,
          setVariant: config.variant,
          cellType: config.structure,
          materialColor: config.color,
          edgeColor: config.edgeColor,
          heelPad: config.heelPad ? 'yes' : 'no',
        },
      });

      // Otwórz modal koszyka
      window.dispatchEvent(new CustomEvent('openCartModal'));
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Sprawdź czy sticky preview powinien być widoczny (od kroku wyboru typu dywaników)
  const shouldShowStickyPreview = activeStep >= 2;
  
  // Oblicz padding bottom dla głównego kontenera - uwzględnia galerię miniatur jeśli jest widoczna
  const mainContainerPaddingBottom = shouldShowStickyPreview && config.matType 
    ? 'pb-[180px]' // Więcej miejsca gdy jest galeria miniatur + sticky bar
    : shouldShowStickyPreview 
    ? 'pb-[100px]' // Tylko sticky bar
    : '';

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Progress Bar */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <StepProgress 
            currentStep={activeStep} 
            totalSteps={TOTAL_STEPS}
            onStepClick={goToStep}
            isValid={isStepValid}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-20 pb-6 md:pb-8 ${shouldShowStickyPreview ? `lg:pb-6 md:pb-8 ${mainContainerPaddingBottom}` : ''}`}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8">
          {/* Left Column - Configuration */}
          <div className="lg:col-span-3 space-y-4 md:space-y-5">
            {/* Step 1: Wybór samochodu */}
            <StepAccordion
              ref={(el) => { stepRefs.current[1] = el; }}
              step={1}
              title="Wybór samochodu"
              isOpen={activeStep === 1}
              onToggle={() => goToStep(1)}
              isValid={isStepValid(1)}
            >
              <CarSelectionStep
                config={config}
                onUpdate={updateConfig}
                onNext={goToNextStep}
              />
            </StepAccordion>

            {/* Step 2: Typ dywaników */}
            <StepAccordion
              ref={(el) => { stepRefs.current[2] = el; }}
              step={2}
              title="Typ dywaników"
              isOpen={activeStep === 2}
              onToggle={() => goToStep(2)}
              isValid={isStepValid(2)}
              disabled={!isStepValid(1)}
            >
              <MatTypeStep
                config={config}
                onUpdate={updateConfig}
                onNext={goToNextStep}
                onPrevious={goToPreviousStep}
              />
            </StepAccordion>

            {/* Step 3: Wariant zestawu */}
            <StepAccordion
              ref={(el) => { stepRefs.current[3] = el; }}
              step={3}
              title="Wariant zestawu"
              isOpen={activeStep === 3}
              onToggle={() => goToStep(3)}
              isValid={isStepValid(3)}
              disabled={!isStepValid(2)}
            >
              <VariantStep
                config={config}
                onUpdate={updateConfig}
                onNext={goToNextStep}
                onPrevious={goToPreviousStep}
                priceBreakdown={priceBreakdown}
              />
            </StepAccordion>

            {/* Step 4: Struktura */}
            <StepAccordion
              ref={(el) => { stepRefs.current[4] = el; }}
              step={4}
              title="Struktura"
              isOpen={activeStep === 4}
              onToggle={() => goToStep(4)}
              isValid={isStepValid(4)}
              disabled={!isStepValid(3)}
            >
              <StructureStep
                config={config}
                onUpdate={updateConfig}
                onNext={goToNextStep}
                onPrevious={goToPreviousStep}
              />
            </StepAccordion>

            {/* Step 5: Kolory */}
            <StepAccordion
              ref={(el) => { stepRefs.current[5] = el; }}
              step={5}
              title="Kolory materiału i obszycia"
              isOpen={activeStep === 5}
              onToggle={() => goToStep(5)}
              isValid={isStepValid(5)}
              disabled={!isStepValid(4)}
            >
              <CombinedColorPicker
                config={config}
                onUpdate={updateConfig}
                onNext={goToNextStep}
                onPrevious={goToPreviousStep}
              />
            </StepAccordion>

            {/* Step 6: Dodatki */}
            <StepAccordion
              ref={(el) => { stepRefs.current[6] = el; }}
              step={6}
              title="Dodatki"
              isOpen={activeStep === 6}
              onToggle={() => goToStep(6)}
              isValid={isStepValid(6)}
              disabled={!isStepValid(5)}
            >
              <div className="space-y-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.heelPad}
                    onChange={(e) => updateConfig({ heelPad: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-600 bg-neutral-800 text-red-500 focus:ring-red-500"
                  />
                  <span className="text-sm md:text-base">Podkładka pod piętę</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4">
                  <Button
                    onClick={goToPreviousStep}
                    variant="outline"
                    className="px-6 py-2.5 min-h-[40px] border-neutral-700 hover:bg-neutral-800 text-sm font-medium transition-all duration-200"
                  >
                    Wstecz
                  </Button>
                  <Button
                    onClick={goToNextStep}
                    disabled={!isStepValid(6)}
                    className="px-6 py-2.5 min-h-[40px] bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all duration-200 shadow-md shadow-red-600/20 hover:shadow-lg hover:shadow-red-600/30"
                  >
                    Dalej
                  </Button>
                </div>
              </div>
            </StepAccordion>

            {/* Step 7: Podsumowanie */}
            <StepAccordion
              ref={(el) => { stepRefs.current[7] = el; }}
              step={7}
              title="Podsumowanie"
              isOpen={activeStep === 7}
              onToggle={() => goToStep(7)}
              isValid={isStepValid(7)}
              disabled={!isStepValid(6)}
            >
              <SummaryStep
                config={config}
                priceBreakdown={priceBreakdown}
                onPrevious={goToPreviousStep}
                onAddToCart={handleAddToCart}
                isAddingToCart={isAddingToCart || cartLoading}
              />
            </StepAccordion>
          </div>

          {/* Right Column - Visualization & Summary */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-5 md:space-y-6">
              {/* Mobile: Podgląd z przełącznikiem tabs */}
              <div className="lg:hidden relative bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-lg p-4 md:p-5 border border-neutral-800 shadow-md group">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg md:text-xl font-semibold leading-tight">Podgląd</h3>
                  {(activePreviewTab === 'dynamic' && config.structure && config.color && config.edgeColor) || 
                   (activePreviewTab === 'product' && productPreviewPath) ? (
                    <button
                      onClick={() => {
                        setModalImageType(activePreviewTab);
                        setIsPreviewModalOpen(true);
                      }}
                      className="text-xs text-gray-400 hover:text-white transition-colors underline"
                    >
                      Powiększ
                    </button>
                  ) : null}
                </div>

                {/* Przełącznik tabs - tylko mobile */}
                {config.matType && (
                  <div className="flex gap-6 mb-4 border-b border-neutral-700">
                    <button
                      onClick={() => setActivePreviewTab('dynamic')}
                      disabled={!hasFullPreview}
                      className={`pb-2 text-xs font-medium transition-all duration-200 relative ${
                        activePreviewTab === 'dynamic'
                          ? 'text-white'
                          : hasFullPreview
                          ? 'text-gray-400 hover:text-gray-300'
                          : 'text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      Konfiguracja
                      {activePreviewTab === 'dynamic' && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"></span>
                      )}
                    </button>
                    <button
                      onClick={() => setActivePreviewTab('product')}
                      disabled={!productPreviewPath}
                      className={`pb-2 text-xs font-medium transition-all duration-200 relative ${
                        activePreviewTab === 'product'
                          ? 'text-white'
                          : productPreviewPath
                          ? 'text-gray-400 hover:text-gray-300'
                          : 'text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      Produkt
                      {activePreviewTab === 'product' && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"></span>
                      )}
                    </button>
                  </div>
                )}

                {/* Zawartość podglądu - mobile */}
                <div 
                  onClick={() => {
                    if (activePreviewTab === 'dynamic' && config.structure && config.color && config.edgeColor) {
                      setModalImageType('dynamic');
                      setIsPreviewModalOpen(true);
                    } else if (activePreviewTab === 'product' && productPreviewPath) {
                      setModalImageType('product');
                      setIsPreviewModalOpen(true);
                    }
                  }}
                  className="relative aspect-square bg-gradient-to-br from-neutral-950 to-neutral-900 rounded-lg overflow-hidden border border-neutral-700 shadow-xl cursor-pointer hover:border-red-500/50 transition-colors duration-300"
                >
                  {/* Dynamiczny podgląd konfiguracji */}
                  {activePreviewTab === 'dynamic' && (
                    <>
                      {config.structure && config.color && config.edgeColor ? (
                        <>
                          <Image
                            key={`dynamic-mobile-${config.matType}-${config.structure}-${config.color}-${config.edgeColor}`}
                            src={dynamicPreviewPath}
                            alt={`Dywanik ${getColorInfo(config.color).name} z obszyciem ${getColorInfo(config.edgeColor).name}`}
                            fill
                            className="object-contain"
                            sizes="100vw"
                            priority={false}
                            loading="lazy"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                          {/* Tooltip z konfiguracją */}
                          <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                            <div className="bg-black/80 backdrop-blur-sm rounded-lg p-2 text-xs">
                              <div className="flex items-center gap-2 justify-center">
                                <div className="flex items-center gap-1">
                                  <div
                                    className="w-3 h-3 rounded border border-neutral-600"
                                    style={{ backgroundColor: getColorInfo(config.color).color }}
                                  />
                                  <span className="text-gray-300">{getColorInfo(config.color).name}</span>
                                </div>
                                <span className="text-gray-500">•</span>
                                <div className="flex items-center gap-1">
                                  <div
                                    className="w-3 h-3 rounded border border-neutral-600"
                                    style={{ backgroundColor: getColorInfo(config.edgeColor).color }}
                                  />
                                  <span className="text-gray-300">{getColorInfo(config.edgeColor).name}</span>
                                </div>
                                <span className="text-gray-500">•</span>
                                <span className="text-gray-300">
                                  {config.structure === 'diamonds' ? 'Romby' : 'Plaster miodu'}
                                </span>
                              </div>
                            </div>
                          </div>
                          {/* Fallback z kolorami */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-4" style={{ display: 'none' }}>
                            <div className="text-6xl">🚗</div>
                            <div className="space-y-3">
                              <div className="flex items-center justify-center gap-3">
                                <span 
                                  className="inline-block h-6 w-6 rounded-full border shadow-lg" 
                                  style={{ 
                                    backgroundColor: getColorInfo(config.color).color,
                                    borderColor: getColorInfo(config.color).color === '#ffffff' || getColorInfo(config.color).color === '#d9d7c7' || getColorInfo(config.color).color === '#bdbdbd' ? '#333' : 'rgba(255,255,255,0.3)'
                                  }} 
                                />
                                <span className="text-sm font-medium text-white">Kolor: {getColorInfo(config.color).name}</span>
                              </div>
                              <div className="flex items-center justify-center gap-3">
                                <span 
                                  className="inline-block h-6 w-6 rounded-full border shadow-lg" 
                                  style={{ 
                                    backgroundColor: getColorInfo(config.edgeColor).color,
                                    borderColor: getColorInfo(config.edgeColor).color === '#ffffff' || getColorInfo(config.edgeColor).color === '#d9d7c7' || getColorInfo(config.edgeColor).color === '#bdbdbd' ? '#333' : 'rgba(255,255,255,0.3)'
                                  }} 
                                />
                                <span className="text-sm font-medium text-white">Obszycie: {getColorInfo(config.edgeColor).name}</span>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center text-gray-400">
                            <p className="text-sm">Wybierz kolory i strukturę</p>
                            <p className="text-xs mt-2">aby zobaczyć podgląd</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Zdjęcie produktu - mobile */}
                  {activePreviewTab === 'product' && (
                    <>
                      {productPreviewPath ? (
                        <>
                          <Image
                            key={`product-mobile-${config.matType}-${config.matType === 'classic' ? selectedClassicProductImage : selectedRimsProductImage}`}
                            src={productPreviewPath}
                            alt={config.matType === '3d-with-rims' ? 'Dywaniki 3D z rantami' : 'Dywaniki 3D bez rantów'}
                            fill
                            className="object-contain"
                            sizes="100vw"
                            priority={false}
                            loading="lazy"
                          />
                          {/* Przyciski nawigacji - Mobile */}
                          {config.matType === 'classic' && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  goToPreviousClassicImage();
                                }}
                                className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
                                aria-label="Poprzednie zdjęcie"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  goToNextClassicImage();
                                }}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
                                aria-label="Następne zdjęcie"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                            </>
                          )}
                          {config.matType === '3d-with-rims' && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  goToPreviousRimsImage();
                                }}
                                className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
                                aria-label="Poprzednie zdjęcie"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  goToNextRimsImage();
                                }}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
                                aria-label="Następne zdjęcie"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                            </>
                          )}
                        </>
                      ) : getBrandLogo(config.brand) ? (
                        <Image
                          key={`brand-mobile-${config.brand}`}
                          src={getBrandLogo(config.brand)!}
                          alt={config.brand}
                          fill
                          className="object-cover"
                          sizes="100vw"
                          priority={false}
                          loading="lazy"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center text-gray-400">
                            <p className="text-sm">Wybierz typ dywaników</p>
                            <p className="text-xs mt-2">aby zobaczyć zdjęcie produktu</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Opis pod podglądem - mobile */}
                {activePreviewTab === 'dynamic' && config.structure && config.color && config.edgeColor && (
                  <p className="mt-3 text-xs text-gray-400 text-center leading-relaxed">
                    Dynamiczny podgląd z wybranymi kolorami i strukturą
                  </p>
                )}
                {activePreviewTab === 'product' && productPreviewPath && config.matType === '3d-with-rims' && (
                  <p className="mt-3 text-xs text-gray-400 text-center leading-relaxed">
                    Dywaniki 3D z wysokimi rantami
                  </p>
                )}
                {activePreviewTab === 'product' && !productPreviewPath && getBrandLogo(config.brand) && (
                  <p className="mt-3 text-xs text-gray-400 text-center leading-relaxed">
                    {config.brand}
                  </p>
                )}
                
                {/* Galeria miniatur dla typu "classic" (bez rantów) - Mobile */}
                {activePreviewTab === 'product' && config.matType === 'classic' && productPreviewPath && (
                  <div className="mt-4">
                    <div className="flex gap-1.5 justify-center">
                      {classicProductImages.map((imagePath) => (
                        <button
                          key={imagePath}
                          onClick={() => setSelectedClassicProductImage(imagePath)}
                          className={`
                            relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 flex-shrink-0
                            ${selectedClassicProductImage === imagePath
                              ? 'border-red-500 ring-2 ring-red-500/30 scale-105'
                              : 'border-neutral-700 hover:border-neutral-600 opacity-70 hover:opacity-100'
                            }
                          `}
                        >
                          <Image
                            src={imagePath}
                            alt={`Zdjęcie produktu ${imagePath.split('/').pop()}`}
                            fill
                            className="object-cover"
                            sizes="48px"
                            loading="lazy"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Galeria miniatur dla typu "3d-with-rims" (z rantami) - Mobile */}
                {activePreviewTab === 'product' && config.matType === '3d-with-rims' && productPreviewPath && (
                  <div className="mt-4">
                    <div className="flex gap-1.5 justify-center">
                      {rimsProductImages.map((imagePath) => (
                        <button
                          key={imagePath}
                          onClick={() => setSelectedRimsProductImage(imagePath)}
                          className={`
                            relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 flex-shrink-0
                            ${selectedRimsProductImage === imagePath
                              ? 'border-red-500 ring-2 ring-red-500/30 scale-105'
                              : 'border-neutral-700 hover:border-neutral-600 opacity-70 hover:opacity-100'
                            }
                          `}
                        >
                          <Image
                            src={imagePath}
                            alt={`Zdjęcie produktu ${imagePath.split('/').pop()}`}
                            fill
                            className="object-cover"
                            sizes="48px"
                            loading="lazy"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop: Dwa osobne okna - jedno pod drugim */}
              <div className="hidden lg:block space-y-5">
                {/* Zdjęcie produktu - Desktop (na górze) */}
                <div className="relative bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-lg p-4 md:p-5 border border-neutral-800 shadow-md">
                  <div className="flex items-center justify-center mb-4 relative">
                    <h3 className="text-lg md:text-xl font-semibold leading-tight">Zdjęcie produktu</h3>
                    {productPreviewPath && (
                      <button
                        onClick={() => {
                          setModalImageType('product');
                          setIsPreviewModalOpen(true);
                        }}
                        className="absolute right-0 text-xs text-gray-400 hover:text-white transition-colors underline"
                      >
                        Powiększ
                      </button>
                    )}
                  </div>
                  <div 
                    onClick={() => {
                      if (productPreviewPath) {
                        setModalImageType('product');
                        setIsPreviewModalOpen(true);
                      }
                    }}
                    className="relative aspect-square bg-gradient-to-br from-neutral-950 to-neutral-900 rounded-lg overflow-hidden border border-neutral-700 shadow-xl cursor-pointer hover:border-red-500/50 transition-colors duration-300"
                  >
                    {productPreviewPath ? (
                      <>
                        <Image
                          key={`product-desktop-${config.matType}-${config.matType === 'classic' ? selectedClassicProductImage : selectedRimsProductImage}`}
                          src={productPreviewPath}
                          alt={config.matType === '3d-with-rims' ? 'Dywaniki 3D z rantami' : 'Dywaniki 3D bez rantów'}
                          fill
                          className="object-contain"
                          sizes="50vw"
                          priority={false}
                          loading="lazy"
                        />
                        {/* Przyciski nawigacji */}
                        {config.matType === 'classic' && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                goToPreviousClassicImage();
                              }}
                              className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
                              aria-label="Poprzednie zdjęcie"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                goToNextClassicImage();
                              }}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
                              aria-label="Następne zdjęcie"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </>
                        )}
                        {config.matType === '3d-with-rims' && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                goToPreviousRimsImage();
                              }}
                              className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
                              aria-label="Poprzednie zdjęcie"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                goToNextRimsImage();
                              }}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
                              aria-label="Następne zdjęcie"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </>
                        )}
                      </>
                    ) : getBrandLogo(config.brand) ? (
                      <Image
                        key={`brand-desktop-${config.brand}`}
                        src={getBrandLogo(config.brand)!}
                        alt={config.brand}
                        fill
                        className="object-cover"
                        sizes="50vw"
                        priority={false}
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-gray-400">
                          <p className="text-sm">Wybierz typ dywaników</p>
                          <p className="text-xs mt-2">aby zobaczyć zdjęcie produktu</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {productPreviewPath && config.matType === '3d-with-rims' && (
                    <p className="mt-3 text-xs text-gray-400 text-center leading-relaxed">
                      Dywaniki 3D z wysokimi rantami
                    </p>
                  )}
                  {!productPreviewPath && getBrandLogo(config.brand) && (
                    <p className="mt-3 text-xs text-gray-400 text-center leading-relaxed">
                      {config.brand}
                    </p>
                  )}
                  
                  {/* Galeria miniatur dla typu "classic" (bez rantów) */}
                  {config.matType === 'classic' && productPreviewPath && (
                    <div className="mt-4">
                      <div className="flex gap-1.5 justify-center">
                        {classicProductImages.map((imagePath) => (
                          <button
                            key={imagePath}
                            onClick={() => setSelectedClassicProductImage(imagePath)}
                            className={`
                              relative w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden border-2 transition-all duration-200 flex-shrink-0
                              ${selectedClassicProductImage === imagePath
                                ? 'border-red-500 ring-2 ring-red-500/30 scale-105'
                                : 'border-neutral-700 hover:border-neutral-600 opacity-70 hover:opacity-100'
                              }
                            `}
                          >
                            <Image
                              src={imagePath}
                              alt={`Zdjęcie produktu ${imagePath.split('/').pop()}`}
                              fill
                              className="object-cover"
                              sizes="56px"
                              loading="lazy"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Galeria miniatur dla typu "3d-with-rims" (z rantami) */}
                  {config.matType === '3d-with-rims' && productPreviewPath && (
                    <div className="mt-4">
                      <div className="flex gap-1.5 justify-center">
                        {rimsProductImages.map((imagePath) => (
                          <button
                            key={imagePath}
                            onClick={() => setSelectedRimsProductImage(imagePath)}
                            className={`
                              relative w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden border-2 transition-all duration-200 flex-shrink-0
                              ${selectedRimsProductImage === imagePath
                                ? 'border-red-500 ring-2 ring-red-500/30 scale-105'
                                : 'border-neutral-700 hover:border-neutral-600 opacity-70 hover:opacity-100'
                              }
                            `}
                          >
                            <Image
                              src={imagePath}
                              alt={`Zdjęcie produktu ${imagePath.split('/').pop()}`}
                              fill
                              className="object-cover"
                              sizes="56px"
                              loading="lazy"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Dynamiczny podgląd konfiguracji - Desktop (na dole) */}
                <div className="relative bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-lg p-4 md:p-5 border border-neutral-800 shadow-md group">
                  <div className="flex items-center justify-center mb-4 relative">
                    <h3 className="text-lg md:text-xl font-semibold leading-tight">Podgląd konfiguracji</h3>
                    {config.structure && config.color && config.edgeColor && (
                      <button
                        onClick={() => {
                          setModalImageType('dynamic');
                          setIsPreviewModalOpen(true);
                        }}
                        className="absolute right-0 text-xs text-gray-400 hover:text-white transition-colors underline"
                      >
                        Powiększ
                      </button>
                    )}
                  </div>
                  <div 
                    onClick={() => {
                      if (config.structure && config.color && config.edgeColor) {
                        setModalImageType('dynamic');
                        setIsPreviewModalOpen(true);
                      }
                    }}
                    className="relative aspect-square bg-gradient-to-br from-neutral-950 to-neutral-900 rounded-lg overflow-hidden border border-neutral-700 shadow-xl cursor-pointer hover:border-red-500/50 transition-colors duration-300"
                  >
                    {config.structure && config.color && config.edgeColor ? (
                      <>
                        <Image
                          key={`dynamic-desktop-${config.matType}-${config.structure}-${config.color}-${config.edgeColor}`}
                          src={dynamicPreviewPath}
                          alt={`Dywanik ${getColorInfo(config.color).name} z obszyciem ${getColorInfo(config.edgeColor).name}`}
                          fill
                          className="object-contain"
                          sizes="50vw"
                          priority={false}
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                        {/* Tooltip z konfiguracją */}
                        <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                          <div className="bg-black/80 backdrop-blur-sm rounded-lg p-2 text-xs">
                            <div className="flex items-center gap-2 justify-center">
                              <div className="flex items-center gap-1">
                                <div
                                  className="w-3 h-3 rounded border border-neutral-600"
                                  style={{ backgroundColor: getColorInfo(config.color).color }}
                                />
                                <span className="text-gray-300">{getColorInfo(config.color).name}</span>
                              </div>
                              <span className="text-gray-500">•</span>
                              <div className="flex items-center gap-1">
                                <div
                                  className="w-3 h-3 rounded border border-neutral-600"
                                  style={{ backgroundColor: getColorInfo(config.edgeColor).color }}
                                />
                                <span className="text-gray-300">{getColorInfo(config.edgeColor).name}</span>
                              </div>
                              <span className="text-gray-500">•</span>
                              <span className="text-gray-300">
                                {config.structure === 'diamonds' ? 'Romby' : 'Plaster miodu'}
                              </span>
                            </div>
                          </div>
                        </div>
                        {/* Fallback z kolorami */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-4" style={{ display: 'none' }}>
                          <div className="text-6xl">🚗</div>
                          <div className="space-y-3">
                            <div className="flex items-center justify-center gap-3">
                              <span 
                                className="inline-block h-6 w-6 rounded-full border shadow-lg" 
                                style={{ 
                                  backgroundColor: getColorInfo(config.color).color,
                                  borderColor: getColorInfo(config.color).color === '#ffffff' || getColorInfo(config.color).color === '#d9d7c7' || getColorInfo(config.color).color === '#bdbdbd' ? '#333' : 'rgba(255,255,255,0.3)'
                                }} 
                              />
                              <span className="text-sm font-medium text-white">Kolor: {getColorInfo(config.color).name}</span>
                            </div>
                            <div className="flex items-center justify-center gap-3">
                              <span 
                                className="inline-block h-6 w-6 rounded-full border shadow-lg" 
                                style={{ 
                                  backgroundColor: getColorInfo(config.edgeColor).color,
                                  borderColor: getColorInfo(config.edgeColor).color === '#ffffff' || getColorInfo(config.edgeColor).color === '#d9d7c7' || getColorInfo(config.edgeColor).color === '#bdbdbd' ? '#333' : 'rgba(255,255,255,0.3)'
                                }} 
                              />
                              <span className="text-sm font-medium text-white">Obszycie: {getColorInfo(config.edgeColor).name}</span>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-gray-400">
                          <p className="text-sm">Wybierz kolory i strukturę</p>
                          <p className="text-xs mt-2">aby zobaczyć podgląd</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {config.structure && config.color && config.edgeColor && (
                    <p className="mt-3 text-xs text-gray-400 text-center leading-relaxed">
                      Dynamiczny podgląd z wybranymi kolorami i strukturą
                    </p>
                  )}
                </div>
              </div>

              {/* Modal z powiększonym podglądem */}
              {isPreviewModalOpen && modalImageType && (
                <div 
                  className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300"
                  onClick={() => {
                    setIsPreviewModalOpen(false);
                    setModalImageType(null);
                  }}
                >
                  {/* Tło */}
                  <div className="absolute inset-0 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300"></div>
                  
                  {/* Modal */}
                  <div 
                    className="relative z-[101] max-w-4xl w-full bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-lg border border-neutral-800 shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-300"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl md:text-2xl font-bold">
                        {modalImageType === 'dynamic' ? 'Podgląd konfiguracji' : 'Zdjęcie produktu'}
                      </h3>
                      <button
                        onClick={() => {
                          setIsPreviewModalOpen(false);
                          setModalImageType(null);
                        }}
                        className="text-gray-400 hover:text-white transition-colors text-2xl leading-none"
                        aria-label="Zamknij"
                      >
                        ×
                      </button>
                    </div>
                    
                    {/* Powiększony obraz */}
                    <div className="relative aspect-square bg-gradient-to-br from-neutral-950 to-neutral-900 rounded-lg overflow-hidden border border-neutral-700">
                      <Image
                        key={`modal-${modalImageType}-${modalImageType === 'dynamic' ? `${config.matType}-${config.structure}-${config.color}-${config.edgeColor}` : `${config.matType}-${config.matType === 'classic' ? selectedClassicProductImage : selectedRimsProductImage}`}`}
                        src={modalImageType === 'dynamic' ? dynamicPreviewPath : (productPreviewPath || '')}
                        alt={modalImageType === 'dynamic' 
                          ? `Dywanik ${getColorInfo(config.color || 'black').name} z obszyciem ${getColorInfo(config.edgeColor || 'black').name}`
                          : (config.matType === '3d-with-rims' ? 'Dywaniki 3D z rantami' : 'Dywaniki 3D bez rantów')
                        }
                        fill
                        className="object-contain"
                        sizes="(max-width: 1024px) 100vw, 80vw"
                        priority={true}
                      />
                    </div>
                    
                    {/* Galeria miniatur w modalu dla typu "classic" */}
                    {modalImageType === 'product' && config.matType === 'classic' && (
                      <div className="mt-4">
                        <div className="flex gap-2 justify-center overflow-x-auto pb-2">
                          {classicProductImages.map((imagePath) => (
                            <button
                              key={imagePath}
                              onClick={() => setSelectedClassicProductImage(imagePath)}
                              className={`
                                relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 flex-shrink-0
                                ${selectedClassicProductImage === imagePath
                                  ? 'border-red-500 ring-2 ring-red-500/30 scale-105'
                                  : 'border-neutral-700 hover:border-neutral-600 opacity-70 hover:opacity-100'
                                }
                              `}
                            >
                              <Image
                                src={imagePath}
                                alt={`Zdjęcie produktu ${imagePath.split('/').pop()}`}
                                fill
                                className="object-cover"
                                sizes="80px"
                                loading="lazy"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Galeria miniatur w modalu dla typu "3d-with-rims" */}
                    {modalImageType === 'product' && config.matType === '3d-with-rims' && (
                      <div className="mt-4">
                        <div className="flex gap-2 justify-center overflow-x-auto pb-2">
                          {rimsProductImages.map((imagePath) => (
                            <button
                              key={imagePath}
                              onClick={() => setSelectedRimsProductImage(imagePath)}
                              className={`
                                relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 flex-shrink-0
                                ${selectedRimsProductImage === imagePath
                                  ? 'border-red-500 ring-2 ring-red-500/30 scale-105'
                                  : 'border-neutral-700 hover:border-neutral-600 opacity-70 hover:opacity-100'
                                }
                              `}
                            >
                              <Image
                                src={imagePath}
                                alt={`Zdjęcie produktu ${imagePath.split('/').pop()}`}
                                fill
                                className="object-cover"
                                sizes="80px"
                                loading="lazy"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Informacje - tylko dla dynamicznego podglądu */}
                    {modalImageType === 'dynamic' && config.structure && config.color && config.edgeColor && (
                      <div className="mt-4 p-4 bg-neutral-800 rounded-lg border border-neutral-700">
                        <div className="flex items-center gap-4 justify-center">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded border border-neutral-600"
                              style={{ backgroundColor: getColorInfo(config.color).color }}
                            />
                            <span className="text-sm text-gray-300">
                              <span className="text-gray-400">Kolor:</span> {getColorInfo(config.color).name}
                            </span>
                          </div>
                          <div className="w-px h-6 bg-neutral-700"></div>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded border border-neutral-600"
                              style={{ backgroundColor: getColorInfo(config.edgeColor).color }}
                            />
                            <span className="text-sm text-gray-300">
                              <span className="text-gray-400">Obszycie:</span> {getColorInfo(config.edgeColor).name}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <p className="mt-4 text-xs text-gray-400 text-center">
                      Wizualizacja poglądowa. Docelowy kształt dopasujemy do Twojego auta.
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Sticky Preview Bar - Mobile Only */}
      {shouldShowStickyPreview && (
        <>
          {/* Galeria miniatur zdjęć produktu - Mobile Only */}
          {config.matType && (
            <div 
              className="lg:hidden fixed bottom-[88px] left-0 right-0 z-30 bg-black/90 backdrop-blur-sm border-t border-neutral-800 shadow-lg overflow-x-auto"
              style={{ paddingBottom: '8px' }}
            >
              <div className="px-4 py-2">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {(config.matType === 'classic' ? classicProductImages : rimsProductImages).map((imagePath) => {
                    const isSelected = config.matType === 'classic' 
                      ? selectedClassicProductImage === imagePath 
                      : selectedRimsProductImage === imagePath;
                    
                    return (
                      <button
                        key={imagePath}
                        onClick={() => {
                          if (config.matType === 'classic') {
                            setSelectedClassicProductImage(imagePath);
                          } else {
                            setSelectedRimsProductImage(imagePath);
                          }
                          // Otwórz modal z powiększonym zdjęciem
                          setModalImageType('product');
                          setIsPreviewModalOpen(true);
                        }}
                        className={`
                          relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 flex-shrink-0
                          ${isSelected
                            ? 'border-red-500 ring-2 ring-red-500/30 scale-105'
                            : 'border-neutral-700 hover:border-neutral-600 opacity-80 hover:opacity-100'
                          }
                        `}
                      >
                        <Image
                          src={imagePath}
                          alt={`Zdjęcie produktu ${imagePath.split('/').pop()}`}
                          fill
                          className="object-cover"
                          sizes="80px"
                          loading="lazy"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          
          <div 
            className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-sm border-t border-neutral-800 shadow-lg"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="px-4 py-3">
              <div className="flex items-center gap-3">
              {/* Mały obrazek podglądu - pokazuj dynamiczny podgląd jeśli dostępny, w przeciwnym razie zdjęcie produktu lub logo marki */}
              {config.matType ? (
                <div 
                  onClick={() => {
                    if (hasFullPreview) {
                      setModalImageType('dynamic');
                    } else if (productPreviewPath) {
                      setModalImageType('product');
                    }
                    setIsPreviewModalOpen(true);
                  }}
                  className="relative w-16 h-16 flex-shrink-0 bg-gradient-to-br from-neutral-950 to-neutral-900 rounded-lg overflow-hidden border border-neutral-700 cursor-pointer"
                >
                  <Image
                    key={`sticky-${hasFullPreview ? 'dynamic' : 'product'}-${hasFullPreview ? `${config.matType}-${config.structure}-${config.color}-${config.edgeColor}` : config.matType}`}
                    src={hasFullPreview ? dynamicPreviewPath : (productPreviewPath || '')}
                    alt={hasFullPreview 
                      ? `Dywanik ${getColorInfo(config.color || 'black').name}`
                      : (config.matType === '3d-with-rims' ? 'Dywaniki 3D z rantami' : 'Dywaniki 3D bez rantów')
                    }
                    fill
                    className="object-contain"
                    sizes="64px"
                    priority={false}
                    loading="lazy"
                  />
                </div>
              ) : getBrandLogo(config.brand) ? (
                <div className="relative w-16 h-16 flex-shrink-0 bg-gradient-to-br from-neutral-950 to-neutral-900 rounded-lg overflow-hidden border border-neutral-700">
                  <Image
                    key={`sticky-brand-${config.brand}`}
                    src={getBrandLogo(config.brand)!}
                    alt={config.brand}
                    fill
                    className="object-contain p-2"
                    sizes="64px"
                    priority={false}
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="relative w-16 h-16 flex-shrink-0 bg-gradient-to-br from-neutral-950 to-neutral-900 rounded-lg overflow-hidden border border-neutral-700 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <p className="text-[10px] leading-tight">Wybierz opcje</p>
                  </div>
                </div>
              )}

              {/* Informacje o konfiguracji */}
              <div className="flex-1 min-w-0">
                {hasFullPreview ? (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-4 h-4 rounded border border-neutral-600 flex-shrink-0"
                        style={{ backgroundColor: getColorInfo(config.color).color }}
                      />
                      <span className="text-xs text-gray-300 truncate">
                        {getColorInfo(config.color).name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded border border-neutral-600 flex-shrink-0"
                        style={{ backgroundColor: getColorInfo(config.edgeColor).color }}
                      />
                      <span className="text-xs text-gray-400 truncate">
                        {getColorInfo(config.edgeColor).name}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400">
                      {config.matType ? (config.matType === '3d-with-rims' ? '3D z rantami' : 'Klasyczne') : 'Wybierz typ'}
                    </p>
                    {config.variant && (
                      <p className="text-xs text-gray-500">
                        {config.variant === 'front' ? 'Przód' : config.variant === 'basic' ? 'Podstawowy' : config.variant === 'premium' ? 'Premium' : 'Kompletny'}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Przycisk powiększ - tylko gdy wybrano typ dywaników */}
              {config.matType ? (
                <button
                  onClick={() => {
                    if (hasFullPreview) {
                      setModalImageType('dynamic');
                    } else if (productPreviewPath) {
                      setModalImageType('product');
                    }
                    setIsPreviewModalOpen(true);
                  }}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-xs font-medium transition-colors duration-200 flex-shrink-0 min-h-[44px] flex items-center justify-center"
                >
                  Powiększ podgląd
                </button>
              ) : (
                <div className="px-3 py-2 bg-neutral-800 rounded-lg text-xs font-medium flex-shrink-0 min-h-[44px] flex items-center justify-center text-gray-500">
                  ...
                </div>
              )}
            </div>
          </div>
        </div>
        </>
      )}
    </div>
  );
}

