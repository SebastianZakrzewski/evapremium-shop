"use client";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { getAvailableColors, getColorInfo, getAvailableMaterialColorsForEdge } from "@/lib/color-mapping";
import { getMatImagePath } from "@/lib/image-mapping";
import { useCart } from "@/hooks/useCart.new";
import { ConfiguratorService } from "@/lib/services/ConfiguratorService";
import { PricingService } from "@/lib/services/PricingService";
import { MatService } from "@/lib/services/MatService";
import { ConfigurationData } from "@/lib/types/product";
import { debugLog } from "@/lib/config/features";
import { useTracking, createViewContentData, createAddToCartData } from "@/lib/tracking";
import { getModelsByBrand } from "@/data/carouselData";
import { Brand, Model } from "@/types/carousel";
import { getYearsForModel, getModelData, findGenerationByYear, getAvailableModels, getBodyTypesForYear, getBodyTypesForModel } from "@/data/car-model-years.utils";

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

// Kolory będą generowane dynamicznie na podstawie wybranej struktury komórek

// Struktura cenowa - sztywne ceny za komplety + rabaty
const PRICING = {
  basePrice: {
    'classic': { front: 290, basic: 510, premium: 710, complete: 350, test: 0.05 },
    '3d-with-rims': { front: 550, basic: 910, premium: 1210, complete: 350, test: 0.05 }
  },
  // Rabat zależny od wartości: -30% dla ≥910 zł, -20% dla <910 zł, 0% dla test
  getDiscount: (basePrice: number) => {
    if (basePrice <= 0.05) return 0; // Brak rabatu dla testu
    return basePrice >= 910 ? 0.30 : 0.20;
  },
  shipping: {
    cost: 27,
    freeForVariants: ['basic', 'premium', 'complete', 'test'] as const  // Darmowa dla basic, premium, complete i test
  }
};

const setTypes: SetType[] = [
  { id: "3d-with-rims", name: "3D z rantami", description: "Dywaniki 3D z wysokimi rantami", priceModifier: 0 },
  { id: "classic", name: "3D bez rantów", description: "Dywaniki standardowe", priceModifier: 0 },
];

const cellTypes: CellType[] = [
  { id: "diamonds", name: "Romby", description: "Struktura rombowa", priceModifier: 0 },
  { id: "honey", name: "Plaster miodu", description: "Struktura plastra miodu", priceModifier: 0 },
];

const setVariants: SetVariant[] = [
  { id: "front", name: "Starter", description: "2 dywaniki (tylko przód)", priceModifier: 0 },
  { id: "basic", name: "Podstawowy", description: "5 dywaników (przód + tył + ochrona na tunel środkowy)", priceModifier: 0 },
  { id: "premium", name: "Premium", description: "5 dywaników (przód + tył + bagażnik)", priceModifier: 0 },
  { id: "complete", name: "Mata do Bagażnika", description: "1 dywanik - Mata do Bagażnika", priceModifier: 0 },
  { id: "test", name: "TEST - 5 groszy", description: "Testowy produkt do integracji pixela (0.05 PLN)", priceModifier: 0 },
];

const bodyTypes = [
  { id: "sedan", name: "Sedan", description: "4-drzwiowy sedan", icon: "🚗" },
  { id: "suv", name: "SUV", description: "Sport Utility Vehicle", icon: "🚙" },
  { id: "hatchback", name: "Hatchback", description: "3-drzwiowy lub 5-drzwiowy", icon: "🚗" },
  { id: "coupe", name: "Coupe", description: "2-drzwiowy sportowy", icon: "🏎️" },
  { id: "convertible", name: "Kabriolet", description: "Z otwieranym dachem", icon: "🚗" },
  { id: "wagon", name: "Kombi", description: "5-drzwiowy kombi", icon: "🚐" },
  { id: "pickup", name: "Pickup", description: "Samochód dostawczy", icon: "🚛" },
  { id: "van", name: "Van", description: "Van/minibus", icon: "🚐" },
  { id: "crossover", name: "Crossover", description: "Mieszanka SUV i hatchback", icon: "🚙" },
  { id: "other", name: "Inne", description: "Inny typ nadwozia", icon: "🚗" }
];


