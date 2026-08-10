"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/shopping-cart/hooks/useCart";
import { getMatImagePath } from "@/lib/image-mapping";
import { getColorInfo } from "@/lib/color-mapping";
import { useAccessories } from "@/features/accessories/hooks/useAccessories";
import { useBrands } from "@/features/brands/hooks/useBrands";
import { useMatProductImages } from "@/features/mat-product-images";
import { useConfiguratorState } from "@/features/car-configurator/hooks/useConfiguratorState";
import type { ConfiguratorState } from "@/features/car-configurator/utils/configuratorState";
import { useResolvedPricing } from "@/features/vehicle-catalog/hooks/useResolvedPricing";
import { getProductEntryLock } from "@/features/car-configurator/utils/productEntryContext";
import { getPodpietkaTotalPrice } from "@/features/car-configurator/domain/podpietkaMounting";
import { normalizeBrandName } from "@/shared/brands";
import {
  resolvePersistedMatSetVariantLabel,
} from "@/shared/mat-set-labels";
import { formatPricePln, formatPriceValue } from "@/lib/utils/formatPrice";
import { StepProgress } from "./StepProgress";
import { StepAccordion } from "./StepAccordion";
import { CarSelectionStep } from "./CarSelectionStep";
import { LockedCarContextStep } from "./LockedCarContextStep";
import { MatTypeStep } from "./MatTypeStep";
import { VariantStep } from "./VariantStep";
import { StructureStep } from "./StructureStep";
import { CombinedColorPicker } from "./CombinedColorPicker";
import { SummaryStep } from "./SummaryStep";
import { AccessoriesStep } from "./AccessoriesStep";
import { MatTypeVariantStep } from "./MatTypeVariantStep";
import { StructureColorStep } from "./StructureColorStep";
import { ConfiguratorLoader } from "./ConfiguratorLoader";
import { ZoomIn, ArrowLeft, ArrowRight, Info, ShoppingCart } from "lucide-react";
import {
  getStickyPreviewImage,
  getStickyPreviewPaddingTop,
  getStickyPreviewScrollMargin,
  type StickyPreviewTab,
  getMobileStickyStackHeightPx,
} from "./stickyPreview";
import { CarModelPreviewCarousel } from "./CarModelPreviewCarousel";
import { ConfiguratorPreviewFrame } from "./ConfiguratorPreviewFrame";
import { DesktopSidebarPreviewControls } from "./DesktopSidebarPreviewControls";
import {
  canShowRugSidebarPreview,
  getMatTypeForDynamicPreview,
  hasRugPreviewConfigChange,
  isMatTypeSelected,
  usesClassicOnlyDynamicPreview,
} from "./rugPreviewConfig";
import { PLACEHOLDER_CAR_MODEL_PREVIEW_SLIDES } from "./carModelPreviewCarousel.types";
import { MobileStickyPreview } from "./MobileStickyPreview";
import { MobileSummaryPreview } from "./MobileSummaryPreview";

const TOTAL_STEPS_DESKTOP = 7;
const TOTAL_STEPS_MOBILE = 5;

