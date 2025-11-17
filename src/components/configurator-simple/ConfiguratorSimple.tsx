"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/hooks/useCart.new";
import { PricingService } from "@/lib/services/PricingService";
import { StepProgress } from "./StepProgress";
import { StepAccordion } from "./StepAccordion";
import { CarSelectionStep } from "./CarSelectionStep";
import { MatTypeStep } from "./MatTypeStep";
import { VariantStep } from "./VariantStep";
import { StructureStep } from "./StructureStep";
import { ColorPicker } from "./ColorPicker";
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

const TOTAL_STEPS = 8;

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

  // Oblicz cenę na podstawie konfiguracji
  const priceBreakdown = useMemo(() => {
    return PricingService.calculateConfiguratorPrice(config.matType, config.variant);
  }, [config.matType, config.variant]);

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
        return !!config.color;
      case 6:
        return !!config.edgeColor;
      case 7:
        return true; // Heel pad jest opcjonalny
      case 8:
        return isStepValid(1) && isStepValid(2) && isStepValid(3) && isStepValid(4) && isStepValid(5) && isStepValid(6);
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

  // Dodaj do koszyka
  const handleAddToCart = async () => {
    if (!isStepValid(8)) {
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Configuration */}
          <div className="lg:col-span-2 space-y-4">
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

            {/* Step 5: Kolor dywaników */}
            <StepAccordion
              step={5}
              title="Kolor dywaników"
              isOpen={activeStep === 5}
              onToggle={() => goToStep(5)}
              isValid={isStepValid(5)}
              disabled={!isStepValid(4)}
            >
              <ColorPicker
                type="mat"
                config={config}
                onUpdate={updateConfig}
                onNext={goToNextStep}
                onPrevious={goToPreviousStep}
              />
            </StepAccordion>

            {/* Step 6: Kolor obszycia */}
            <StepAccordion
              step={6}
              title="Kolor obszycia"
              isOpen={activeStep === 6}
              onToggle={() => goToStep(6)}
              isValid={isStepValid(6)}
              disabled={!isStepValid(5)}
            >
              <ColorPicker
                type="edge"
                config={config}
                onUpdate={updateConfig}
                onNext={goToNextStep}
                onPrevious={goToPreviousStep}
              />
            </StepAccordion>

            {/* Step 7: Dodatki */}
            <StepAccordion
              step={7}
              title="Dodatki"
              isOpen={activeStep === 7}
              onToggle={() => goToStep(7)}
              isValid={isStepValid(7)}
              disabled={!isStepValid(6)}
            >
              <div className="space-y-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.heelPad}
                    onChange={(e) => updateConfig({ heelPad: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-600 bg-neutral-800 text-red-500 focus:ring-red-500"
                  />
                  <span className="text-lg">Podkładka pod piętę</span>
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={goToPreviousStep}
                    className="px-6 py-3 border border-neutral-700 rounded-lg hover:bg-neutral-800 transition-colors"
                  >
                    Wstecz
                  </button>
                  <button
                    onClick={goToNextStep}
                    disabled={!isStepValid(7)}
                    className="px-6 py-3 bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Dalej
                  </button>
                </div>
              </div>
            </StepAccordion>

            {/* Step 8: Podsumowanie */}
            <StepAccordion
              step={8}
              title="Podsumowanie"
              isOpen={activeStep === 8}
              onToggle={() => goToStep(8)}
              isValid={isStepValid(8)}
              disabled={!isStepValid(7)}
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
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Product Visualization */}
              <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-800">
                <h3 className="text-xl font-bold mb-4">Podgląd</h3>
                <div className="aspect-square bg-neutral-800 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <p className="text-sm">Wizualizacja produktu</p>
                    <p className="text-xs mt-2">
                      {config.brand} {config.model}
                    </p>
                  </div>
                </div>
              </div>

              {/* Price Summary */}
              <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-800">
                <h3 className="text-xl font-bold mb-4">Podsumowanie ceny</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-400">
                    <span>Cena bazowa:</span>
                    <span>{priceBreakdown.basePrice.toFixed(2)} zł</span>
                  </div>
                  {priceBreakdown.discount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Rabat:</span>
                      <span>-{priceBreakdown.discount.toFixed(2)} zł</span>
                    </div>
                  )}
                  {priceBreakdown.shippingCost > 0 && (
                    <div className="flex justify-between text-gray-400">
                      <span>Dostawa:</span>
                      <span>{priceBreakdown.shippingCost.toFixed(2)} zł</span>
                    </div>
                  )}
                  <div className="border-t border-neutral-700 pt-2 mt-2">
                    <div className="flex justify-between text-xl font-bold">
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
    </div>
  );
}