export default function Configurator() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const brandParam = searchParams.get('brand');
  const { addToCart, isLoading: cartLoading, error: cartError } = useCart();
  const { trackViewContent, trackAddToCart, createViewContentData: createViewContent, createAddToCartData: createAddToCart } = useTracking();
  const matService = new MatService();
  
  // Stan dla marek pobieranych z API
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  
  // Pobierz marki z API
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setBrandsLoading(true);
        const response = await fetch('/api/car-brands');
        if (response.ok) {
          const data = await response.json();
          setBrands(data);
        } else {
          console.error('Failed to fetch brands');
        }
      } catch (error) {
        console.error('Error fetching brands:', error);
      } finally {
        setBrandsLoading(false);
      }
    };

    fetchBrands();
  }, []);
  
  const [currentSection, setCurrentSection] = useState<number>(0);
  // Mapowanie nazw marek z carousel na nazwy w bazie danych
  const getBrandNameForAPI = (brandParam: string | null) => {
    if (!brandParam) return "";
    
    const brandMappings: Record<string, string> = {
      "mercedes": "Mercedes-Benz",
      "bmw": "Bmw", 
      "audi": "Audi",
      "tesla": "Tesla",
      "porsche": "Porsche",
      "volkswagen": "Volkswagen",
      "ford": "Ford",
      "opel": "Opel",
      "peugeot": "Peugeot",
      "renault": "Renault",
      "fiat": "Fiat",
      "alfa romeo": "Alfa romeo",
      "aston martin": "Aston martin",
      "acura": "Acura",
      "bentley": "Bentley",
      "ferrari": "Ferrari",
      "lamborghini": "Lamborghini",
      "mclaren": "McLaren",
      "maserati": "Maserati",
      "rolls-royce": "Rolls-Royce",
      "lexus": "Lexus",
      "infiniti": "Infiniti",
      "cadillac": "Cadillac",
      "lincoln": "Lincoln",
      "jaguar": "Jaguar",
      "land rover": "Land rover",
      "mini": "Mini",
      "smart": "Smart"
    };
    
    return brandMappings[brandParam.toLowerCase()] || brandParam.charAt(0).toUpperCase() + brandParam.slice(1);
  };

  const [selectedCarBrand, setSelectedCarBrand] = useState<string>(getBrandNameForAPI(brandParam));
  
  // Aktualizuj selectedCarBrand gdy brandParam się zmieni
  useEffect(() => {
    if (brandParam) {
      const newBrand = getBrandNameForAPI(brandParam);
      setSelectedCarBrand(newBrand);
      console.log('Aktualizacja marki:', brandParam, '->', newBrand);
    }
  }, [brandParam]);
  
  // Resetuj modele gdy marka się zmieni
  useEffect(() => {
    if (selectedCarBrand) {
      setAvailableModels([]);
      setSelectedCarModel("");
      setSelectedCarYear("");
      setSelectedBodyType("");
    }
  }, [selectedCarBrand]);
  
  const [selectedCarModel, setSelectedCarModel] = useState<string>("");
  const [selectedGeneration, setSelectedGeneration] = useState<string>("");
  const [selectedCarYear, setSelectedCarYear] = useState<string>("");
  const [selectedBodyType, setSelectedBodyType] = useState<string>("");
  const [selectedMat, setSelectedMat] = useState<string>("black");
  const [selectedEdge, setSelectedEdge] = useState<string>("black");
  const [selectedHeelPad, setSelectedHeelPad] = useState<string>("brak");
  const [selectedSetType, setSelectedSetType] = useState<string>(setTypes[0].id);
  const [selectedCellType, setSelectedCellType] = useState<string>(cellTypes[0].id);
  const [selectedSetVariant, setSelectedSetVariant] = useState<string>(setVariants[0].id);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isVisualizationExpanded, setIsVisualizationExpanded] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Nowe stany dla danych z Supabase
  const [availableBrands, setAvailableBrands] = useState<any[]>([]);
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [availableYears, setAvailableYears] = useState<any[]>([]);
  const [availableBodyTypes, setAvailableBodyTypes] = useState<any[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingYears, setLoadingYears] = useState(false);
  const [loadingBodyTypes, setLoadingBodyTypes] = useState(false);
  const [baseMatPrice, setBaseMatPrice] = useState<number>(0);
  const [isPriceLoading, setIsPriceLoading] = useState(false);

  // Funkcja do obliczania ceny dla konkretnego wariantu (do wyświetlania w UI)
  const getVariantPrice = useCallback((
    setType: string,
    setVariant: string
  ): number => {
    const basePrice = PRICING.basePrice[setType as keyof typeof PRICING.basePrice]?.[setVariant as 'front' | 'basic' | 'premium' | 'complete' | 'test'] || 0;
    const discount = PRICING.getDiscount(basePrice);
    const priceAfterDiscount = basePrice * (1 - discount);
    const shippingCost = PRICING.shipping.freeForVariants.includes(setVariant as any) ? 0 : PRICING.shipping.cost;
    return setVariant === 'test' ? priceAfterDiscount : Math.round(priceAfterDiscount + shippingCost);
  }, []);

  // Funkcja do obliczania ceny bazowej bez wysyłki (do wyświetlania w sekcji wyboru zestawu)
  const getVariantBasePrice = useCallback((
    setType: string,
    setVariant: string
  ): number => {
    const basePrice = PRICING.basePrice[setType as keyof typeof PRICING.basePrice]?.[setVariant as 'front' | 'basic' | 'premium' | 'complete' | 'test'] || 0;
    const discount = PRICING.getDiscount(basePrice);
    const priceAfterDiscount = basePrice * (1 - discount);
    return setVariant === 'test' ? priceAfterDiscount : Math.round(priceAfterDiscount);
  }, []);

  // Funkcja do pobierania opisu ilości dywaników na podstawie wariantu zestawu
  const getVariantMatsDescription = useCallback((variantId: string): string => {
    const descriptions: Record<string, string> = {
      'front': 'przód',
      'basic': 'przód + tył',
      'premium': 'przód + tył + bagażnik',
      'complete': 'mata do bagażnika',
      'test': 'testowy produkt'
    };
    return descriptions[variantId] || variantId;
  }, []);

  // Funkcje do obliczania składowych ceny
  const priceBreakdown = useMemo(() => {
    if (!selectedSetType || !selectedSetVariant) return { basePrice: 0, discount: 0, priceAfterDiscount: 0, shippingCost: 0, totalPrice: 0 };
    
    const basePrice = PRICING.basePrice[selectedSetType as keyof typeof PRICING.basePrice]?.[selectedSetVariant as 'front' | 'basic' | 'premium' | 'complete' | 'test'] || 0;
    const discount = PRICING.getDiscount(basePrice);
    const discountAmount = basePrice * discount;
    const priceAfterDiscount = basePrice - discountAmount;
    const shippingCost = PRICING.shipping.freeForVariants.includes(selectedSetVariant as any) ? 0 : PRICING.shipping.cost;
    const totalPrice = selectedSetVariant === 'test' ? priceAfterDiscount : Math.round(priceAfterDiscount + shippingCost);
    
    return {
      basePrice: selectedSetVariant === 'test' ? basePrice : Math.round(basePrice),
      discount: selectedSetVariant === 'test' ? discountAmount : Math.round(discountAmount),
      priceAfterDiscount: selectedSetVariant === 'test' ? priceAfterDiscount : Math.round(priceAfterDiscount),
      shippingCost,
      totalPrice
    };
  }, [selectedSetType, selectedSetVariant]);

  // Debug: wyświetl informacje o wybranej marce
  useEffect(() => {
    console.log('Konfigurator - brandParam:', brandParam);
    console.log('Konfigurator - selectedCarBrand:', selectedCarBrand);
    console.log('Konfigurator - availableModels:', availableModels.length);
  }, [brandParam, selectedCarBrand]);

  // Oblicz datę dostawy (2 tygodnie od dzisiaj)
  const deliveryDate = useMemo(() => {
    const today = new Date();
    const delivery = new Date(today);
    delivery.setDate(today.getDate() + 14); // +2 tygodnie
    
    return delivery.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  const totalSections = 7;

  // Pobierz modele z nowych danych JSON
  useEffect(() => {
    const loadModels = () => {
      if (!selectedCarBrand) {
        console.log('Brak wybranej marki, czyszczę modele');
        setAvailableModels([]);
        return;
      }

      console.log('Ładowanie modeli dla marki:', selectedCarBrand);
      setLoadingModels(true);
      
      try {
        // Użyj nowych funkcji pomocniczych
        const modelNames = getAvailableModels(selectedCarBrand);
        console.log('Dostępne modele:', modelNames);
        
        // Konwertuj do formatu oczekiwanego przez komponent
        const models = modelNames.map(modelName => ({
          id: modelName,
          name: modelName
        }));
        
        console.log('Przetworzone modele:', models);
        setAvailableModels(models);
        
      } catch (error) {
        console.error('Błąd podczas ładowania modeli:', error);
        setAvailableModels([]);
      } finally {
        setLoadingModels(false);
      }
    };

    loadModels();
  }, [selectedCarBrand]);

  // Pobierz roczniki z nowych danych JSON
  useEffect(() => {
    const loadModelYears = () => {
      if (!selectedCarBrand || !selectedCarModel) {
        setAvailableYears([]);
        setAvailableBodyTypes([]);
        return;
      }

      setLoadingYears(true);
      setLoadingBodyTypes(true);
      
      try {
        // Użyj nowych funkcji pomocniczych
        const availableYears = getYearsForModel(selectedCarBrand, selectedCarModel);
        const modelData = getModelData(selectedCarBrand, selectedCarModel);
        
        console.log('Dostępne roczniki dla', selectedCarBrand, selectedCarModel, ':', availableYears);
        
        // Konwertuj roczniki do formatu oczekiwanego przez komponent
        const yearsData = availableYears
          .sort((a, b) => b - a) // Sortuj malejąco (najnowsze pierwsze)
          .map(year => ({
            id: year.toString(),
            name: year.toString()
          }));
        
        setAvailableYears(yearsData);
        
        // Pobierz rzeczywiste typy nadwozia dla modelu
        const allBodyTypes = getBodyTypesForModel(selectedCarBrand, selectedCarModel);
        
        if (allBodyTypes.length > 0) {
          // Konwertuj typy nadwozia do formatu komponentu
          const bodyTypesData = allBodyTypes.map(type => ({
            id: type.toLowerCase().replace(/\s+/g, '-'),
            name: type
          }));
          
          setAvailableBodyTypes(bodyTypesData);
          console.log('Dostępne typy nadwozia:', allBodyTypes);
        } else {
          // Fallback: domyślne typy jeśli brak danych
          const defaultBodyTypes = [
            { id: 'sedan', name: 'Sedan' },
            { id: 'hatchback', name: 'Hatchback' },
            { id: 'suv', name: 'SUV' },
            { id: 'kombi', name: 'Kombi' },
            { id: 'coupe', name: 'Coupe' }
          ];
          setAvailableBodyTypes(defaultBodyTypes);
          console.log('Używam domyślnych typów nadwozia (brak danych)');
        }
        
        console.log('Załadowano roczniki:', yearsData.length, 'lat');
        
      } catch (error) {
        console.error('Błąd podczas ładowania roczników:', error);
        setAvailableYears([]);
        setAvailableBodyTypes([]);
      } finally {
        setLoadingYears(false);
        setLoadingBodyTypes(false);
      }
    };

    loadModelYears();
  }, [selectedCarBrand, selectedCarModel]);

  // Resetuj rocznik i typ nadwozia przy zmianie modelu
  useEffect(() => {
    setSelectedCarYear("");
    setSelectedBodyType("");
  }, [selectedCarModel]);

  // Pobierz dostępne dywaniki z bazy danych i oblicz cenę bazową
  useEffect(() => {
    const loadMats = async () => {
      if (!selectedCarBrand || !selectedCarModel || !selectedCarYear) {
        debugLog('Brak podstawowych danych samochodu, nie pobieram dywaników');
        setBaseMatPrice(0);
        return;
      }

      setIsPriceLoading(true);
      
      try {
        debugLog('Pobieranie dywaników dla:', {
          brand: selectedCarBrand,
          model: selectedCarModel,
          year: selectedCarYear,
          bodyType: selectedBodyType || 'wszystkie'
        });

        // Próbuj znaleźć dywanik dla konkretnej kombinacji (jeśli wybrano typ nadwozia)
        let availableMat = null;
        
        if (selectedBodyType) {
          // Jeśli wybrano typ nadwozia, spróbuj znaleźć dla konkretnej kombinacji
          try {
            availableMat = await matService.findMatForCar({
              brandSlug: selectedCarBrand.toLowerCase().replace(/\s+/g, '-'),
              modelSlug: selectedCarModel.toLowerCase().replace(/\s+/g, '-'),
              generation: selectedCarYear,
              bodyType: selectedBodyType
            });
            debugLog('Wynik wyszukiwania dla konkretnej kombinacji:', availableMat ? 'ZNALEZIONO' : 'NIE ZNALEZIONO');
          } catch (error) {
            debugLog('Błąd wyszukiwania dla konkretnej kombinacji:', error instanceof Error ? error.message : String(error));
          }
        }

        // Zawsze oblicz cenę - czy znaleziono konkretny dywanik czy nie
        const matConfiguration = {
          setType: selectedSetVariant || 'basic',
          cellType: selectedCellType || 'diamonds',
          hasHeelPad: selectedHeelPad === 'yes'
        };

        let basePrice;
        if (availableMat && availableMat.basePrice) {
          // Użyj ceny z bazy danych jeśli znaleziono konkretny dywanik
          basePrice = availableMat.basePrice;
          debugLog('💰 Używam ceny z bazy danych:', basePrice);
        } else {
          // Użyj domyślnej ceny bazowej z nowego systemu
          basePrice = PRICING.basePrice[selectedSetType as keyof typeof PRICING.basePrice]?.[selectedSetVariant as 'front' | 'basic' | 'premium' | 'complete' | 'test'] || (selectedSetVariant === 'test' ? 0.05 : 300);
          debugLog('💰 Używam domyślnej ceny bazowej:', basePrice);
        }

        // Dla wariantu testowego zwróć bezpośrednio cenę 0.05 PLN bez modyfikacji
        if (selectedSetVariant === 'test') {
          setBaseMatPrice(0.05);
          debugLog('💰 Wariant testowy - ustawiam cenę 0.05 PLN');
          return;
        }

        const calculatedPrice = PricingService.calculateMatPrice(basePrice, matConfiguration);
        console.log('💰 Configurator useEffect - calculateMatPrice:', {
          basePrice,
          matConfiguration,
          calculatedPrice,
          selectedSetVariant
        });
        setBaseMatPrice(calculatedPrice);
        debugLog('💰 Obliczona cena końcowa:', calculatedPrice);

      } catch (error) {
        console.error('❌ Błąd podczas pobierania dywaników:', error);
        // W przypadku błędu, użyj domyślnej ceny z nowego systemu
        const basePrice = PRICING.basePrice[selectedSetType as keyof typeof PRICING.basePrice]?.[selectedSetVariant as 'front' | 'basic' | 'premium' | 'complete' | 'test'] || (selectedSetVariant === 'test' ? 0.05 : 300);
        setBaseMatPrice(basePrice);
        debugLog('💰 Używam domyślnej ceny po błędzie:', basePrice);
      } finally {
        setIsPriceLoading(false);
      }
    };

    loadMats();
  }, [selectedCarBrand, selectedCarModel, selectedCarYear, selectedBodyType, selectedSetType, selectedCellType, selectedHeelPad]);

  // Aktualizuj typy nadwozia po wybraniu rocznika
  useEffect(() => {
    if (selectedCarBrand && selectedCarModel && selectedCarYear) {
      const year = parseInt(selectedCarYear);
      const bodyTypesForYear = getBodyTypesForYear(selectedCarBrand, selectedCarModel, year);
      
      if (bodyTypesForYear.length > 0) {
        // Konwertuj typy nadwozia do formatu komponentu
        const bodyTypesData = bodyTypesForYear.map(type => ({
          id: type.toLowerCase().replace(/\s+/g, '-'),
          name: type
        }));
        
        setAvailableBodyTypes(bodyTypesData);
        console.log(`Typy nadwozia dla ${selectedCarBrand} ${selectedCarModel} ${year}:`, bodyTypesForYear);
        
        // Resetuj wybrany typ nadwozia jeśli nie jest dostępny
        if (selectedBodyType && !bodyTypesForYear.some(type => 
          type.toLowerCase().replace(/\s+/g, '-') === selectedBodyType
        )) {
          setSelectedBodyType("");
        }
      } else {
        // Fallback: użyj wszystkich typów dla modelu
        const allBodyTypes = getBodyTypesForModel(selectedCarBrand, selectedCarModel);
        if (allBodyTypes.length > 0) {
          const bodyTypesData = allBodyTypes.map(type => ({
            id: type.toLowerCase().replace(/\s+/g, '-'),
            name: type
          }));
          setAvailableBodyTypes(bodyTypesData);
          console.log(`Używam wszystkich typów nadwozia dla ${selectedCarBrand} ${selectedCarModel}`);
        }
      }
    }
  }, [selectedCarBrand, selectedCarModel, selectedCarYear, selectedBodyType]);

  const nextSection = () => {
    if (currentSection < totalSections - 1) {
      setCurrentSection(currentSection + 1);
      // Auto-scroll do góry sekcji na mobile
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        setTimeout(() => {
          const configPanel = document.querySelector('[data-config-panel]');
          if (configPanel) {
            configPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      // Auto-scroll do góry sekcji na mobile
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        setTimeout(() => {
          const configPanel = document.querySelector('[data-config-panel]');
          if (configPanel) {
            configPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    }
  };

  // Swipe gesture handlers
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentSection < totalSections - 1) {
      nextSection();
    }
    if (isRightSwipe && currentSection > 0) {
      prevSection();
    }
  };

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    
    try {
      // Walidacja podstawowych danych samochodu
      if (!selectedCarBrand || !selectedCarModel || !selectedCarYear) {
        console.error('❌ Brak podstawowych danych samochodu');
        alert('Proszę wybrać markę, model i rocznik');
        return;
      }

      // Sprawdź czy cena bazowa jest dostępna (teraz zawsze powinna być dostępna)
      if (baseMatPrice === 0) {
        console.warn('⚠️ Używam domyślnej ceny');
        // Użyj domyślnej ceny zamiast blokować
        const defaultPrice = PRICING.basePrice[selectedSetType as keyof typeof PRICING.basePrice]?.[selectedSetVariant as 'front' | 'basic' | 'premium' | 'complete' | 'test'] || (selectedSetVariant === 'test' ? 0.05 : 300);
        setBaseMatPrice(defaultPrice);
      }

      const configData: ConfigurationData = {
        setType: selectedSetType,
        cellType: selectedCellType,
        setVariant: selectedSetVariant,
        materialColor: selectedMat,
        edgeColor: selectedEdge,
        heelPad: selectedHeelPad,
        carDetails: {
          brand: selectedCarBrand,
          model: selectedCarModel,
          year: selectedCarYear,
          bodyType: selectedBodyType || 'universal'
        }
      };

      // Oblicz cenę końcową używając nowego systemu cenowego
      const finalPrice = price;
      
      console.log('💰 Configurator handleAddToCart - Ceny:', {
        selectedSetVariant,
        basePrice: PRICING.basePrice[selectedSetType as keyof typeof PRICING.basePrice]?.[selectedSetVariant as 'front' | 'basic' | 'premium' | 'complete' | 'test'],
        price,
        finalPrice,
        baseMatPrice
      });
      
      // Generuj unikalny UUID dla produktu
      const productId = crypto.randomUUID();
      console.log('🆔 Configurator: Generated UUID productId:', productId);
      
      // Generuj ścieżkę do obrazu
      const matImagePath = getMatImagePath(
        getMatTypeForImage(selectedSetType),
        selectedCellType as 'diamonds' | 'honey',
        selectedMat,
        selectedEdge
      );
      
      const result = await addToCart({
        productType: 'mat',
        productId: productId,
        quantity: 1,
        configuration: configData,
        productName: `Dywaniki EVA Premium - ${selectedCarBrand} ${selectedCarModel}`,
        productSku: `EVA-${selectedSetType}-${selectedCellType}-${selectedMat}-${selectedEdge}`,
        productImage: matImagePath,
        unitPrice: finalPrice
      });

      console.log('✅ Produkt dodany do koszyka:', productId);
      
      // Track AddToCart event
      try {
        const cartItem = {
          id: productId,
          quantity: 1,
          unitPrice: finalPrice,
          subtotal: finalPrice,
          productType: 'mat' as const,
          productId: productId,
          productName: `Dywaniki EVA Premium - ${selectedCarBrand} ${selectedCarModel}`,
          productSku: `EVA-${selectedSetType}-${selectedCellType}-${selectedMat}-${selectedEdge}`,
          productImage: matImagePath,
          configuration: configData
        };
        
        const addToCartData = createAddToCart(cartItem, finalPrice);
        trackAddToCart(addToCartData);
      } catch (error) {
        console.error('[Tracking] Error tracking AddToCart:', error);
      }
      
      // Otwórz modal koszyka po dodaniu produktu
      setTimeout(() => {
        openCartModal();
      }, 500);
      
      // Pokaż powiadomienie o dodaniu do koszyka
      if (typeof window !== 'undefined') {
        // Proste powiadomienie toast (można zastąpić lepszym komponentem)
        const notification = document.createElement('div');
        notification.className = 'fixed top-20 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
        notification.textContent = '✅ Produkt dodany do koszyka!';
        document.body.appendChild(notification);
        
        setTimeout(() => {
          notification.style.opacity = '0';
          setTimeout(() => notification.remove(), 300);
        }, 2000);
      }
      
    } catch (error) {
      console.error('❌ Błąd podczas dodawania do koszyka:', error);
      
      // Wyświetl komunikat o błędzie
      if (typeof window !== 'undefined') {
        const errorNotification = document.createElement('div');
        errorNotification.className = 'fixed top-20 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
        errorNotification.textContent = '❌ Błąd podczas dodawania do koszyka. Spróbuj ponownie.';
        document.body.appendChild(errorNotification);
        
        setTimeout(() => {
          errorNotification.style.opacity = '0';
          setTimeout(() => errorNotification.remove(), 300);
        }, 3000);
      }
      
      // Sprawdź czy to błąd walidacji czy połączenia
      if (error instanceof Error) {
        if (error.message.includes('Brak dostępnych dywaników')) {
          alert('Brak dostępnych dywaników dla wybranej konfiguracji. Spróbuj wybrać inną kombinację.');
        } else if (error.message.includes('Brak pełnych danych')) {
          alert('Proszę wybrać markę, model, rocznik i typ nadwozia.');
        } else {
          alert('Wystąpił błąd podczas dodawania do koszyka. Spróbuj ponownie.');
        }
      }
    } finally {
      setIsAddingToCart(false);
    }
  };

  const getSectionTitle = (section: number) => {
    const titles = [
      "Wybór modelu",
      "Rodzaj dywaników",
      "Rodzaj komórek",
      "Rodzaj zestawu",
      "Kolory",
      "Dodatki",
      "Podsumowanie"
    ];
    return titles[section] || "";
  };

  // Funkcja do generowania dynamicznego tytułu
  const getDynamicTitle = () => {
    const parts = ["Skonfiguruj dywaniki"];
    
    if (selectedCarBrand) {
      // Formatuj nazwę marki (pierwsza litera wielka)
      const formattedBrand = selectedCarBrand.charAt(0).toUpperCase() + selectedCarBrand.slice(1);
      parts.push(`do ${formattedBrand}`);
      
      if (selectedCarModel) {
        parts.push(selectedCarModel);
        
        if (selectedCarYear) {
          parts.push(selectedCarYear);
          
          if (selectedBodyType) {
            // Znajdź nazwę typu nadwozia na podstawie ID
            const bodyType = bodyTypes.find(bt => bt.id === selectedBodyType);
            if (bodyType) {
              parts.push(bodyType.name);
            }
          }
        }
      }
    }
    
    return parts.join(" ");
  };

  // Dynamiczne kolory na podstawie wybranej struktury komórek i obszycia
  const availableMaterialColors = useMemo(() => {
    // Użyj filtrowania na podstawie obszycia dla classic+honey+darkblue
    const materialColorKeys = getAvailableMaterialColorsForEdge(
      selectedCellType,
      selectedSetType,
      selectedEdge
    );
    
    return materialColorKeys.map(colorKey => ({
      id: colorKey,
      name: getColorInfo(colorKey).name,
      color: getColorInfo(colorKey).color
    }));
  }, [selectedCellType, selectedSetType, selectedEdge]);

  const availableEdgeColors = useMemo(() => {
    return getAvailableColors(selectedCellType, 'border').map(colorKey => ({
      id: colorKey,
      name: getColorInfo(colorKey).name,
      hex: getColorInfo(colorKey).color
    }));
  }, [selectedCellType]);

  // Resetuj wybrane kolory jeśli nie są dostępne dla nowej struktury komórek lub obszycia
  useEffect(() => {
    if (!availableMaterialColors.find(c => c.id === selectedMat)) {
      setSelectedMat(availableMaterialColors[0]?.id || "black");
    }
    if (!availableEdgeColors.find(c => c.id === selectedEdge)) {
      setSelectedEdge(availableEdgeColors[0]?.id || "black");
    }
  }, [selectedCellType, selectedSetType, selectedEdge, availableMaterialColors, availableEdgeColors, selectedMat, selectedEdge]);

  const price = useMemo(() => {
    if (!selectedSetType || !selectedSetVariant) return 0;
    
    // 1. Pobierz bazową cenę kompletu
    const basePrice = PRICING.basePrice[selectedSetType as keyof typeof PRICING.basePrice]?.[selectedSetVariant as 'front' | 'basic' | 'premium' | 'complete' | 'test'] || 0;
    
    // 2. Oblicz rabat (zależny od wartości: ≥910 zł = -30%, <910 zł = -20%, test = 0%)
    const discount = PRICING.getDiscount(basePrice);
    const priceAfterDiscount = basePrice * (1 - discount);
    
    // 3. Dodaj koszt wysyłki (27 zł tylko dla 'front', darmowa dla 'basic', 'premium', 'complete' i 'test')
    const shippingCost = PRICING.shipping.freeForVariants.includes(selectedSetVariant as any) 
      ? 0 
      : PRICING.shipping.cost;
    
    const totalPrice = selectedSetVariant === 'test' 
      ? priceAfterDiscount 
      : Math.round((priceAfterDiscount + shippingCost) * 100) / 100;
    
    console.log('💰 Configurator price useMemo - Kalkulacja ceny:', {
      setType: selectedSetType,
      setVariant: selectedSetVariant,
      basePrice,
      discount: `${discount * 100}%`,
      priceAfterDiscount: Math.round(priceAfterDiscount * 100) / 100,
      shippingCost,
      totalPrice
    });
    
    return totalPrice;
  }, [selectedSetType, selectedSetVariant]);

  // Track ViewContent gdy konfiguracja jest kompletna
  useEffect(() => {
    if (!selectedCarBrand || !selectedCarModel || !selectedCarYear || price === 0) {
      return;
    }

    // Sprawdź czy event nie został już wysłany dla tej konfiguracji (deduplikacja)
    const configKey = `${selectedCarBrand}_${selectedCarModel}_${selectedCarYear}_${selectedSetType}_${selectedSetVariant}_${selectedCellType}_${selectedMat}_${selectedEdge}`;
    const cacheKey = `viewcontent_${configKey}`;
    const cached = sessionStorage.getItem(cacheKey);
    
    if (cached) {
      return;
    }

    try {
      const productId = `${selectedCarBrand}-${selectedCarModel}-${selectedCarYear}-${selectedSetType}-${selectedSetVariant}`;
      const productName = `Dywaniki EVA Premium - ${selectedCarBrand} ${selectedCarModel}`;
      const productSku = `EVA-${selectedSetType}-${selectedCellType}-${selectedMat}-${selectedEdge}`;

      const viewContentData = createViewContent({
        id: productId,
        name: productName,
        sku: productSku,
        price: price,
        brand: selectedCarBrand,
        category: 'car_mats',
        configuration: {
          setType: selectedSetType,
          cellType: selectedCellType,
          setVariant: selectedSetVariant,
          materialColor: selectedMat,
          edgeColor: selectedEdge,
          heelPad: selectedHeelPad,
          carDetails: {
            brand: selectedCarBrand,
            model: selectedCarModel,
            year: selectedCarYear,
            bodyType: selectedBodyType || 'universal'
          }
        }
      }, price);

      trackViewContent(viewContentData);

      // Zapisz w cache (ważność: sesja)
      sessionStorage.setItem(cacheKey, Date.now().toString());
    } catch (error) {
      console.error('[Tracking] Error tracking ViewContent:', error);
    }
  }, [selectedCarBrand, selectedCarModel, selectedCarYear, selectedSetType, selectedSetVariant, selectedCellType, selectedMat, selectedEdge, selectedHeelPad, selectedBodyType, price, trackViewContent, createViewContent]);

  const mat = useMemo(() => availableMaterialColors.find(m => m.id === selectedMat)!, [selectedMat, availableMaterialColors]);
  const edge = useMemo(() => availableEdgeColors.find(e => e.id === selectedEdge)!, [selectedEdge, availableEdgeColors]);
  const setType = useMemo(() => setTypes.find(s => s.id === selectedSetType)!, [selectedSetType]);
  const cellType = useMemo(() => cellTypes.find(c => c.id === selectedCellType)!, [selectedCellType]);
  const setVariant = useMemo(() => setVariants.find(v => v.id === selectedSetVariant)!, [selectedSetVariant]);

  // Obraz dywanika z wszystkimi dependencies
  const matImagePath = useMemo(() => {
    const matType = getMatTypeForImage(selectedSetType);
    const path = getMatImagePath(
      matType,
      selectedCellType as 'diamonds' | 'honey',
      selectedMat,
      selectedEdge
    );
    
    // Debug - wyświetl ścieżkę w konsoli
    console.log('🖼️ Obraz dywanika:', {
      selectedSetType,
      matType,
      selectedCellType,
      selectedMat,
      selectedEdge,
      path
    });
    
    return path;
  }, [selectedSetType, selectedCellType, selectedMat, selectedEdge]);

  return (
    <section className="w-full bg-black text-white">
      <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-8 py-12 md:py-16">
        <div className="flex flex-col md:flex-row gap-6 lg:gap-10 2xl:gap-12">
          {/* Lewa strona - wizualizacja */}
          <div className="w-full lg:w-[900px] xl:w-[1000px] 2xl:w-[1100px]">
            <div 
              className="relative w-full h-[250px] sm:h-[300px] md:h-[550px] lg:h-[650px] xl:h-[700px] 2xl:h-[800px] rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 cursor-pointer md:cursor-default transition-opacity duration-300"
              onClick={() => {
                if (typeof window !== 'undefined' && window.innerWidth < 768) {
                  setIsVisualizationExpanded(true);
                }
              }}
            >
              {/* Rzeczywisty obraz dywanika */}
              <Image
                key={`${selectedSetType}-${selectedCellType}-${selectedMat}-${selectedEdge}`}
                src={matImagePath}
                alt={`Dywanik ${mat.name} z obszyciem ${edge.name}`}
                fill
                className="object-cover transition-opacity duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={false}
                loading="lazy"
                onError={(e) => {
                  // Fallback do emoji jeśli obraz nie istnieje
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              
              {/* Fallback z emoji i kolorami */}
              <div className="absolute inset-0 flex items-center justify-center text-center space-y-4" style={{ display: 'none' }}>
                <div className="text-6xl">🚗</div>
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-3">
                    <span 
                      className="inline-block h-4 w-4 rounded-full border-2 shadow-lg" 
                      style={{ 
                        backgroundColor: mat.color,
                        borderColor: mat.color === '#ffffff' || mat.color === '#d9d7c7' || mat.color === '#bdbdbd' ? '#333' : 'rgba(255,255,255,0.3)'
                      }} 
                    />
                    <span className="text-sm font-medium">Kolor: {mat.name}</span>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <span 
                      className="inline-block h-4 w-4 rounded-full border-2 shadow-lg" 
                      style={{ 
                        backgroundColor: edge.hex,
                        borderColor: edge.hex === '#ffffff' || edge.hex === '#d9d7c7' || edge.hex === '#bdbdbd' ? '#333' : 'rgba(255,255,255,0.3)'
                      }} 
                    />
                    <span className="text-sm font-medium">Obszycie: {edge.name}</span>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 right-4 text-xs md:text-sm bg-black/60 backdrop-blur px-3 py-1.5 rounded-full border border-neutral-800">
                  <div>Typ: {setType.name}</div>
                  <div>Komórki: {cellType.name}</div>
                  <div>Zestaw: {setVariant.name}</div>
                </div>
                {/* Tap to expand indicator na mobile */}
                <div className="md:hidden absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur px-3 py-1.5 rounded-full border border-neutral-800 text-xs text-white/80">
                  Dotknij aby powiększyć
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm text-white/70">
              Wizualizacja poglądowa. Docelowy kształt dywanika dopasujemy do Twojego modelu auta.
            </p>
          </div>

          {/* Prawa strona - konfigurator z sekcjami */}
          <div 
            className="w-full lg:w-[700px] xl:w-[780px] 2xl:w-[900px] bg-neutral-950/60 border border-neutral-800 rounded-2xl p-6 md:p-8 lg:p-10 2xl:p-12 min-h-[400px] sm:min-h-[500px] md:h-auto flex flex-col pb-32 md:pb-24 max-h-[calc(100vh-200px)] md:max-h-none overflow-y-auto md:overflow-visible overflow-x-hidden"
            data-config-panel
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Header z progressem - sticky na mobile */}
            <div className="mb-6 sticky top-0 z-10 bg-neutral-950/95 backdrop-blur md:bg-transparent md:backdrop-blur-none pb-4 md:pb-0 -mx-6 md:mx-0 px-6 md:px-0 pt-safe md:pt-0">
              <h2 className="text-xl md:text-2xl font-semibold">
                {getDynamicTitle()}
              </h2>
              <p className="text-white/70 text-sm mt-1">
                {brandParam 
                  ? `Dopasowane dywaniki EVA Premium dla marki ${brandParam.toUpperCase()}. Zachowujemy stylistykę EvaPremium i jakość premium.`
                  : 'Zachowujemy stylistykę EvaPremium i jakość premium.'
                }
              </p>
              
              {/* Progress indicator */}
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 bg-neutral-800 rounded-full h-2 md:h-2">
                  <div 
                    className="bg-red-500 rounded-full h-2 md:h-2 transition-all duration-300"
                    style={{ width: `${((currentSection + 1) / totalSections) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-white/60">
                  {currentSection + 1} / {totalSections}
                </span>
              </div>
            </div>

            <Separator className="mb-6 bg-neutral-800" />

            {/* Sekcja 1: Rodzaj zestawu */}
            {currentSection === 0 && (
              <div className="flex-1 space-y-6">
                {/* Wyświetl wybraną markę */}
                {selectedCarBrand && (
                  <div className="mb-6 p-4 bg-neutral-900/50 rounded-lg border border-neutral-800">
                    <h3 className="text-sm font-medium mb-2 text-gray-300">Wybrana marka</h3>
                    <div className="flex items-center gap-3">
                      <div className="relative w-24 h-24 bg-neutral-800 rounded-lg flex items-center justify-center overflow-hidden shadow-lg border border-neutral-700">
                        {brandsLoading ? (
                          <div className="w-full h-full bg-neutral-700 animate-pulse rounded"></div>
                        ) : (
                          <Image
                            src={brands.find(b => b.name.toLowerCase() === selectedCarBrand.toLowerCase())?.logo || "/images/placeholder.png"}
                            alt={selectedCarBrand}
                            className="object-cover"
                            quality={100}
                            priority={true}
                            unoptimized={false}
                            fill
                          />
                        )}
                      </div>
                      <span className="text-lg font-semibold text-white">
                        {(() => {
                          const brandMappings: Record<string, string> = {
                            "Mercedes": "Mercedes-Benz",
                            "Aston martin": "Aston Martin",
                            "Alfa romeo": "Alfa Romeo"
                          };
                          return brandMappings[selectedCarBrand] || selectedCarBrand;
                        })()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                      Wybierz model samochodu z listy poniżej
                    </p>
                  </div>
                )}

                {selectedCarBrand && (
                  <div>
                    <h3 className="text-sm font-medium mb-3 text-gray-300">Wybierz model</h3>
                    {loadingModels ? (
                      <div className="text-center py-8 text-gray-400">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-2"></div>
                        <p>Ładowanie modeli...</p>
                      </div>
                    ) : availableModels.length > 0 ? (
                      <div className="relative">
                        <select
                          value={selectedCarModel}
                          onChange={(e) => setSelectedCarModel(e.target.value)}
                          className="w-full p-4 md:p-4 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-base md:text-base focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-200 hover:border-neutral-600 appearance-none cursor-pointer min-h-[48px]"
                        >
                          <option value="" className="bg-neutral-900 text-gray-400">Wybierz model...</option>
                          {availableModels.map((model, index) => (
                            <option key={index} value={model.name} className="bg-neutral-900 text-white">
                              {model.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-neutral-900/50 rounded-lg border border-neutral-800 text-center">
                        <p className="text-gray-400 mb-2">Brak dostępnych modeli</p>
                        <p className="text-sm text-gray-500">Dla wybranej marki nie ma jeszcze dostępnych modeli</p>
                      </div>
                    )}
                  </div>
                )}

                {selectedCarModel && (
                  <div>
                    <h3 className="text-sm font-medium mb-3 text-gray-300">Wybierz rocznik</h3>
                    {loadingYears ? (
                      <div className="text-center py-8 text-gray-400">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-2"></div>
                        <p>Ładowanie roczników...</p>
                      </div>
                    ) : availableYears.length > 0 ? (
                      <div className="relative">
                        <select
                          value={selectedCarYear}
                          onChange={(e) => setSelectedCarYear(e.target.value)}
                          className="w-full p-4 md:p-4 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-base md:text-base focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-200 hover:border-neutral-600 appearance-none cursor-pointer min-h-[48px]"
                        >
                          <option value="" className="bg-neutral-900 text-gray-400">Wybierz rocznik...</option>
                          {availableYears.map((year) => (
                            <option key={year.id} value={year.name} className="bg-neutral-900 text-white">
                              {year.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-neutral-900/50 rounded-lg border border-neutral-800 text-center">
                        <p className="text-gray-400 mb-2">Brak dostępnych roczników</p>
                        <p className="text-sm text-gray-500">Dla wybranego modelu nie ma jeszcze dostępnych roczników</p>
                      </div>
                    )}
                  </div>
                )}

                {selectedCarYear && (
                  <div>
                    {/* Wyświetl informację o generacji */}
                    {(() => {
                      const generation = findGenerationByYear(selectedCarBrand, selectedCarModel, parseInt(selectedCarYear));
                      return generation ? (
                        <div className="mb-4 p-3 bg-blue-900/20 border border-blue-800/50 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-300 mb-1">Generacja</h4>
                          <p className="text-sm text-blue-200">{generation}</p>
                        </div>
                      ) : null;
                    })()}
                    
                    <h3 className="text-sm font-medium mb-3 text-gray-300">Wybierz typ nadwozia</h3>
                    {loadingBodyTypes ? (
                      <div className="text-center py-8 text-gray-400">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-2"></div>
                        <p>Ładowanie typów nadwozia...</p>
                      </div>
                    ) : availableBodyTypes.length > 0 ? (
                      <div className="relative">
                        <select
                          value={selectedBodyType}
                          onChange={(e) => setSelectedBodyType(e.target.value)}
                          className="w-full p-4 md:p-4 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-base md:text-base focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-200 hover:border-neutral-600 appearance-none cursor-pointer min-h-[48px]"
                        >
                          <option value="" className="bg-neutral-900 text-gray-400">Wybierz typ nadwozia...</option>
                          {availableBodyTypes.map((bodyType) => (
                            <option key={bodyType.id} value={bodyType.id} className="bg-neutral-900 text-white">
                              {bodyType.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-neutral-900/50 rounded-lg border border-neutral-800 text-center">
                        <p className="text-gray-400 mb-2">Brak dostępnych typów nadwozia</p>
                        <p className="text-sm text-gray-500">Dla wybranego modelu nie ma jeszcze dostępnych typów nadwozia</p>
                      </div>
                    )}
                  </div>
                )}

                {!selectedCarBrand && (
                  <div className="text-center py-8">
                    <p className="text-gray-400 mb-4">Nie wybrano marki auta</p>
                    <p className="text-sm text-gray-500">Wróć do sekcji &quot;Popularne Marki Samochodów&quot; i wybierz markę swojego auta</p>
                  </div>
                )}
              </div>
            )}

            {/* Sekcja 1: Rodzaj dywaników */}
            {currentSection === 1 && (
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-3">Wybierz rodzaj dywaników</h3>
                  <RadioGroup value={selectedSetType} onValueChange={setSelectedSetType} className="space-y-3">
                    {setTypes.map((s) => {
                      // W nowym systemie nie ma modyfikatorów za typ zestawu
                      const modifier = { modifier: 0, label: '+0 zł' };
                      
                      return (
                        <Label key={s.id} htmlFor={`set-${s.id}`} className={`group relative cursor-pointer rounded-xl border ${selectedSetType === s.id ? "border-white" : "border-neutral-800"} p-4 bg-neutral-900/50 hover:bg-neutral-900 active:bg-neutral-800 active:scale-[0.98] transition`}>
                          <RadioGroupItem value={s.id} id={`set-${s.id}`} className="sr-only" />
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium">{s.name}</div>
                              <div className="text-xs text-white/60">{s.description}</div>
                            </div>
                          </div>
                        </Label>
                      );
                    })}
                  </RadioGroup>
                </div>
                
                {/* Info box o wpływie na cenę */}
                {selectedSetType && (
                  <div className="p-4 bg-neutral-800/50 border border-neutral-700 rounded-lg">
                    <p className="text-sm text-gray-300">
                      Wybór rodzaju dywaników wpłynie na końcową cenę zestawu
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Sekcja 3: Rodzaj zestawu */}
            {currentSection === 3 && (
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-3">Wybierz rodzaj zestawu</h3>
                  <RadioGroup value={selectedSetVariant} onValueChange={setSelectedSetVariant} className="space-y-3">
                    {setVariants.map((v) => {
                      // Oblicz cenę bazową bez wysyłki (do wyświetlania w sekcji wyboru zestawu)
                      const displayPrice = selectedSetType 
                        ? getVariantBasePrice(selectedSetType, v.id)
                        : 0;
                      
                      return (
                        <Label key={v.id} htmlFor={`variant-${v.id}`} className={`group relative cursor-pointer rounded-xl border ${selectedSetVariant === v.id ? "border-white" : "border-neutral-800"} p-4 bg-neutral-900/50 hover:bg-neutral-900 active:bg-neutral-800 active:scale-[0.98] transition`}>
                          <RadioGroupItem value={v.id} id={`variant-${v.id}`} className="sr-only" />
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="text-sm font-medium">{v.name}</div>
                              <div className="text-xs text-white/60">{v.description}</div>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              {(v.id === "front" || v.id === "basic" || v.id === "premium" || v.id === "complete" || v.id === "test") && (
                                <div className="flex items-center justify-center">
                                  <Image
                                    src={v.id === "front" ? "/konfigurator/zestaw/przod.png" : v.id === "basic" ? "/konfigurator/zestaw/pt.png" : v.id === "premium" ? "/konfigurator/zestaw/ptb.png" : v.id === "complete" ? "/konfigurator/zestaw/mata.png" : "/konfigurator/zestaw/przod.png"}
                                    alt={`Wizualizacja zestawu ${v.name}`}
                                    width={80}
                                    height={48}
                                    className="rounded-lg"
                                    sizes="80px"
                                  />
                                </div>
                              )}
                              {displayPrice > 0 && (
                                <div className="text-right">
                                  <div className="text-lg font-bold text-green-400">
                                    {v.id === 'test' ? displayPrice.toFixed(2) : displayPrice} zł
                                  </div>
                                  <div className="text-xs text-white/60">
                                    {v.id === 'test' ? 'test' : selectedSetType === '3d-with-rims' ? 'z rantami' : 'bez rantów'}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </Label>
                      );
                    })}
                  </RadioGroup>
                </div>
              </div>
            )}

            {/* Sekcja 2: Rodzaj komórek */}
            {currentSection === 2 && (
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-3">Wybierz rodzaj komórek</h3>
                  <RadioGroup value={selectedCellType} onValueChange={setSelectedCellType} className="space-y-3">
                    {cellTypes.map((c) => (
                      <Label key={c.id} htmlFor={`cell-${c.id}`} className={`group relative cursor-pointer rounded-xl border ${selectedCellType === c.id ? "border-white" : "border-neutral-800"} p-4 bg-neutral-900/50 hover:bg-neutral-900 active:bg-neutral-800 active:scale-[0.98] transition`}>
                        <RadioGroupItem value={c.id} id={`cell-${c.id}`} className="sr-only" />
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium">{c.name}</div>
                            <div className="text-xs text-white/60">{c.description}</div>
                          </div>
                          {/* W nowym systemie nie ma modyfikatorów cenowych za personalizację */}
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            )}

            {/* Sekcja 4: Kolory */}
            {currentSection === 4 && (
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-3">Kolor dywaników</h3>
                  <RadioGroup value={selectedMat} onValueChange={setSelectedMat} className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-2 md:gap-3">
                    {availableMaterialColors.map((c) => (
                      <Label key={c.id} htmlFor={`mat-${c.id}`} className={`group relative cursor-pointer rounded-lg border-2 ${selectedMat === c.id ? "border-white ring-2 ring-white/30" : "border-neutral-700"} hover:opacity-80 active:opacity-70 active:scale-95 transition-all duration-200 focus-within:ring-2 focus-within:ring-white/30 aspect-square overflow-hidden min-w-[48px] min-h-[48px]`}>
                        <RadioGroupItem value={c.id} id={`mat-${c.id}`} className="sr-only" />
                        <div
                          className="absolute inset-0"
                          style={{
                            backgroundColor: c.color,
                            filter: 'brightness(1.15) saturate(1.25) contrast(1.05)'
                          }}
                        />
                        <div
                          className="absolute inset-0 pointer-events-none"
                          data-testid="texture-overlay"
                          style={{
                            backgroundImage: `url(${selectedCellType === 'honey' ? '/konfigurator/komorki/plaster.png' : '/konfigurator/komorki/romb.png'})`,
                            backgroundSize: 'cover',
                            backgroundRepeat: 'no-repeat',
                            mixBlendMode: 'multiply',
                            opacity: 0.35
                          }}
                        />
                        <div className="flex items-center justify-center h-full relative z-[1]">
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-3">Kolor obszycia</h3>
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-2 md:gap-3">
                    {availableEdgeColors.map((e) => (
                      <button
                        key={e.id}
                        onClick={() => setSelectedEdge(e.id)}
                        className={`rounded-lg border-2 ${selectedEdge === e.id ? "border-white ring-2 ring-white/30" : "border-neutral-700"} hover:opacity-80 active:opacity-70 active:scale-95 transition-all duration-200 aspect-square cursor-pointer min-w-[48px] min-h-[48px]`}
                        style={{ backgroundColor: e.hex }}
                        aria-pressed={selectedEdge === e.id}
                      >
                        <div className="flex items-center justify-center h-full">
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sekcja 5: Dodatki */}
            {currentSection === 5 && (
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-3">Ochraniacz pod piętę</h3>
                  <RadioGroup value={selectedHeelPad} onValueChange={setSelectedHeelPad} className="grid grid-cols-2 gap-3">
                    {[
                      { id: "brak", name: "Brak" },
                      { id: "gumowy", name: "Gumowy" },
                    ].map((h) => (
                      <Label key={h.id} htmlFor={`heel-${h.id}`} className={`cursor-pointer rounded-xl border ${selectedHeelPad === h.id ? "border-white" : "border-neutral-800"} px-4 py-3 bg-neutral-900/50 hover:bg-neutral-900 active:bg-neutral-800 active:scale-[0.98] transition` }>
                        <RadioGroupItem value={h.id} id={`heel-${h.id}`} className="sr-only" />
                        <span className="text-sm">{h.name}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            )}

            {/* Sekcja 6: Podsumowanie */}
            {currentSection === 6 && (
              <div className="flex-1 space-y-6">
                {/* Wybrane auto */}
                <div className="p-4 bg-neutral-900/50 rounded-lg border border-neutral-800">
                  <h3 className="text-sm font-medium mb-3 text-gray-300">Wybrane auto</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="relative w-16 h-16 bg-neutral-800 rounded-lg flex items-center justify-center overflow-hidden shadow-lg border border-neutral-700">
                        {brandsLoading ? (
                          <div className="w-full h-full bg-neutral-700 animate-pulse rounded"></div>
                        ) : (
                          <Image
                            src={brands.find(b => b.name.toLowerCase() === selectedCarBrand.toLowerCase())?.logo || "/images/placeholder.png"}
                            alt={selectedCarBrand}
                            className="object-cover"
                            quality={100}
                            priority={true}
                            unoptimized={false}
                            fill
                          />
                        )}
                      </div>
                      <div>
                        <div className="text-white font-semibold">
                          {(() => {
                            const brandName = selectedCarBrand.charAt(0).toUpperCase() + selectedCarBrand.slice(1);
                            const brandMappings: Record<string, string> = {
                              "Mercedes": "Mercedes-Benz",
                              "Aston martin": "Aston Martin",
                              "Alfa romeo": "Alfa Romeo"
                            };
                            return brandMappings[brandName] || brandName;
                          })()} {selectedCarModel}
                        </div>
                        <div className="text-sm text-gray-400">
                          {selectedCarYear} • {bodyTypes.find(bt => bt.id === selectedBodyType)?.name || "Nie wybrano"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-white/70">Wybrana konfiguracja:</span>
                    </div>
                    <div className="text-xs text-white/60 space-y-1">
                      <div>• {getVariantMatsDescription(selectedSetVariant)}</div>
                      <div>• {setType.name}</div>
                      <div>• {cellType.name}</div>
                      <div>• {mat.name} + {edge.name} obszycie</div>
                      {selectedHeelPad !== "brak" && <div>• Ochraniacz pod piętę</div>}
                    </div>
                  </div>
                  
                  {/* Breakdown ceny */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Zestaw ({setVariant.name})</span>
                      <span className="text-white">{priceBreakdown.basePrice} zł</span>
                    </div>
                    {priceBreakdown.discount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Rabat ({Math.round((priceBreakdown.discount / priceBreakdown.basePrice) * 100)}%)</span>
                        <span className="text-red-400">-{priceBreakdown.discount} zł</span>
                      </div>
                    )}
                    {priceBreakdown.shippingCost > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Wysyłka</span>
                        <span className="text-white">{priceBreakdown.shippingCost} zł</span>
                      </div>
                    )}
                    {priceBreakdown.shippingCost === 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Wysyłka</span>
                        <span className="text-green-400">Darmowa</span>
                      </div>
                    )}
                    <Separator className="my-2" />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Razem</span>
                      <span className="text-green-400">
                        {isPriceLoading ? (
                          <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
                            Ładowanie...
                          </span>
                        ) : (
                          `${priceBreakdown.totalPrice} zł`
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-white/60">Finalna cena może się różnić w zależności od modelu auta.</p>
                
                {/* Szacowany czas dostawy */}
                <div className="mt-6 p-3 bg-neutral-800/50 rounded-lg border border-neutral-700">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-white/80 font-medium">Szacowany czas dostawy</span>
                  </div>
                  <p className="text-xs text-white/60 mt-1 ml-4">
                    Szacowana data dostawy: <span className="text-green-400 font-medium">{deliveryDate}</span>
                  </p>
                </div>
                
                {/* Uwagi do zamówienia */}
                <div className="mt-4">
                  <label htmlFor="order-notes" className="block text-xs text-white/70 mb-2">
                    Uwagi do zamówienia (opcjonalnie)
                  </label>
                  <textarea
                    id="order-notes"
                    placeholder="Dodatkowe informacje, uwagi, specjalne życzenia..."
                    className="w-full h-20 px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  />
                </div>
                
                {/* Checkbox zgody */}
                <div className="mt-4 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="privacy-agreement"
                    className="w-4 h-4 text-red-600 bg-neutral-800 border-neutral-600 rounded focus:ring-red-500 focus:ring-2"
                  />
                  <label htmlFor="privacy-agreement" className="text-xs text-white/70 cursor-pointer">
                    Zgadzam się z polityką prywatności i regulaminem
                  </label>
                </div>
              </div>
            )}


            {/* Navigation buttons */}

            <div className="flex justify-between items-center mt-6 pt-4 border-t border-neutral-800 md:static fixed bottom-0 left-0 right-0 bg-neutral-950/95 backdrop-blur border-t border-neutral-800 p-4 md:p-0 md:bg-transparent md:backdrop-blur-none z-20 pb-safe md:pb-0 shadow-lg md:shadow-none">
              <Button
                variant="outline"
                onClick={prevSection}
                disabled={currentSection === 0}
                className="flex items-center gap-2 border-neutral-700 text-white hover:bg-neutral-800 active:bg-neutral-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] min-w-[44px] md:min-w-auto"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Wstecz</span>
              </Button>
              
              
              {currentSection === totalSections - 1 ? (
                <Button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || cartLoading}
                  className="flex items-center gap-2 bg-red-600 text-white hover:bg-red-700 active:bg-red-800 active:scale-95 px-8 py-3 text-lg font-semibold min-w-[200px] min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingToCart || cartLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Dodawanie...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      Dodaj do Koszyka
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={nextSection}
                  disabled={currentSection === 0 && (!selectedCarModel || !selectedCarYear || !selectedBodyType)}
                  className="flex items-center gap-2 bg-red-600 text-white hover:bg-red-700 active:bg-red-800 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] min-w-[44px] md:min-w-auto"
                >
                  <span className="hidden sm:inline">Dalej</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal pełnoekranowy dla wizualizacji na mobile */}
      {isVisualizationExpanded && (
        <div 
          className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4"
          onClick={() => setIsVisualizationExpanded(false)}
        >
          <div className="relative w-full h-full max-w-4xl max-h-[90vh] rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950">
            <Image
              key={`expanded-${selectedSetType}-${selectedCellType}-${selectedMat}-${selectedEdge}`}
              src={matImagePath}
              alt={`Dywanik ${mat.name} z obszyciem ${edge.name}`}
              fill
              className="object-contain transition-opacity duration-500"
              sizes="100vw"
              priority
            />
            <button
              onClick={() => setIsVisualizationExpanded(false)}
              className="absolute top-4 right-4 bg-black/60 backdrop-blur px-4 py-2 rounded-full border border-neutral-800 text-white hover:bg-black/80 active:bg-black active:scale-95 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Zamknij"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur px-4 py-2 rounded-full border border-neutral-800 text-sm text-white/80">
              Dotknij poza obraz aby zamknąć
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