export default function ConfiguratorSimple() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { addToCart, isLoading: cartLoading } = useCart();
  const { accessories } = useAccessories();
  const { brands, isLoading: brandsLoading } = useBrands();
  const { config, updateConfig: applyConfigUpdate } = useConfiguratorState({
    searchParams,
    brands,
  });

  const productEntry = useMemo(
    () => getProductEntryLock(searchParams),
    [searchParams]
  );

  const step1Title = productEntry.isLocked ? "Twój samochód" : "Wybór samochodu";

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
  
  // Aktualny aktywny krok (dla accordion)
  const [activeStep, setActiveStep] = useState<number>(1);
  // Flaga czy to pierwsze renderowanie (aby nie przewijać przy pierwszym załadowaniu)
  const isInitialMount = useRef(true);
  
  // Stan czy koszyk jest otwarty (ukrywa sticky bottom bar)
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  // Stan czy modal produktu (np. podpiętki) jest otwarty
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);

  // Refs dla każdego kroku (do przewijania)
  const stepRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  // Ref dla nagłówków sekcji (tytuł + numer) - do dokładnego przewijania
  const stepHeaderRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => {
    console.log("🔍 ConfiguratorSimple: Syncing params from URL:", {
      brandParam: searchParams.get("brand"),
      modelParam: searchParams.get("model"),
      yearParam: searchParams.get("year"),
      bodyTypeParam: searchParams.get("bodyType"),
      brandsCount: brands.length,
    });
  }, [searchParams, brands.length]);


  const generation = config.generation || undefined;

  // Normalizuj markę dla API (użyj slug z URL)
  const brandForImage = useMemo(() => {
    const brandSlug = searchParams.get('brand') || config.brand.toLowerCase();
    const normalized = normalizeBrandName(brandSlug) || brandSlug;
    console.log('🔍 ConfiguratorSimple: Brand for image:', {
      brandSlug,
      normalized,
      configBrand: config.brand,
    });
    return normalized;
  }, [config.brand, searchParams]);

  // Pobierz zdjęcie produktu z mat_product_images
  const { images: matProductImages } = useMatProductImages({
    brand: brandForImage,
    model: config.model,
    year: config.year ? parseInt(config.year) : undefined,
    generation: generation,
    bodyType: config.bodyType || undefined,
    enabled: !!(brandForImage && config.model && config.year && config.bodyType),
  });

  console.log('🔍 ConfiguratorSimple: Product image query:', {
    brand: brandForImage,
    model: config.model,
    year: config.year ? parseInt(config.year) : undefined,
    generation,
    bodyType: config.bodyType,
    enabled: !!(brandForImage && config.model && config.year && config.bodyType),
    imagesCount: matProductImages?.length || 0,
  });

  // Wybierz pierwsze dostępne zdjęcie produktu
  const matProductImage = useMemo(() => {
    console.log('🔍 ConfiguratorSimple: Calculating matProductImage:', {
      matProductImagesCount: matProductImages?.length || 0,
      matProductImages: matProductImages,
    });
    if (matProductImages && matProductImages.length > 0) {
      const imageUrl = matProductImages[0].image_url;
      console.log('✅ ConfiguratorSimple: Found product image:', imageUrl);
      return imageUrl;
    }
    console.log('⚠️ ConfiguratorSimple: No product image found');
    return null;
  }, [matProductImages]);
  
  // Stan dodawania do koszyka
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Stan modala z podglądem
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [modalImageType, setModalImageType] = useState<'dynamic' | 'product' | 'mat-product' | null>(null);
  const [step1GalleryModalUrl, setStep1GalleryModalUrl] = useState<string | null>(null);
  
  // Stan aktywnego widoku podglądu (tabs)
  const [activePreviewTab, setActivePreviewTab] = useState<StickyPreviewTab>('dynamic');
  const [isPreviewCollapsed, setIsPreviewCollapsed] = useState(false);
  const [showPreviewHint, setShowPreviewHint] = useState(false);

  const focusDynamicPreview = useCallback(() => {
    setActivePreviewTab("dynamic");
  }, []);

  const updateConfig = useCallback(
    (updates: Partial<ConfiguratorState>) => {
      const switchToDynamicPreview = () => {
        if (!hasRugPreviewConfigChange(updates)) return;
        const matAfter = updates.matType ?? config.matType;
        if (canShowRugSidebarPreview(activeStep, matAfter)) {
          focusDynamicPreview();
        }
      };

      if (productEntry.isLocked) {
        const { brand, model, year, bodyType, ...rest } = updates;
        const hasLockedFieldUpdate =
          brand !== undefined ||
          model !== undefined ||
          year !== undefined ||
          bodyType !== undefined;

        if (hasLockedFieldUpdate && Object.keys(rest).length === 0) {
          return;
        }

        applyConfigUpdate(rest);
        switchToDynamicPreview();
        return;
      }

      applyConfigUpdate(updates);
      switchToDynamicPreview();
    },
    [
      applyConfigUpdate,
      productEntry.isLocked,
      config.matType,
      activeStep,
      focusDynamicPreview,
    ]
  );
  
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

  const pricingQuery = useResolvedPricing({
    recordKey: config.recordKey || undefined,
    year: config.year ? Number(config.year) : undefined,
    bodyTypeKey: config.bodyTypeKey || undefined,
    matType: config.matType,
    variantKey: config.variant || undefined,
  });
  const pricingVariants = pricingQuery.data?.variants ?? [];
  const skipMatTypeStep =
    pricingQuery.data?.availableMatTypes?.length === 1 &&
    pricingQuery.data.availableMatTypes[0] === "single";

  useEffect(() => {
    const pricing = pricingQuery.data;
    if (!pricing) return;

    const updates: Partial<ConfiguratorState> = {};
    if (pricing.matType === "single" && config.matType !== "single") {
      updates.matType = "single";
    }
    if (config.pricingCategoryKey !== pricing.pricingCategoryKey) {
      updates.pricingCategoryKey = pricing.pricingCategoryKey;
    }
    if (config.catalogVersionCode !== pricing.catalogVersionCode) {
      updates.catalogVersionCode = pricing.catalogVersionCode;
    }
    if (Object.keys(updates).length > 0) applyConfigUpdate(updates);
  }, [
    pricingQuery.data,
    config.matType,
    config.pricingCategoryKey,
    config.catalogVersionCode,
    applyConfigUpdate,
  ]);

  const priceBreakdown = useMemo(() => {
    const selectedVariant = pricingQuery.data?.selectedVariant;
    if (!config.variant || !selectedVariant) {
      return {
        basePrice: 0,
        discount: 0,
        priceAfterDiscount: 0,
        shippingCost: 0,
        totalPrice: 0,
      };
    }
    return {
      basePrice: selectedVariant.basePrice,
      discount: selectedVariant.discount,
      priceAfterDiscount: selectedVariant.priceAfterDiscount,
      shippingCost: 0,
      totalPrice: selectedVariant.priceAfterDiscount,
    };
  }, [config.variant, pricingQuery.data?.selectedVariant]);

  // Znajdź wybraną podpiętkę
  const selectedPodpietka = useMemo(() => {
    if (!config.selectedPodpietka) return null;
    return accessories.find(acc => acc.id === config.selectedPodpietka) || null;
  }, [accessories, config.selectedPodpietka]);

  // Oblicz całkowitą cenę z podpiętką
  const totalPriceWithAccessories = useMemo(() => {
    const accessoryPrice = selectedPodpietka
      ? getPodpietkaTotalPrice(selectedPodpietka.price, config.podpietkaMounting)
      : 0;
    return priceBreakdown.totalPrice + accessoryPrice;
  }, [priceBreakdown.totalPrice, selectedPodpietka, config.podpietkaMounting]);

  // Generuj ścieżkę do dynamicznego obrazu dywanika (zmienia się z kolorami/strukturą)
  const dynamicPreviewPath = useMemo(() => {
    if (!config.structure || !config.color || !config.edgeColor) {
      return '/dywaniki/3d/diamonds/black/5os-3d-diamonds-black-black.webp'; // Fallback
    }
    
    const matType = getMatTypeForDynamicPreview(
      config.matType,
      config.pricingCategoryKey,
    );
    return getMatImagePath(
      matType,
      config.structure,
      config.color,
      config.edgeColor
    );
  }, [
    config.matType,
    config.pricingCategoryKey,
    config.structure,
    config.color,
    config.edgeColor,
  ]);

  // Generuj ścieżkę do zdjęcia produktu (wybrane zdjęcie z galerii)
  const productPreviewPath = useMemo(() => {
    if (!config.matType) return null;
    if (
      usesClassicOnlyDynamicPreview(config.matType, config.pricingCategoryKey)
    ) {
      return null;
    }
    if (config.matType === "3d-with-rims") {
      return selectedRimsProductImage;
    }
    if (config.matType === "classic") return selectedClassicProductImage;
    return null;
  }, [
    config.matType,
    config.pricingCategoryKey,
    selectedClassicProductImage,
    selectedRimsProductImage,
  ]);
  
  // Resetuj wybrane zdjęcie gdy zmienia się typ dywaników
  useEffect(() => {
    if (config.matType === 'classic' && !classicProductImages.includes(selectedClassicProductImage)) {
      setSelectedClassicProductImage(classicProductImages[0]);
    } else if (config.matType === '3d-with-rims' && !rimsProductImages.includes(selectedRimsProductImage)) {
      setSelectedRimsProductImage(rimsProductImages[0]);
    }
  }, [config.matType, selectedClassicProductImage, selectedRimsProductImage]);

  // Sprawdź czy mamy pełny podgląd (wszystkie opcje wybrane)
  const hasFullPreview = !!(config.structure && config.color && config.edgeColor);

  const isCarComplete = !!(
    config.brand && config.model && config.year && config.bodyType
  );

  const carLabel = isCarComplete
    ? `${config.brand} ${config.model} · ${config.year} · ${config.bodyType}`
    : null;

  useEffect(() => {
    if (typeof window === "undefined") return;
    setShowPreviewHint(sessionStorage.getItem("eva-configurator-preview-hint") !== "1");
  }, []);

  const handleDismissPreviewHint = () => {
    setShowPreviewHint(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("eva-configurator-preview-hint", "1");
    }
  };

  const handleOpenPreviewModal = (tab: StickyPreviewTab) => {
    handleDismissPreviewHint();
    setActivePreviewTab(tab);
    setModalImageType(
      tab === "mat-product" ? "mat-product" : tab === "product" ? "product" : "dynamic"
    );
    setIsPreviewModalOpen(true);
  };

  const handleStep1MainPreview = useCallback(() => {
    setStep1GalleryModalUrl(null);
    if (matProductImage && isCarComplete) {
      handleOpenPreviewModal("mat-product");
    }
  }, [matProductImage, isCarComplete, handleOpenPreviewModal]);

  const handleStep1GalleryPreview = useCallback(
    (slide: { imageUrl: string }) => {
      setStep1GalleryModalUrl(slide.imageUrl);
      setModalImageType("product");
      setIsPreviewModalOpen(true);
    },
    []
  );

  const step1PreviewCarouselProps = useMemo(
    () => ({
      brand: config.brand,
      model: config.model,
      carLabel,
      isCarComplete,
      mainImageUrl: matProductImage,
      fallbackMainImage: PLACEHOLDER_CAR_MODEL_PREVIEW_SLIDES[0].imageUrl,
      onOpenMainPreview: handleStep1MainPreview,
      onOpenGalleryPreview: handleStep1GalleryPreview,
    }),
    [
      config.brand,
      config.model,
      carLabel,
      isCarComplete,
      matProductImage,
      handleStep1MainPreview,
      handleStep1GalleryPreview,
    ]
  );

  const step1PreviewCarouselMobile = useMemo(
    () => <CarModelPreviewCarousel {...step1PreviewCarouselProps} />,
    [step1PreviewCarouselProps]
  );

  const step1PreviewCarouselDesktop = useMemo(
    () => (
      <CarModelPreviewCarousel
        {...step1PreviewCarouselProps}
        heroLayout="preview-frame"
        mainImageFit="cover"
        className="mb-0"
      />
    ),
    [step1PreviewCarouselProps]
  );

  const productSetGalleryImages =
    config.matType === "classic"
      ? classicProductImages
      : config.matType === "3d-with-rims"
        ? rimsProductImages
        : [];

  const handleSelectProductSetImage = useCallback(
    (imagePath: string) => {
      if (config.matType === "classic") {
        setSelectedClassicProductImage(imagePath);
      } else if (config.matType === "3d-with-rims") {
        setSelectedRimsProductImage(imagePath);
      }
      setActivePreviewTab("product");
    },
    [config.matType]
  );

  const handleSelectDynamicPreview = focusDynamicPreview;

  const hasMatTypeSelected = isMatTypeSelected(config.matType);

  /** Podgląd dynamiczny i galeria zestawu — od kroku 2, po wyborze typu dywanika */
  const canShowDynamicPreview = canShowRugSidebarPreview(activeStep, config.matType);

  const canShowProductSetGallery =
    canShowDynamicPreview &&
    !usesClassicOnlyDynamicPreview(config.matType, config.pricingCategoryKey);

  const showProductSetGallery =
    canShowProductSetGallery &&
    !!productPreviewPath &&
    productSetGalleryImages.length > 0;

  const showConfiguredDynamicPreview = canShowDynamicPreview && hasFullPreview;

  const desktopSidebarPreview = useMemo(() => {
    const showProductInFrame =
      activePreviewTab === "product" && !!productPreviewPath;

    if (showProductInFrame) {
      return {
        src: productPreviewPath,
        imageKey: `product-${productPreviewPath}`,
        modalType: "product" as const,
      };
    }

    return {
      src: dynamicPreviewPath,
      imageKey: `dynamic-${config.color}-${config.edgeColor}`,
      modalType: "dynamic" as const,
    };
  }, [
    activePreviewTab,
    productPreviewPath,
    dynamicPreviewPath,
    config.color,
    config.edgeColor,
  ]);

  const showStep1MatProductPreview = activeStep === 1;

  useEffect(() => {
    if (activeStep === 1 && activePreviewTab !== "mat-product") {
      if (matProductImage) setActivePreviewTab("mat-product");
    }
  }, [activeStep, activePreviewTab, matProductImage]);

  useEffect(() => {
    if (activeStep >= 2 && activeStep < 5 && activePreviewTab === "mat-product") {
      if (canShowDynamicPreview) {
        setActivePreviewTab("dynamic");
      } else if (productPreviewPath) {
        setActivePreviewTab("product");
      } else {
        setActivePreviewTab("dynamic");
      }
    }
  }, [activeStep, activePreviewTab, canShowDynamicPreview, productPreviewPath]);

  useEffect(() => {
    if (!canShowDynamicPreview && activePreviewTab === "dynamic") {
      if (showStep1MatProductPreview && matProductImage) {
        setActivePreviewTab("mat-product");
      } else if (productPreviewPath) {
        setActivePreviewTab("product");
      }
    }
  }, [
    canShowDynamicPreview,
    activePreviewTab,
    matProductImage,
    productPreviewPath,
    showStep1MatProductPreview,
  ]);

  // Automatyczne przełączanie na dostępny tab
  useEffect(() => {
    if (
      activePreviewTab === "dynamic" &&
      (!canShowDynamicPreview || !hasFullPreview)
    ) {
      if (showStep1MatProductPreview && matProductImage) {
        setActivePreviewTab("mat-product");
      } else if (productPreviewPath) {
        setActivePreviewTab("product");
      }
    } else if (activePreviewTab === "product" && !productPreviewPath) {
      if (showStep1MatProductPreview && matProductImage) {
        setActivePreviewTab("mat-product");
      } else if (showConfiguredDynamicPreview) {
        setActivePreviewTab("dynamic");
      }
    } else if (activePreviewTab === "mat-product" && !matProductImage) {
      if (showConfiguredDynamicPreview) {
        setActivePreviewTab("dynamic");
      } else if (productPreviewPath) {
        setActivePreviewTab("product");
      }
    } else if (
      activePreviewTab === "mat-product" &&
      !showStep1MatProductPreview
    ) {
      if (canShowDynamicPreview) {
        setActivePreviewTab("dynamic");
      } else if (productPreviewPath) {
        setActivePreviewTab("product");
      } else {
        setActivePreviewTab("dynamic");
      }
    }
  }, [
    activePreviewTab,
    hasFullPreview,
    canShowDynamicPreview,
    showConfiguredDynamicPreview,
    productPreviewPath,
    matProductImage,
    showStep1MatProductPreview,
  ]);


  // Walidacja kroku - desktop (7 kroków)
  const isStepValidDesktop = (step: number): boolean => {
    switch (step) {
      case 1: return !!(config.brand && config.model && config.year && config.bodyType);
      case 2: return skipMatTypeStep ? true : !!config.matType;
      case 3: return !!config.variant;
      case 4: return !!config.structure;
      case 5: return !!(config.color && config.edgeColor);
      case 6: return true;
      case 7: return isStepValidDesktop(1) && isStepValidDesktop(2) && isStepValidDesktop(3) && isStepValidDesktop(4) && isStepValidDesktop(5);
      default: return false;
    }
  };

  // Walidacja kroku - mobile (5 kroków)
  const isStepValidMobile = (step: number): boolean => {
    switch (step) {
      case 1: return !!(config.brand && config.model && config.year && config.bodyType);
      case 2: return skipMatTypeStep
        ? !!config.variant
        : !!(config.matType && config.variant);
      case 3: return !!(config.structure && config.color && config.edgeColor);
      case 4: return true; // Dodatki są opcjonalne
      case 5: return isStepValidMobile(1) && isStepValidMobile(2) && isStepValidMobile(3); // Podsumowanie - wszystkie wymagane kroki muszą być wypełnione
      default: return false;
    }
  };

  // Uniwersalna walidacja (używana w różnych miejscach)
  const isStepValid = (step: number): boolean => {
    // Dla mobile używamy mobile validation, dla desktop desktop validation
    if (step <= 4) {
      return isStepValidMobile(step);
    }
    return isStepValidDesktop(step);
  };

  const goToNextStep = () => {
    // Na mobile max 4 kroki, na desktop max 7 kroków
    // Sprawdzamy obie walidacje - jeśli któraś przejdzie, pozwalamy na następny krok
    const canGoNextMobile = activeStep < TOTAL_STEPS_MOBILE && isStepValidMobile(activeStep);
    const canGoNextDesktop = activeStep < TOTAL_STEPS_DESKTOP && isStepValidDesktop(activeStep);
    if (canGoNextMobile || canGoNextDesktop) {
      setActiveStep(prev => prev + 1);
    }
  };
  const goToPreviousStep = () => {
    if (activeStep > 1) {
      setActiveStep(prev => prev - 1);
      // Resetuj stan koszyka gdy cofamy się z podsumowania
      if (activeStep === 5) {
        setIsCartOpen(false);
      }
    }
  };
  const goToStep = (step: number) => {
    // Pozwalamy na przejście do kroku jeśli jest w zakresie mobile lub desktop
    if ((step >= 1 && step <= TOTAL_STEPS_MOBILE) || (step >= 1 && step <= TOTAL_STEPS_DESKTOP)) {
      setActiveStep(step);
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsPreviewModalOpen(false);
        setStep1GalleryModalUrl(null);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  // Nasłuchuj na otwarcie/zamknięcie koszyka
  useEffect(() => {
    const handleCartOpen = () => setIsCartOpen(true);
    const handleCartClose = () => {
      setIsCartOpen(false);
      // Jeśli użytkownik był w kroku 5 (podsumowanie), cofnij się do kroku 4
      // aby sticky header mógł się pojawić
      if (activeStep === 5) {
        setActiveStep(4);
      }
    };
    
    // Nasłuchuj na event cartModalStateChange z navbar (główny mechanizm synchronizacji)
    const handleCartModalStateChange = (event: CustomEvent) => {
      const { isOpen } = event.detail;
      setIsCartOpen(isOpen);
      // Jeśli koszyk się zamyka i użytkownik był w kroku 5 (podsumowanie), cofnij się do kroku 4
      if (!isOpen && activeStep === 5) {
        setActiveStep(4);
      }
    };
    
    window.addEventListener('openCartModal', handleCartOpen);
    window.addEventListener('closeCartModal', handleCartClose);
    window.addEventListener('cartModalStateChange', handleCartModalStateChange as EventListener);
    
    return () => {
      window.removeEventListener('openCartModal', handleCartOpen);
      window.removeEventListener('closeCartModal', handleCartClose);
      window.removeEventListener('cartModalStateChange', handleCartModalStateChange as EventListener);
    };
  }, [activeStep]);

  useEffect(() => {
    const isMobile = window.innerWidth < 1024;
    
    // Na mobile pomiń przewijanie przy pierwszym renderowaniu
    if (isMobile && isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    // Na desktop zawsze przewijaj gdy zmienia się krok (ale nie przy pierwszym załadowaniu)
    if (!isMobile && isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Najpierw spróbuj użyć ref nagłówka, jeśli nie ma, użyj ref całego elementu
    const headerElement = stepHeaderRefs.current[activeStep];
    const stepElement = headerElement || stepRefs.current[activeStep];
    if (!stepElement) {
      // Jeśli element nie istnieje, spróbuj ponownie po krótkim opóźnieniu
      setTimeout(() => {
        const retryElement = stepHeaderRefs.current[activeStep] || stepRefs.current[activeStep];
        if (retryElement && !isMobile) {
          const navbarHeight = 96;
          const progressBarHeight = 80;
          const topOffset = navbarHeight + progressBarHeight + 20;
          const elementRect = retryElement.getBoundingClientRect();
          const currentScrollY = window.pageYOffset || window.scrollY;
          const elementTop = elementRect.top + currentScrollY;
          const scrollPosition = elementTop - topOffset;
          if (scrollPosition >= 0 && scrollPosition < document.documentElement.scrollHeight) {
            window.scrollTo({ top: scrollPosition, behavior: 'smooth' });
          }
        }
      }, 500);
      return;
    }
    
    // Użyj requestAnimationFrame + setTimeout aby upewnić się, że element jest już w DOM i wyrenderowany
    const delay = isMobile ? 150 : 400; // Większe opóźnienie na desktop aby accordion zdążył się otworzyć
    
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(() => {
          const elementRect = stepElement.getBoundingClientRect();
          
          if (isMobile) {
            // Pobierz pozycję elementu względem viewport
            const currentScrollY = window.pageYOffset || window.scrollY;
            const elementTop = elementRect.top + currentScrollY;
            
            // Oblicz wysokość sticky header dla konkretnego kroku
            // Krok 1: tylko navbar (64px)
            // Krok 5: tylko navbar (64px) - brak sticky preview
            // Kroki 2-4: navbar + sticky podgląd (wysokość zsynchronizowana z MobileStickyPreview)
            const navbarHeight = 64; // h-16
            let stickyHeaderHeight = navbarHeight;
            
            // Dla kroku 5 (podsumowanie) zawsze przewijaj do początku sekcji
            if (activeStep === 5) {
              // Tylko navbar, bez sticky preview
              stickyHeaderHeight = navbarHeight;
              const scrollPosition = elementTop - stickyHeaderHeight - 20;
              if (scrollPosition >= 0 && scrollPosition < document.documentElement.scrollHeight) {
                window.scrollTo({ top: Math.max(0, scrollPosition), behavior: 'smooth' });
              }
              return;
            }
            
            // Dla innych kroków sprawdź czy element jest już widoczny
            const isElementVisible = elementRect.top >= 0 && elementRect.top < window.innerHeight;
            
            // Jeśli element jest już widoczny i jesteśmy na początku strony, nie przewijaj
            if (isElementVisible && window.scrollY < 100) {
              return;
            }
            
            // Dla kroków 2-4 sprawdź czy sticky preview jest widoczny
            if (activeStep >= 2 && activeStep < 5) {
              const hasStickyPreview = isStepValidMobile(2) || activeStep >= 2;
              if (hasStickyPreview) {
                stickyHeaderHeight = getMobileStickyStackHeightPx(
                  isPreviewCollapsed,
                  window.innerHeight,
                  window.innerWidth
                );
              } else {
                stickyHeaderHeight = navbarHeight;
              }
            }
            
            // Oblicz pozycję scrollu tak, aby element był widoczny pod sticky header
            // Dodajemy 20px odstępu dla lepszej czytelności
            const scrollPosition = elementTop - stickyHeaderHeight - 20;
            
            // Przewiń do pozycji z uwzględnieniem sticky header (tylko jeśli pozycja jest sensowna)
            if (scrollPosition >= 0 && scrollPosition < document.documentElement.scrollHeight) {
              window.scrollTo({ top: Math.max(0, scrollPosition), behavior: 'smooth' });
            }
          } else {
            // Na desktop przewijaj płynnie do sekcji z uwzględnieniem navbar + pasek postępu
            const navbarHeight = 96; // lg:h-24 = 96px
            const progressBarHeight = 80; // wysokość paska postępu (~80px)
            const topOffset = navbarHeight + progressBarHeight + 40; // navbar + pasek + odstęp
            
            // Oblicz pozycję elementu względem dokumentu
            const currentScrollY = window.pageYOffset || window.scrollY;
            const elementTop = elementRect.top + currentScrollY;
            const scrollPosition = elementTop - topOffset;
            
            // Sprawdź czy element jest już w pełni widoczny w viewport
            const viewportTop = currentScrollY + topOffset;
            const viewportBottom = currentScrollY + window.innerHeight;
            const elementBottom = elementTop + elementRect.height;
            const isFullyVisible = elementTop >= viewportTop && elementBottom <= viewportBottom;
            
            // Dla kroku 7 (podsumowanie) zawsze przewijaj do sekcji, jeśli nie jest w pełni widoczna
            if (activeStep === 7) {
              if (!isFullyVisible && scrollPosition >= 0 && scrollPosition < document.documentElement.scrollHeight) {
                window.scrollTo({ 
                  top: scrollPosition, 
                  behavior: 'smooth' 
                });
              }
            } else {
              // Dla innych kroków przewijaj w dół tylko jeśli element jest poniżej aktualnej pozycji scrollu
              // To zapewnia, że zawsze przewijamy w dół, a nie w górę
              if (scrollPosition > currentScrollY && scrollPosition < document.documentElement.scrollHeight) {
                window.scrollTo({ 
                  top: scrollPosition, 
                  behavior: 'smooth' 
                });
              }
            }
          }
        }, delay);
      });
    });
  }, [activeStep, config.matType]);

  const handleAddToCart = async () => {
    // Walidacja dla desktop (wymaga kroku 7) lub mobile (wymaga kroków 1-3)
    const isValidDesktop = isStepValidDesktop(7);
    const isValidMobile = isStepValidMobile(1) && isStepValidMobile(2) && isStepValidMobile(3);
    if (!isValidDesktop && !isValidMobile) return;
    setIsAddingToCart(true);
    try {
      const productId = crypto.randomUUID();
      const matTypeForImage = getMatTypeForDynamicPreview(
        config.matType,
        config.pricingCategoryKey,
      );
      const productImagePath = getMatImagePath(
        matTypeForImage,
        config.structure as 'diamonds' | 'honey',
        config.color,
        config.edgeColor
      );

      const setVariantLabel = resolvePersistedMatSetVariantLabel({
        setType: config.matType,
        setVariant: config.variant,
        pricingCategoryKey: config.pricingCategoryKey,
        bodyTypeKey: config.bodyTypeKey,
        pricingLabel: pricingQuery.data?.selectedVariant?.label,
      });

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
            brandKey: config.brandKey,
            model: config.model,
            modelFamilyKey: config.modelFamilyKey,
            modelKey: config.modelKey,
            generation: config.generation,
            year: config.year,
            bodyType: config.bodyType,
            bodyTypeKey: config.bodyTypeKey,
            recordKey: config.recordKey,
            templateId: config.templateId,
          },
          pricing: {
            pricingCategoryKey: config.pricingCategoryKey,
            catalogVersionCode: config.catalogVersionCode,
            basePrice: priceBreakdown.basePrice,
            priceAfterDiscount: priceBreakdown.priceAfterDiscount,
            totalPrice: priceBreakdown.totalPrice,
          },
          setType: config.matType,
          setVariant: config.variant,
          setVariantLabel,
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
            unitPrice: getPodpietkaTotalPrice(
              selectedPodpietka.price,
              config.podpietkaMounting,
            ),
            productName: `${selectedPodpietka.name}${config.podpietkaColor ? ` - ${config.podpietkaColor}` : ''}`,
            productSku: selectedPodpietka.sku,
            productImage: podpietkaImage,
            configuration: {
              color: config.podpietkaColor || undefined,
              mounting: config.podpietkaMounting,
            },
          });
        }
      }

      // Ustaw isCartOpen na true przed wysłaniem eventu, aby sticky bottom bar zniknął natychmiast
      setIsCartOpen(true);
      window.dispatchEvent(new CustomEvent('openCartModal'));
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Pokazuj sticky preview gdy wybrano typ i wariant (mobile) lub gdy jesteśmy na kroku 2+ (desktop)
  // Na mobile sticky bottom bar pojawia się dopiero od sekcji 2 (activeStep >= 2)
  const shouldShowStickyPreview = activeStep >= 2 && !isCartOpen && activeStep !== 5;
  const mainContainerPaddingBottom = shouldShowStickyPreview && config.matType
    ? "pb-[200px]"
    : shouldShowStickyPreview
      ? "pb-[110px]"
      : "";

  // Determine best image for sticky header
  const stickyPreviewFallback = "/dywaniki/3d/diamonds/black/5os-3d-diamonds-black-black.webp";
  const stickyHeaderImage = useMemo(() => {
    return getStickyPreviewImage({
      activePreviewTab,
      hasFullPreview,
      dynamicPreviewPath,
      productPreviewPath,
      matProductImage,
      fallbackPath: stickyPreviewFallback,
      canShowDynamicPreview,
      includeMatProduct: false,
    });
  }, [
    activePreviewTab,
    hasFullPreview,
    dynamicPreviewPath,
    productPreviewPath,
    matProductImage,
    stickyPreviewFallback,
    canShowDynamicPreview,
  ]);

  const productGalleryImages = canShowProductSetGallery
    ? productSetGalleryImages
    : [];
  const selectedProductImage =
    config.matType === "classic"
      ? selectedClassicProductImage
      : selectedRimsProductImage;

  const mobileStickyPaddingTop = shouldShowStickyPreview
    ? getStickyPreviewPaddingTop(isPreviewCollapsed)
    : "pt-12";
  const mobileStepScrollMargin = getStickyPreviewScrollMargin(isPreviewCollapsed);

  if (brandsLoading) return <ConfiguratorLoader />;

  // Sprawdź czy jesteśmy na checkout - jeśli tak, nie renderuj progress bar i sticky bottom bar
  const isOnCheckout = pathname === '/checkout';
  const shouldHideDesktopBars = isCartOpen || isOnCheckout || isProductModalOpen;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-500 selection:text-white lg:overflow-hidden">
      {/* Progress Bar - Desktop only - REMOVED to save vertical space */}
      {/* 
      {!shouldHideDesktopBars && (
      <div className="hidden lg:block fixed top-24 left-0 right-0 z-[60] bg-black/80 backdrop-blur-md border-b border-white/10 shadow-lg transition-all duration-300 lg:scale-[0.85] lg:origin-top lg:w-[117.647%] lg:left-1/2 lg:-translate-x-1/2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <StepProgress 
            currentStep={activeStep} 
            totalSteps={TOTAL_STEPS_DESKTOP}
            onStepClick={goToStep}
            isValid={isStepValidDesktop}
          />
        </div>
      </div>
      )}
      */}

      {shouldShowStickyPreview && (
        <MobileStickyPreview
          previewImage={stickyHeaderImage}
          activeTab={activePreviewTab}
          onTabChange={setActivePreviewTab}
          onOpenModal={handleOpenPreviewModal}
          isCollapsed={isPreviewCollapsed}
          onToggleCollapse={() => setIsPreviewCollapsed((prev) => !prev)}
          showDynamicTab={canShowDynamicPreview}
          showProductTab={showProductSetGallery}
          showMatProductTab={false}
          dynamicThumbnail={dynamicPreviewPath}
          matProductImage={matProductImage}
          productGalleryImages={productGalleryImages}
          selectedProductImage={selectedProductImage}
          onSelectProductImage={handleSelectProductSetImage}
          showPreviewHint={showPreviewHint}
          onDismissPreviewHint={handleDismissPreviewHint}
          showBackToDynamicButton={showProductSetGallery}
          onBackToDynamic={handleSelectDynamicPreview}
        />
      )}

      {/* Main Content - scale 1.01 = 1% powiększenie (minimalne) */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scale-[1] origin-top w-full min-w-0 mx-auto ${mobileStickyPaddingTop} lg:pt-32 pb-12 ${shouldShowStickyPreview ? `lg:pb-24 ${mainContainerPaddingBottom}` : ''}`}>
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-5 xl:gap-6">
          {/* Mobile: Krokowe etapy - jeden krok na raz (4 kroki) */}
          <div className="lg:hidden">
            {/* Step 1: Wybór samochodu */}
            {activeStep === 1 && (
              <div
                ref={(el) => { stepRefs.current[1] = el; }}
                className="bg-[#111] rounded-xl border border-white/10 p-6 transition-all duration-200 scroll-mt-16"
              >
                <div 
                  ref={(el) => { stepHeaderRefs.current[1] = el; }}
                  className="flex items-center gap-3 mb-4"
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${isStepValidMobile(1) ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 border border-white/10'}`}>
                    <span className="text-sm font-bold">1</span>
                  </div>
                  <h2 className="text-xl font-semibold text-white">{step1Title}</h2>
                </div>
                {step1PreviewCarouselMobile}
                {productEntry.isLocked ? (
                  <LockedCarContextStep
                    config={config}
                    productEntry={productEntry}
                    onUpdate={applyConfigUpdate}
                    onNext={goToNextStep}
                  />
                ) : (
                  <CarSelectionStep
                    config={config}
                    onUpdate={updateConfig}
                    onNext={goToNextStep}
                  />
                )}
              </div>
            )}

            {/* Step 2: Typ i wariant zestawu */}
            {activeStep === 2 && (
              <div
                ref={(el) => { stepRefs.current[2] = el; }}
                className={`bg-[#111] rounded-xl border border-white/10 p-6 transition-all duration-200 ${mobileStepScrollMargin}`}
              >
                <div 
                  ref={(el) => { stepHeaderRefs.current[2] = el; }}
                  className="flex items-center gap-3 mb-4"
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${isStepValidMobile(2) ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 border border-white/10'}`}>
                    <span className="text-sm font-bold">2</span>
                  </div>
                  <h2 className="text-xl font-semibold text-white">Typ i wariant zestawu</h2>
                </div>
                <MatTypeVariantStep
                  config={{
                    matType: config.matType,
                    variant: config.variant || "front",
                  }}
                  pricingVariants={pricingVariants}
                  pricingCategoryKey={config.pricingCategoryKey}
                  bodyTypeKey={config.bodyTypeKey}
                  skipMatTypeStep={skipMatTypeStep}
                  priceBreakdown={priceBreakdown}
                  onUpdate={updateConfig}
                  onNext={goToNextStep}
                  onPrevious={goToPreviousStep}
                />
              </div>
            )}

            {/* Step 3: Struktura i kolory */}
            {activeStep === 3 && (
              <div
                ref={(el) => { stepRefs.current[3] = el; }}
                className={`bg-[#111] rounded-xl border border-white/10 p-6 transition-all duration-200 ${mobileStepScrollMargin}`}
              >
                <div 
                  ref={(el) => { stepHeaderRefs.current[3] = el; }}
                  className="flex items-center gap-3 mb-4"
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${isStepValidMobile(3) ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 border border-white/10'}`}>
                    <span className="text-sm font-bold">3</span>
                  </div>
                  <h2 className="text-xl font-semibold text-white">Struktura i kolory</h2>
                </div>
                <StructureColorStep
                  config={{
                    matType: config.matType,
                    structure: config.structure,
                    color: config.color,
                    edgeColor: config.edgeColor,
                  }}
                  onUpdate={updateConfig}
                  onNext={goToNextStep}
                  onPrevious={goToPreviousStep}
                />
              </div>
            )}

            {/* Step 4: Dodatki */}
            {activeStep === 4 && (
              <div
                ref={(el) => { stepRefs.current[4] = el; }}
                className={`bg-[#111] rounded-xl border border-white/10 p-6 transition-all duration-200 ${mobileStepScrollMargin}`}
              >
                <div 
                  ref={(el) => { stepHeaderRefs.current[4] = el; }}
                  className="flex items-center gap-3 mb-4"
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${isStepValidMobile(4) ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 border border-white/10'}`}>
                    <span className="text-sm font-bold">4</span>
                  </div>
                  <h2 className="text-xl font-semibold text-white">Dodatki (opcjonalne)</h2>
                </div>
                <AccessoriesStep
                  config={config}
                  onUpdate={updateConfig}
                  onNext={goToNextStep}
                  onPrevious={goToPreviousStep}
                  onProductModalOpenChange={setIsProductModalOpen}
                />
              </div>
            )}

            {/* Step 5: Podsumowanie */}
            {activeStep === 5 && (
              <div
                ref={(el) => { stepRefs.current[5] = el; }}
                className="bg-[#111] rounded-xl border border-white/10 p-6 transition-all duration-200 scroll-mt-16"
              >
                <div 
                  ref={(el) => { stepHeaderRefs.current[5] = el; }}
                  className="flex items-center gap-3 mb-4"
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${isStepValidMobile(5) ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 border border-white/10'}`}>
                    <span className="text-sm font-bold">5</span>
                  </div>
                  <h2 className="text-xl font-semibold text-white">Podsumowanie</h2>
                </div>
                <MobileSummaryPreview
                  carLabel={carLabel ?? `${config.brand} ${config.model}`}
                  matProductImage={matProductImage}
                  dynamicPreviewPath={dynamicPreviewPath}
                  productPreviewPath={productPreviewPath}
                  hasFullPreview={showConfiguredDynamicPreview}
                  onOpenPreview={() =>
                    handleOpenPreviewModal(
                      showConfiguredDynamicPreview
                        ? "dynamic"
                        : matProductImage
                          ? "mat-product"
                          : "product"
                    )
                  }
                />
                <SummaryStep
                  config={config}
                  priceBreakdown={priceBreakdown}
                  onPrevious={goToPreviousStep}
                  onAddToCart={handleAddToCart}
                  isAddingToCart={isAddingToCart || cartLoading}
                />
              </div>
            )}
          </div>

          {/* Desktop: Konfigurator – po prawej (order-2), col-span-4 dla większych okien opcji */}
          <div className="hidden lg:block lg:col-span-4 lg:order-2 space-y-4">
            {[
              {
                step: 1,
                title: step1Title,
                comp: CarSelectionStep,
                desc: productEntry.isLocked
                  ? "Dywaniki dopasowane do wybranego modelu z katalogu"
                  : "Dopasujemy dywaniki idealnie do Twojego modelu",
              },
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
                isValid={isStepValidDesktop(step)}
              >
                {Comp ? (
                  step === 6 ? (
                    <AccessoriesStep
                      config={config}
                      onUpdate={updateConfig}
                      onNext={goToNextStep}
                      onPrevious={goToPreviousStep}
                      onProductModalOpenChange={setIsProductModalOpen}
                    />
                  ) : step === 1 ? (
                    <>
                      {productEntry.isLocked ? (
                        <LockedCarContextStep
                          config={config}
                          productEntry={productEntry}
                          onUpdate={applyConfigUpdate}
                          onNext={goToNextStep}
                        />
                      ) : (
                        <Comp
                          config={config}
                          priceBreakdown={priceBreakdown}
                          onUpdate={updateConfig}
                          onNext={goToNextStep}
                          onPrevious={goToPreviousStep}
                          onAddToCart={handleAddToCart}
                          isAddingToCart={isAddingToCart || cartLoading}
                        />
                      )}
                    </>
                  ) : step === 2 ? (
                    <MatTypeStep
                      config={{ matType: config.matType }}
                      skipMatTypeStep={skipMatTypeStep}
                      onUpdate={updateConfig}
                      onNext={goToNextStep}
                      onPrevious={goToPreviousStep}
                    />
                  ) : step === 3 ? (
                    <VariantStep
                      config={{ variant: config.variant || "" }}
                      pricingVariants={pricingVariants}
                      pricingCategoryKey={config.pricingCategoryKey}
                      bodyTypeKey={config.bodyTypeKey}
                      priceBreakdown={priceBreakdown}
                      onUpdate={updateConfig}
                      onNext={goToNextStep}
                      onPrevious={goToPreviousStep}
                    />
                  ) : (
                    <Comp
                      config={config}
                      priceBreakdown={priceBreakdown}
                      onUpdate={updateConfig}
                      onNext={goToNextStep}
                      onPrevious={goToPreviousStep}
                      onAddToCart={handleAddToCart}
                      isAddingToCart={isAddingToCart || cartLoading}
                    />
                  )
                ) : null}
              </StepAccordion>
            ))}
          </div>

          {/* Left Column - Podgląd + Cena - Desktop only (order-1 = na lewo, col-span-3) */}
          <div className="hidden lg:block lg:col-span-3 lg:order-1 space-y-4 mt-8 lg:mt-0">
            <div className="lg:sticky lg:top-28 flex flex-col gap-4">
              
              {/* Desktop Price & CTA Card - zawsze na górze */}
              <div className="order-1 bg-[#111] backdrop-blur-sm border border-white/5 rounded-xl p-4 shadow-xl">
                <div className="flex flex-col gap-3">
                  {/* Step Indicator - Moved from top bar */}
                  <div className="flex items-center justify-between text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <span>Konfiguracja</span>
                    <span>Krok {activeStep} z {TOTAL_STEPS_DESKTOP}</span>
                  </div>
                  
                  {/* Progress Line */}
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-600 transition-all duration-500 ease-out"
                      style={{ width: `${(activeStep / TOTAL_STEPS_DESKTOP) * 100}%` }}
                    />
                  </div>

                  {/* Price Section */}
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Cena zestawu</p>
                      {config.variant ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-baseline gap-2">
                            {priceBreakdown.discount > 0 && (
                              <span className="text-lg text-gray-400 line-through font-medium">
                                {formatPricePln(priceBreakdown.basePrice)}
                              </span>
                            )}
                            <span className="text-2xl font-bold text-white">
                              {formatPricePln(totalPriceWithAccessories)}
                            </span>
                          </div>
                          {priceBreakdown.discount > 0 && (
                            <span className="text-sm text-green-400 bg-green-400/10 px-2 py-0.5 rounded w-fit">
                              Rabat {Math.round((priceBreakdown.discount / priceBreakdown.basePrice) * 100)}%: -{formatPriceValue(priceBreakdown.discount)} zł
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400">
                          Wybierz wariant
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || !isStepValidDesktop(7)}
                    className="w-full min-h-[48px] text-base bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold shadow-lg shadow-red-900/20 hover:shadow-red-900/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAddingToCart ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Dodawanie...</span>
                      </div>
                    ) : !isStepValidDesktop(7) ? (
                      <span>Dokończ konfigurację</span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <ShoppingCart className="w-5 h-5" />
                        Dodaj do koszyka
                      </span>
                    )}
                  </Button>
                  
                  {/* Additional Info */}
                  <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Wysyłka 24h
                    </span>
                  </div>
                </div>
              </div>

              {activeStep === 1 && (
                <div className="order-2">{step1PreviewCarouselDesktop}</div>
              )}

              {canShowDynamicPreview && (
              <div className="order-2 space-y-3">
                <ConfiguratorPreviewFrame
                  imageSrc={desktopSidebarPreview.src}
                  alt={
                    desktopSidebarPreview.modalType === "product"
                      ? "Podgląd zestawu"
                      : "Podgląd konfiguracji"
                  }
                  imageKey={desktopSidebarPreview.imageKey}
                  imageFit={
                    desktopSidebarPreview.modalType === "product" ? "contain" : "cover"
                  }
                  priority
                  onOpen={() => {
                    setModalImageType(desktopSidebarPreview.modalType)
                    setIsPreviewModalOpen(true)
                  }}
                  onZoomClick={() => {
                    setModalImageType(desktopSidebarPreview.modalType)
                    setIsPreviewModalOpen(true)
                  }}
                  overlayFooter={
                    desktopSidebarPreview.modalType === "dynamic" &&
                    showConfiguredDynamicPreview ? (
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-black/70 backdrop-blur-md border border-white/10 rounded-lg p-3 flex items-center justify-between gap-4 shadow-lg transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full border border-white/20 shadow-inner"
                              style={{ backgroundColor: getColorInfo(config.color).color }}
                            />
                            <span className="text-xs font-medium text-white">
                              {getColorInfo(config.color).name}
                            </span>
                          </div>
                          <div className="h-3 w-px bg-white/20" />
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full border border-white/20 shadow-inner"
                              style={{ backgroundColor: getColorInfo(config.edgeColor).color }}
                            />
                            <span className="text-xs font-medium text-white">
                              {getColorInfo(config.edgeColor).name}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : null
                  }
                />

                {showProductSetGallery && productPreviewPath && (
                  <DesktopSidebarPreviewControls
                    activeTab={activePreviewTab}
                    dynamicThumbnail={dynamicPreviewPath}
                    productImages={productSetGalleryImages}
                    selectedProductImage={productPreviewPath}
                    onSelectDynamic={handleSelectDynamicPreview}
                    onSelectProduct={handleSelectProductSetImage}
                    galleryTitle={
                      config.matType === "classic"
                        ? "Galeria zestawu Classic"
                        : "Galeria zestawu 3D z rantami"
                    }
                  />
                )}
              </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Desktop Sticky Bottom Bar with Price and CTA */}
      {/* Pokazuje się dopiero po przejściu do sekcji "Typ dywaników" (krok 2) */}
      {/* UKRYTE - Przeniesione do sidebara na desktopie */}
      {false && (activeStep >= 2 && !shouldHideDesktopBars && activeStep !== 7) && (
        <div className="hidden lg:block fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-t border-white/10 shadow-2xl lg:scale-[0.8] lg:origin-bottom lg:w-[125%] lg:left-1/2 lg:-translate-x-1/2">
          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between gap-6">
              {/* Price Section - tylko gdy wybrano wariant zestawu */}
              {config.variant ? (
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-3">
                    <span className="text-sm text-gray-400">Cena:</span>
                    <span className="text-2xl font-bold text-white">
                      {formatPricePln(totalPriceWithAccessories)}
                    </span>
                  </div>
                  {priceBreakdown.discount > 0 && (
                    <div className="text-sm text-green-400 mt-1">
                      Rabat: -{formatPriceValue(priceBreakdown.discount)} zł
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-400">
                    Wybierz zestaw aby zobaczyć cenę
                  </div>
                </div>
              )}

              {/* CTA Button */}
              <Button
                onClick={handleAddToCart}
                disabled={isAddingToCart || !isStepValidDesktop(7)}
                className="min-h-[48px] min-w-[180px] bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold shadow-lg shadow-red-900/30 hover:shadow-red-900/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingToCart ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Dodawanie...</span>
                  </div>
                ) : !isStepValidDesktop(7) ? (
                  <span>Kontynuuj konfigurację</span>
                ) : (
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Dodaj do koszyka
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Bar with Price and CTA */}
      {shouldShowStickyPreview && !isCartOpen && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-xl border-t border-white/10 pb-safe shadow-2xl">
          {/* Mini Progress Indicator */}
          <div className="h-1 bg-white/5">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-300 ease-out"
              style={{ width: `${(activeStep / TOTAL_STEPS_MOBILE) * 100}%` }}
            />
          </div>

          {/* Main Content */}
          <div className="px-3 py-2.5">
            <div className="flex items-center gap-2">
              {isPreviewCollapsed && (
                <button
                  type="button"
                  onClick={() => handleOpenPreviewModal(activePreviewTab)}
                  className="relative w-11 h-11 rounded-lg overflow-hidden border border-red-500/30 flex-shrink-0 active:scale-95"
                  aria-label="Otwórz podgląd produktu"
                >
                  <Image
                    src={stickyHeaderImage}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="44px"
                  />
                </button>
              )}
              {/* Price Section - tylko gdy wybrano wariant zestawu */}
              {config.variant ? (
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="flex items-baseline gap-1.5 min-w-0">
                    <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">Cena:</span>
                    {priceBreakdown.discount > 0 && (
                      <span className="text-sm text-gray-400 line-through flex-shrink-0">
                        {formatPricePln(priceBreakdown.basePrice)}
                      </span>
                    )}
                    <span className="text-lg font-bold text-white truncate">
                      {formatPricePln(totalPriceWithAccessories)}
                    </span>
                  </div>
                  {priceBreakdown.discount > 0 && (
                    <div className="text-xs text-green-400 mt-0.5 truncate">
                      Rabat {Math.round((priceBreakdown.discount / priceBreakdown.basePrice) * 100)}%: -{formatPriceValue(priceBreakdown.discount)} zł
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-400 truncate">
                    Wybierz zestaw aby zobaczyć cenę
                  </div>
                </div>
              )}

              {/* Mini Progress Dots */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {Array.from({ length: TOTAL_STEPS_MOBILE }, (_, i) => {
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
                disabled={isAddingToCart || (!isStepValidDesktop(7) && !isStepValidMobile(5))}
                className="min-h-[44px] min-w-[120px] max-w-[140px] flex-shrink-0 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold shadow-lg shadow-red-900/30 hover:shadow-red-900/50 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
              >
                {isAddingToCart ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="text-sm">Dodawanie...</span>
                  </div>
                ) : (!isStepValidDesktop(7) && !isStepValidMobile(5)) ? (
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
          onClick={() => {
            setIsPreviewModalOpen(false);
            setStep1GalleryModalUrl(null);
          }}
        >
          <button 
            className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors z-50"
            onClick={() => {
              setIsPreviewModalOpen(false);
              setStep1GalleryModalUrl(null);
            }}
          >
            <span className="sr-only">Zamknij</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          
          <div className="relative w-full h-full flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Main Image Area */}
            <div className="flex-1 relative w-full">
              <Image
                src={
                  step1GalleryModalUrl
                    ? step1GalleryModalUrl
                    : modalImageType === 'dynamic' && canShowDynamicPreview
                    ? dynamicPreviewPath 
                    : modalImageType === 'mat-product' &&
                      showStep1MatProductPreview &&
                      matProductImage
                    ? matProductImage
                    : (productPreviewPath || '')
                }
                alt="Pełny podgląd"
                fill
                className="object-contain p-4 md:p-12"
                quality={100}
                priority
              />
            </div>

            {/* Modal Navigation - Gallery & View Switcher */}
            <div className="flex justify-center px-4 pb-8 pt-4">
              <div className="flex gap-2 p-2 bg-[#111]/90 backdrop-blur-md rounded-2xl border border-white/10 overflow-x-auto max-w-full scrollbar-hide shadow-2xl">
                
                {/* Wizualizacja dynamiczna — od kroku 2 po wyborze typu */}
                {showConfiguredDynamicPreview && (
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
                     <div className="absolute inset-0 bg-white/5" />
                     <Image src={dynamicPreviewPath} alt="Wizualizacja" fill className="object-contain p-1" />
                     {modalImageType === 'dynamic' && <div className="absolute inset-0 bg-red-500/10" />}
                   </button>
                )}

                {/* Separator jeśli mamy obie opcje */}
                {showConfiguredDynamicPreview && <div className="w-px bg-white/10 mx-1 self-center h-8" />}

                {/* Opcja: Zdjęcie produktu z bazy danych (jeśli dostępne) */}
                {showStep1MatProductPreview && matProductImage && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalImageType('mat-product');
                    }}
                    className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all duration-300 ${
                      modalImageType === 'mat-product'
                        ? 'border-red-500 scale-105 shadow-lg shadow-red-500/20 ring-1 ring-red-500/50'
                        : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/30'
                    }`}
                  >
                    <Image src={matProductImage} alt="Zdjęcie produktu" fill className="object-cover" />
                  </button>
                )}

                {showStep1MatProductPreview && matProductImage && (
                  <div className="w-px bg-white/10 mx-1 self-center h-8" />
                )}

                {/* Galeria zestawu — tylko od kroku 2 po wyborze typu */}
                {canShowProductSetGallery &&
                  productSetGalleryImages.map((imagePath) => (
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
