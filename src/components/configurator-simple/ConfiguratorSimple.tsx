"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart.new";
import { PricingService } from "@/lib/services/PricingService";
import { getMatImagePath } from "@/lib/image-mapping";
import { getColorInfo } from "@/lib/color-mapping";
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

export default function ConfiguratorSimple() {
  const searchParams = useSearchParams();
  const { addToCart, isLoading: cartLoading } = useCart();
  
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
  
  // Stan dodawania do koszyka
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Stan modala z podglądem
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Oblicz cenę na podstawie konfiguracji
  const priceBreakdown = useMemo(() => {
    return PricingService.calculateConfiguratorPrice(config.matType, config.variant);
  }, [config.matType, config.variant]);

  // Generuj ścieżkę do obrazu dywanika na podstawie konfiguracji
  const matImagePath = useMemo(() => {
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

  // Zapisz konfigurację do localStorage
  useEffect(() => {
    localStorage.setItem('configurator-simple-state', JSON.stringify(config));
  }, [config]);

  // Załaduj konfigurację z localStorage przy starcie
  useEffect(() => {
    const saved = localStorage.getItem('configurator-simple-state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Error loading saved config:', e);
      }
    }
  }, []);

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

  // Dodaj do koszyka
  const handleAddToCart = async () => {
    if (!isStepValid(7)) {
      return;
    }

    setIsAddingToCart(true);
    try {
      await addToCart({
        productType: 'mat',
        productId: `mat-${config.brand}-${config.model}`,
        quantity: 1,
        unitPrice: priceBreakdown.totalPrice,
        productName: `Dywaniki ${config.brand} ${config.model}`,
        productSku: `MAT-${config.brand.toUpperCase()}-${config.model.toUpperCase()}`,
        productImage: '',
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
          color: config.color,
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
  
  // Sprawdź czy mamy wszystkie dane do wyświetlenia pełnego podglądu
  const hasFullPreview = config.structure && config.color && config.edgeColor;

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
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-20 pb-6 md:pb-8 ${shouldShowStickyPreview ? 'lg:pb-6 md:pb-8 pb-[100px]' : ''}`}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8">
          {/* Left Column - Configuration */}
          <div className="lg:col-span-3 space-y-4 md:space-y-5">
            {/* Step 1: Wybór samochodu */}
            <StepAccordion
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
              {/* Product Visualization */}
              <div className="relative bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-lg p-4 md:p-5 border border-neutral-800 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg md:text-xl font-semibold leading-tight">Podgląd</h3>
                  {config.structure && config.color && config.edgeColor && (
                    <button
                      onClick={() => setIsPreviewModalOpen(true)}
                      className="text-xs text-gray-400 hover:text-white transition-colors underline"
                    >
                      Powiększ podgląd
                    </button>
                  )}
                </div>
                <div 
                  onClick={() => config.structure && config.color && config.edgeColor && setIsPreviewModalOpen(true)}
                  className="relative aspect-square bg-gradient-to-br from-neutral-950 to-neutral-900 rounded-lg overflow-hidden border-2 border-neutral-700 shadow-xl cursor-pointer hover:border-red-500/50 transition-colors duration-300"
                >
                  {config.structure && config.color && config.edgeColor ? (
                    <>
                      <Image
                        key={`${config.matType}-${config.structure}-${config.color}-${config.edgeColor}`}
                        src={matImagePath}
                        alt={`Dywanik ${getColorInfo(config.color).name} z obszyciem ${getColorInfo(config.edgeColor).name}`}
                        fill
                        className="object-contain transition-opacity duration-500"
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        priority={false}
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      {/* Fallback z kolorami */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-4" style={{ display: 'none' }}>
                        <div className="text-6xl">🚗</div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-center gap-3">
                            <span 
                              className="inline-block h-6 w-6 rounded-full border-2 shadow-lg" 
                              style={{ 
                                backgroundColor: getColorInfo(config.color).color,
                                borderColor: getColorInfo(config.color).color === '#ffffff' || getColorInfo(config.color).color === '#d9d7c7' || getColorInfo(config.color).color === '#bdbdbd' ? '#333' : 'rgba(255,255,255,0.3)'
                              }} 
                            />
                            <span className="text-sm font-medium text-white">Kolor: {getColorInfo(config.color).name}</span>
                          </div>
                          <div className="flex items-center justify-center gap-3">
                            <span 
                              className="inline-block h-6 w-6 rounded-full border-2 shadow-lg" 
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
                        <p className="text-sm">Wybierz opcje, aby zobaczyć podgląd</p>
                        {config.brand && config.model && (
                          <p className="text-xs mt-2">
                            {config.brand} {config.model}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {config.structure && config.color && config.edgeColor && (
                  <p className="mt-3 text-xs text-gray-400 text-center leading-relaxed">
                    Wizualizacja poglądowa. Docelowy kształt dopasujemy do Twojego auta.
                  </p>
                )}
              </div>

              {/* Modal z powiększonym podglądem */}
              {isPreviewModalOpen && config.structure && config.color && config.edgeColor && (
                <div 
                  className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                  onClick={() => setIsPreviewModalOpen(false)}
                >
                  {/* Tło */}
                  <div className="absolute inset-0 bg-black/90 backdrop-blur-sm"></div>
                  
                  {/* Modal */}
                  <div 
                    className="relative z-[101] max-w-4xl w-full bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-lg border border-neutral-800 shadow-2xl p-6 md:p-8"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl md:text-2xl font-bold">Podgląd dywaników</h3>
                      <button
                        onClick={() => setIsPreviewModalOpen(false)}
                        className="text-gray-400 hover:text-white transition-colors text-2xl leading-none"
                        aria-label="Zamknij"
                      >
                        ×
                      </button>
                    </div>
                    
                    {/* Powiększony obraz */}
                    <div className="relative aspect-square bg-gradient-to-br from-neutral-950 to-neutral-900 rounded-lg overflow-hidden border-2 border-neutral-700">
                      <Image
                        key={`modal-${config.matType}-${config.structure}-${config.color}-${config.edgeColor}`}
                        src={matImagePath}
                        alt={`Dywanik ${getColorInfo(config.color).name} z obszyciem ${getColorInfo(config.edgeColor).name}`}
                        fill
                        className="object-contain"
                        sizes="(max-width: 1024px) 100vw, 80vw"
                        priority={true}
                      />
                    </div>
                    
                    {/* Informacje */}
                    <div className="mt-4 p-4 bg-neutral-800 rounded-lg border border-neutral-700">
                      <div className="flex items-center gap-4 justify-center">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded border-2 border-neutral-600"
                            style={{ backgroundColor: getColorInfo(config.color).color }}
                          />
                          <span className="text-sm text-gray-300">
                            <span className="text-gray-400">Kolor:</span> {getColorInfo(config.color).name}
                          </span>
                        </div>
                        <div className="w-px h-6 bg-neutral-700"></div>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded border-2 border-neutral-600"
                            style={{ backgroundColor: getColorInfo(config.edgeColor).color }}
                          />
                          <span className="text-sm text-gray-300">
                            <span className="text-gray-400">Obszycie:</span> {getColorInfo(config.edgeColor).name}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="mt-4 text-xs text-gray-400 text-center">
                      Wizualizacja poglądowa. Docelowy kształt dopasujemy do Twojego auta.
                    </p>
                  </div>
                </div>
              )}

              {/* Price Summary */}
              <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-lg p-4 md:p-5 border border-neutral-800 shadow-md">
                <h3 className="text-lg md:text-xl font-semibold mb-4 leading-tight">Podsumowanie ceny</h3>
                <div className="space-y-2.5">
                  <div className="flex justify-between text-gray-300 text-sm">
                    <span>Cena bazowa:</span>
                    <span className="font-semibold">{priceBreakdown.basePrice.toFixed(2)} zł</span>
                  </div>
                  {priceBreakdown.discount > 0 && (
                    <div className="flex justify-between text-green-400 text-sm">
                      <span>Rabat:</span>
                      <span className="font-bold">-{priceBreakdown.discount.toFixed(2)} zł</span>
                    </div>
                  )}
                  {priceBreakdown.shippingCost > 0 && (
                    <div className="flex justify-between text-gray-300 text-sm">
                      <span>Dostawa:</span>
                      <span className="font-semibold">{priceBreakdown.shippingCost.toFixed(2)} zł</span>
                    </div>
                  )}
                  <div className="border-t border-neutral-700 pt-3 mt-3">
                    <div className="flex justify-between text-xl md:text-2xl font-bold">
                      <span>Razem:</span>
                      <span className="text-red-500">{priceBreakdown.totalPrice.toFixed(2)} zł</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Preview Bar - Mobile Only */}
      {shouldShowStickyPreview && (
        <div 
          className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-sm border-t border-neutral-800 shadow-lg"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              {/* Mały obrazek podglądu */}
              {hasFullPreview ? (
                <div 
                  onClick={() => setIsPreviewModalOpen(true)}
                  className="relative w-16 h-16 flex-shrink-0 bg-gradient-to-br from-neutral-950 to-neutral-900 rounded-lg overflow-hidden border-2 border-neutral-700 cursor-pointer"
                >
                  <Image
                    key={`sticky-${config.matType}-${config.structure}-${config.color}-${config.edgeColor}`}
                    src={matImagePath}
                    alt={`Podgląd dywanika`}
                    fill
                    className="object-contain"
                    sizes="64px"
                    priority={false}
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="relative w-16 h-16 flex-shrink-0 bg-gradient-to-br from-neutral-950 to-neutral-900 rounded-lg overflow-hidden border-2 border-neutral-700 flex items-center justify-center">
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

              {/* Przycisk powiększ - tylko gdy mamy pełny podgląd */}
              {hasFullPreview ? (
                <button
                  onClick={() => setIsPreviewModalOpen(true)}
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
      )}
    </div>
  );
}

