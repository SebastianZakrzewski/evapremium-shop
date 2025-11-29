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
import { useAccessories } from "@/hooks/useAccessories";
import { StepProgress } from "./StepProgress";
import { StepAccordion } from "./StepAccordion";
import { CarSelectionStep } from "./CarSelectionStep";
import { MatTypeStep } from "./MatTypeStep";
import { VariantStep } from "./VariantStep";
import { StructureStep } from "./StructureStep";
import { CombinedColorPicker } from "./CombinedColorPicker";
import { SummaryStep } from "./SummaryStep";
import { AccessoriesStep } from "./AccessoriesStep";
import { ConfiguratorLoader } from "./ConfiguratorLoader";
import { ZoomIn, ArrowLeft, ArrowRight, Info, RotateCcw, ShoppingCart } from "lucide-react";

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
  selectedPodpietka?: string; // ID wybranej podpiętki
  podpietkaColor?: string; // Wybrany kolor podpiętki
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
  const { accessories } = useAccessories();
  
  // Pobierz marki
  const { data: brands = [], isLoading: brandsLoading } = useQuery<Brand[]>({
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
    selectedPodpietka: undefined,
    podpietkaColor: undefined,
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
  const productPreviewPath = useMemo(() => {
    if (activeStep < 2) return null;
    if (config.matType === '3d-with-rims') return selectedRimsProductImage;
    if (config.matType === 'classic') return selectedClassicProductImage;
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
          const updates: Partial<ConfiguratorState> = { ...parsed };
          if (brandParam) delete updates.brand;
          if (modelParam) updates.model = modelParam;
          if (bodyTypeParam) updates.bodyType = bodyTypeParam;
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
      case 1: return !!(config.brand && config.model && config.year && config.bodyType);
      case 2: return !!config.matType;
      case 3: return !!config.variant;
      case 4: return !!config.structure;
      case 5: return !!(config.color && config.edgeColor);
      case 6: return true;
      case 7: return isStepValid(1) && isStepValid(2) && isStepValid(3) && isStepValid(4) && isStepValid(5);
      default: return false;
    }
  };

  const goToNextStep = () => activeStep < TOTAL_STEPS && isStepValid(activeStep) && setActiveStep(prev => prev + 1);
  const goToPreviousStep = () => activeStep > 1 && setActiveStep(prev => prev - 1);
  const goToStep = (step: number) => step >= 1 && step <= TOTAL_STEPS && setActiveStep(step);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => e.key === 'Escape' && setIsPreviewModalOpen(false);
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  useEffect(() => {
    const stepElement = stepRefs.current[activeStep];
    if (!stepElement) return;
    const scrollTimeout = setTimeout(() => {
      const topOffset = 100;
      const elementRect = stepElement.getBoundingClientRect();
      const elementTop = elementRect.top + window.pageYOffset;
      window.scrollTo({ top: elementTop - topOffset, behavior: 'smooth' });
    }, 150);
    return () => clearTimeout(scrollTimeout);
  }, [activeStep]);

  const handleAddToCart = async () => {
    if (!isStepValid(7)) return;
    setIsAddingToCart(true);
    try {
      const productId = crypto.randomUUID();
      const matTypeForImage: '3d' | 'classic' = config.matType === '3d-with-rims' ? '3d' : 'classic';
      const productImagePath = getMatImagePath(
        matTypeForImage,
        config.structure as 'diamonds' | 'honey',
        config.color,
        config.edgeColor
      );

      // Dodaj dywaniki do koszyka
      await addToCart({
        productType: 'mat',
        productId: productId,
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
        },
      });

      // Dodaj podpiętkę do koszyka jeśli jest wybrana
      if (config.selectedPodpietka) {
        const selectedPodpietka = accessories.find(acc => acc.id === config.selectedPodpietka);
        if (selectedPodpietka) {
          const podpietkaImage = selectedPodpietka.images && selectedPodpietka.images.length > 0
            ? selectedPodpietka.images[0]
            : selectedPodpietka.imageSrc || '';
          
          await addToCart({
            productType: 'accessory',
            productId: selectedPodpietka.id,
            quantity: 1,
            unitPrice: selectedPodpietka.price,
            productName: `${selectedPodpietka.name}${config.podpietkaColor ? ` - ${config.podpietkaColor}` : ''}`,
            productSku: selectedPodpietka.sku,
            productImage: podpietkaImage,
            configuration: {
              color: config.podpietkaColor || undefined,
            },
          });
        }
      }

      window.dispatchEvent(new CustomEvent('openCartModal'));
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const shouldShowStickyPreview = activeStep >= 2;
  const mainContainerPaddingBottom = shouldShowStickyPreview && config.matType 
    ? 'pb-[180px]' 
    : shouldShowStickyPreview 
    ? 'pb-[100px]' 
    : '';

  // Determine best image for sticky header
  const stickyHeaderImage = useMemo(() => {
    if (hasFullPreview && dynamicPreviewPath) return dynamicPreviewPath;
    if (productPreviewPath) return productPreviewPath;
    return '/dywaniki/3d/diamonds/black/5os-3d-diamonds-black-black.webp'; // Fallback
  }, [hasFullPreview, dynamicPreviewPath, productPreviewPath]);

  if (brandsLoading) return <ConfiguratorLoader />;

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-red-500 selection:text-white">
      {/* Progress Bar - Desktop only */}
      <div className="hidden lg:block sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 shadow-lg transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <StepProgress 
            currentStep={activeStep} 
            totalSteps={TOTAL_STEPS}
            onStepClick={goToStep}
            isValid={isStepValid}
          />
        </div>
      </div>

      {/* Mobile Fixed Header with Product Image */}
      {shouldShowStickyPreview && (
        <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-md border-b border-white/10 shadow-lg">
          <div className="relative w-full h-[40vh] min-h-[300px] max-h-[400px]">
            <Image
              src={stickyHeaderImage}
              alt="Podgląd produktu"
              fill
              className="object-contain p-4"
              priority
            />
            {/* Click to open modal */}
            <button
              onClick={() => {
                setModalImageType(hasFullPreview ? 'dynamic' : 'product');
                setIsPreviewModalOpen(true);
              }}
              className="absolute inset-0 w-full h-full"
              aria-label="Powiększ obraz"
            />
            {/* Zoom hint */}
            <div className="absolute top-4 right-4">
              <Button
                size="icon"
                variant="secondary"
                className="h-10 w-10 rounded-full bg-black/50 backdrop-blur border border-white/20 hover:bg-white/10 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  setModalImageType(hasFullPreview ? 'dynamic' : 'product');
                  setIsPreviewModalOpen(true);
                }}
              >
                <ZoomIn className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${shouldShowStickyPreview ? 'pt-[calc(40vh+1rem)]' : 'pt-12'} lg:pt-12 pb-12 ${shouldShowStickyPreview ? `lg:pb-12 ${mainContainerPaddingBottom}` : ''}`}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 xl:gap-12">
          {/* Left Column - Configuration */}
          <div className="lg:col-span-3 space-y-6">
            {[
              { step: 1, title: "Wybór samochodu", comp: CarSelectionStep, desc: "Dopasujemy dywaniki idealnie do Twojego modelu" },
              { step: 2, title: "Typ dywaników", comp: MatTypeStep, desc: "Wybierz poziom ochrony i stylu" },
              { step: 3, title: "Wariant zestawu", comp: VariantStep, desc: "Dostosuj zestaw do swoich potrzeb" },
              { step: 4, title: "Struktura", comp: StructureStep, desc: "Wybierz wzór komórek EVA" },
              { step: 5, title: "Kolory materiału i obszycia", comp: CombinedColorPicker, desc: "Personalizuj wygląd dywaników" },
              { step: 6, title: "Dodatki", comp: AccessoriesStep, desc: "Dodaj opcjonalne akcesoria" },
              { step: 7, title: "Podsumowanie", comp: SummaryStep, desc: "Sprawdź konfigurację przed zamówieniem" }
            ].map(({ step, title, comp: Comp, desc }) => (
              <StepAccordion
                key={step}
                ref={(el) => { stepRefs.current[step] = el; }}
                step={step}
                title={title}
                benefitDescription={desc}
                isOpen={activeStep === step}
                onToggle={() => goToStep(step)}
                isValid={isStepValid(step)}
              >
                {Comp ? (
                  <Comp
                    config={config}
                    priceBreakdown={priceBreakdown}
                    onUpdate={updateConfig}
                    onNext={goToNextStep}
                    onPrevious={goToPreviousStep}
                    onAddToCart={handleAddToCart}
                    isAddingToCart={isAddingToCart || cartLoading}
                  />
                ) : null}
              </StepAccordion>
            ))}
          </div>

          {/* Right Column - Visualization */}
          <div className="lg:col-span-2 space-y-6 mt-8 lg:mt-0">
            <div className="lg:sticky lg:top-28 space-y-6">
              
              {/* 1. Product Window (Top) */}
              {productPreviewPath && (
                <div className="space-y-4">
                  <div className="relative group bg-neutral-900/50 rounded-2xl border border-white/10 overflow-hidden shadow-lg transition-all hover:shadow-red-900/5">
                    <div className="relative aspect-square">
                      <Image
                        src={productPreviewPath}
                        alt="Podgląd produktu"
                        fill
                        className="object-contain p-4 transition-transform duration-700 group-hover:scale-105"
                        priority
                      />
                      
                      {/* Overlay Controls */}
                      <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-8 w-8 rounded-full bg-black/50 backdrop-blur border border-white/10 hover:bg-white/10 text-white"
                          onClick={() => {
                            setModalImageType('product');
                            setIsPreviewModalOpen(true);
                          }}
                        >
                          <ZoomIn className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Product Gallery */}
                  {((config.matType === 'classic' && classicProductImages) || (config.matType === '3d-with-rims' && rimsProductImages)) && (
                    <div className="bg-neutral-900/50 backdrop-blur-sm border border-white/5 rounded-xl p-4">
                      <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                        <RotateCcw className="w-3 h-3" />
                        Galeria produktu
                      </h4>
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {(config.matType === 'classic' ? classicProductImages : rimsProductImages).map((imagePath) => (
                          <button
                            key={imagePath}
                            onClick={() => config.matType === 'classic' ? setSelectedClassicProductImage(imagePath) : setSelectedRimsProductImage(imagePath)}
                            className={`
                              relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 flex-shrink-0
                              ${(config.matType === 'classic' ? selectedClassicProductImage : selectedRimsProductImage) === imagePath
                                ? 'border-red-500 shadow-lg shadow-red-500/20 scale-105'
                                : 'border-transparent opacity-60 hover:opacity-100 hover:border-white/20'
                              }
                            `}
                          >
                            <Image src={imagePath} alt="Miniatura" fill className="object-cover" sizes="64px" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 2. Rug Preview Window (Bottom) */}
              <div className="relative group bg-gradient-to-br from-neutral-900 to-black rounded-2xl p-1 border border-white/10 shadow-2xl transition-all duration-500 hover:shadow-red-900/10">
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-2xl pointer-events-none" />
                
                <div className="relative aspect-[4/5] bg-black/50 rounded-xl overflow-hidden">
                  {/* Preview Image */}
                  <Image
                    key={`dynamic-${config.color}-${config.edgeColor}`}
                    src={dynamicPreviewPath}
                    alt="Podgląd konfiguracji"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                  />

                  {/* Overlay Controls */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 rounded-full bg-black/50 backdrop-blur border border-white/10 hover:bg-white/10 text-white"
                      onClick={() => {
                        setModalImageType('dynamic');
                        setIsPreviewModalOpen(true);
                      }}
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Config Info Badge */}
                  {hasFullPreview && (
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-black/70 backdrop-blur-md border border-white/10 rounded-lg p-3 flex items-center justify-between gap-4 shadow-lg transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full border border-white/20 shadow-inner" style={{ backgroundColor: getColorInfo(config.color).color }} />
                          <span className="text-xs font-medium text-white">{getColorInfo(config.color).name}</span>
                        </div>
                        <div className="h-3 w-px bg-white/20" />
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full border border-white/20 shadow-inner" style={{ backgroundColor: getColorInfo(config.edgeColor).color }} />
                          <span className="text-xs font-medium text-white">{getColorInfo(config.edgeColor).name}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar with Price and CTA */}
      {shouldShowStickyPreview && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-t border-white/10 pb-safe shadow-2xl">
          {/* Mini Progress Indicator */}
          <div className="h-1 bg-neutral-800">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-300 ease-out"
              style={{ width: `${(activeStep / TOTAL_STEPS) * 100}%` }}
            />
          </div>

          {/* Main Content */}
          <div className="px-4 py-3">
            {/* Price and CTA Row */}
            <div className="flex items-center gap-3">
              {/* Price Section */}
              {activeStep >= 3 ? (
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-gray-400">Cena:</span>
                    <span className="text-xl font-bold text-white">
                      {priceBreakdown.totalPrice.toFixed(2)} zł
                    </span>
                  </div>
                  {priceBreakdown.discount > 0 && (
                    <div className="text-xs text-green-400 mt-0.5">
                      Rabat: -{priceBreakdown.discount.toFixed(2)} zł
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500">
                    Wybierz zestaw aby zobaczyć cenę
                  </div>
                </div>
              )}

              {/* Mini Progress Dots */}
              <div className="flex items-center gap-1.5 px-2">
                {Array.from({ length: TOTAL_STEPS }, (_, i) => {
                  const step = i + 1;
                  const isCompleted = step < activeStep;
                  const isCurrent = step === activeStep;
                  return (
                    <div
                      key={step}
                      className={`
                        w-1.5 h-1.5 rounded-full transition-all duration-300
                        ${isCurrent 
                          ? 'bg-red-500 w-2 h-2' 
                          : isCompleted 
                          ? 'bg-red-500/50' 
                          : 'bg-neutral-600'
                        }
                      `}
                    />
                  );
                })}
              </div>

              {/* CTA Button */}
              <Button
                onClick={handleAddToCart}
                disabled={isAddingToCart || !isStepValid(7)}
                className="min-h-[48px] min-w-[140px] bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold shadow-lg shadow-red-900/30 hover:shadow-red-900/50 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingToCart ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="text-sm">Dodawanie...</span>
                  </div>
                ) : !isStepValid(7) ? (
                  <span className="text-sm">Kontynuuj</span>
                ) : (
                  <span className="flex items-center gap-2 text-sm">
                    <ShoppingCart className="w-4 h-4" />
                    Do koszyka
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Preview Modal */}
      {isPreviewModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setIsPreviewModalOpen(false)}
        >
          <button 
            className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors z-50"
            onClick={() => setIsPreviewModalOpen(false)}
          >
            <span className="sr-only">Zamknij</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          
          <div className="relative w-full h-full flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Main Image Area */}
            <div className="flex-1 relative w-full">
              <Image
                src={modalImageType === 'dynamic' ? dynamicPreviewPath : (productPreviewPath || '')}
                alt="Pełny podgląd"
                fill
                className="object-contain p-4 md:p-12"
                quality={100}
                priority
              />
            </div>

            {/* Modal Navigation - Gallery & View Switcher */}
            <div className="flex justify-center px-4 pb-8 pt-4">
              <div className="flex gap-2 p-2 bg-neutral-900/90 backdrop-blur-md rounded-2xl border border-white/10 overflow-x-auto max-w-full scrollbar-hide shadow-2xl">
                
                {/* Opcja 1: Wizualizacja (tylko jeśli dostępna) */}
                {hasFullPreview && (
                   <button
                     onClick={(e) => {
                        e.stopPropagation();
                        setModalImageType('dynamic');
                     }}
                     className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all duration-300 ${
                       modalImageType === 'dynamic' 
                         ? 'border-red-500 scale-105 shadow-lg shadow-red-500/20 ring-1 ring-red-500/50' 
                         : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/30'
                     }`}
                   >
                     <div className="absolute inset-0 bg-neutral-800" />
                     <Image src={dynamicPreviewPath} alt="Wizualizacja" fill className="object-contain p-1" />
                     {modalImageType === 'dynamic' && <div className="absolute inset-0 bg-red-500/10" />}
                   </button>
                )}

                {/* Separator jeśli mamy obie opcje */}
                {hasFullPreview && <div className="w-px bg-white/10 mx-1 self-center h-8" />}

                {/* Opcja 2: Galeria produktu */}
                {(config.matType === 'classic' ? classicProductImages : rimsProductImages).map((imagePath) => (
                  <button
                    key={imagePath}
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalImageType('product');
                      config.matType === 'classic' ? setSelectedClassicProductImage(imagePath) : setSelectedRimsProductImage(imagePath);
                    }}
                    className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all duration-300 ${
                      modalImageType === 'product' && (config.matType === 'classic' ? selectedClassicProductImage : selectedRimsProductImage) === imagePath 
                        ? 'border-red-500 scale-105 shadow-lg shadow-red-500/20 ring-1 ring-red-500/50' 
                        : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/30'
                    }`}
                  >
                    <Image src={imagePath} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
