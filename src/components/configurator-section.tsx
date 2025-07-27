"use client";
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Image from "next/image";
import { 
  Info, 
  RotateCcw, 
  Check, 
  AlertCircle, 
  Car, 
  Palette, 
  Settings,
  ShoppingCart,
  Save,
  Eye,
  ChevronLeft,
  ChevronRight,
  Star,
  Zap,
  Shield
} from "lucide-react";
import { HybridSessionManager } from "@/lib/utils/hybrid-session-manager";

// Mapowanie kolorów z bazy danych na kolory hex
const colorMapping: { [key: string]: { name: string; color: string } } = {
  'blue': { name: "Niebieski", color: "#0084d1" },
  'red': { name: "Czerwony", color: "#d12d1c" },
  'yellow': { name: "Żółty", color: "#ffe100" },
  'ivory': { name: "Kość słoniowa", color: "#d9d7c7" },
  'darkblue': { name: "Granatowy", color: "#1a355b" },
  'maroon': { name: "Bordowy", color: "#6d2635" },
  'orange': { name: "Pomarańczowy", color: "#ff7b1c" },
  'lightbeige': { name: "Jasnobeżowy", color: "#d1b48c" },
  'darkgrey': { name: "Ciemnoszary", color: "#4a4a4a" },
  'purple': { name: "Fioletowy", color: "#7c4bc8" },
  'lime': { name: "Jasnozielony", color: "#8be000" },
  'beige': { name: "Beżowy", color: "#b48a5a" },
  'pink': { name: "Różowy", color: "#ff7eb9" },
  'black': { name: "Czarny", color: "#222" },
  'darkgreen': { name: "Zielony", color: "#1b5e3c" },
  'brown': { name: "Brązowy", color: "#4b2e1e" },
  'white': { name: "Biały", color: "#ffffff" },
};

const carpetColors = Object.values(colorMapping);

const edgeColors = [
  { name: "Zielony", color: "#1b5e3c" },
  { name: "Brązowy", color: "#4b2e1e" },
  { name: "Ciemnoszary", color: "#4a4a4a" },
  { name: "Czerwony", color: "#d12d1c" },
  { name: "Różowy", color: "#ff7eb9" },
  { name: "Niebieski", color: "#0084d1" },
  { name: "Czarny", color: "#222" },
  { name: "Bordowy", color: "#6d2635" },
  { name: "Granatowy", color: "#1a355b" },
  { name: "Żółty", color: "#ffe100" },
  { name: "Fioletowy", color: "#7c4bc8" },
  { name: "Beżowy", color: "#b48a5a" },
  { name: "Pomarańczowy", color: "#ff7b1c" },
  { name: "Jasnoszary", color: "#bdbdbd" },
];

const textures = [
  { 
    name: "Plaster", 
    img: "/images/zalety/plaster.png",
    description: "Klasyczna tekstura plastra miodu, doskonała przyczepność",
    price: 0
  },
  { 
    name: "Romby", 
    img: "/images/zalety/romby.png", // Użyj romby.png jako obrazek dla Romby
    description: "Nowoczesna tekstura w romby, stylowy wygląd i dobra przyczepność",
    price: 0
  },
];

const threeDVariants = [
  {
    name: "3D Z rantami",
    description: "Dywaniki 3D z wysokimi rantami (do 8cm) zapewniające maksymalną ochronę",
    price: 50,
    image: "/images/zalety/3d.png"
  },
  {
    name: "3D bez rantów",
    description: "Dywaniki 3D bez rantów - płaska powierzchnia z zachowaniem struktury 3D",
    price: 0,
    image: "/images/zalety/plaster.png"
  }
];

const configurations = [
  { 
    name: "Przód + Tył + Bagażnik", 
    img: "/images/konfigurator/ptb.png",
    description: "Kompletny zestaw dla całego samochodu",
    price: 260
  },
  { 
    name: "Przód", 
    img: "/images/products/audi.jpg",
    description: "Dywaniki tylko na przednie siedzenia",
    price: 120
  },
  { 
    name: "Przód i tył", 
    img: "/images/products/bmw.png",
    description: "Dywaniki na przednie i tylne siedzenia",
    price: 180
  },
  { 
    name: "Przód i tył + bagażnik", 
    img: "/images/products/mercedes.jpg",
    description: "Dywaniki na siedzenia i bagażnik",
    price: 220
  },
  { 
    name: "Mata do bagażnika", 
    img: "/images/products/porsche.png",
    description: "Tylko mata do bagażnika",
    price: 80
  },
];

const carBrands = ["BMW", "Audi", "Mercedes", "Porsche", "Tesla"];
const carModels = ["Seria 3", "A4", "C-klasa", "911", "Model S"];
const carYears = ["2024", "2023", "2022", "2021", "2020"];
const carBodies = ["Sedan", "Kombi", "SUV", "Coupe"];
const carTransmissions = ["Manualna", "Automatyczna"];

interface ConfiguratorState {
  selectedCarpet: number;
  selectedEdge: number;
  selectedTexture: number;
  selectedConfig: number;
  selected3DVariant: number;
  brand: string;
  model: string;
  year: string;
  body: string;
  trans: string;
}

interface MatsData {
  id: number;
  type: string;
  color: string;
  cellType: string;
  edgeColor: string;
  image: string;
}

// Słownik konfiguracji - dynamicznie przechowuje dane z każdego etapu konfiguratora
interface ConfiguratorDictionary {
  // Etap 1: Wybór samochodu
  carSelection: {
    brand: string;
    model: string;
    year: string;
    body: string;
    trans: string;
    isComplete: boolean;
  };
  
  // Etap 2: Konfiguracja
  configuration: {
    selectedConfig: number;
    configName: string;
    configPrice: number;
    isComplete: boolean;
  };
  
  // Etap 3: Kolory i tekstury
  customization: {
    selectedCarpet: number;
    carpetColor: string;
    carpetColorName: string;
    selectedEdge: number;
    edgeColor: string;
    edgeColorName: string;
    selectedTexture: number;
    textureName: string;
    texturePrice: number;
    selected3DVariant: number;
    variantName: string;
    variantPrice: number;
    selectedMatImage: string;
    isComplete: boolean;
  };
  
  // Etap 4: Podsumowanie
  summary: {
    totalPrice: number;
    isComplete: boolean;
  };
  
  // Dane klienta z formularza finalizacji zamówienia
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    isComplete: boolean;
  };
  
  // Dane dostawy i płatności
  shipping: {
    method: string;
    methodName: string;
    cost: number;
    estimatedDelivery: string;
    isComplete: boolean;
  };
  
  payment: {
    method: string;
    methodName: string;
    isComplete: boolean;
  };
  
  // Dane firmy (jeśli faktura)
  company: {
    name: string;
    nip: string;
    isInvoice: boolean;
    isComplete: boolean;
  };
  
  // Dodatkowe informacje
  additional: {
    termsAccepted: boolean;
    newsletter: boolean;
    discountCode: string;
    discountApplied: boolean;
    discountAmount: number;
    notes: string;
  };
  
  // Metadane zamówienia
  metadata: {
    currentStep: number;
    lastUpdated: Date;
    isConfigurationComplete: boolean;
    orderFinalized: boolean;
    orderId: string;
    orderDate: Date;
    source: string;
    utmSource: string;
    utmMedium: string;
    utmCampaign: string;
    sessionId: string;
  };
}

const ConfiguratorSection = React.memo(function ConfiguratorSection() {
  // Użyj HybridSessionManager do zarządzania sesją
  const sessionId = useMemo(() => HybridSessionManager.getSessionId(), []);

  // Klucze dla localStorage z unikalnym ID sesji
  const localStorageKeys = useMemo(() => ({
    configuratorState: `configurator-state-${sessionId}`,
    configuratorDictionary: `configurator-dictionary-${sessionId}`,
  }), [sessionId]);

  const [state, setState] = useState<ConfiguratorState>({
    selectedCarpet: 0,
    selectedEdge: 0,
    selectedTexture: 0,
    selectedConfig: 0,
    selected3DVariant: 0,
    brand: "",
    model: "",
    year: "",
    body: "",
    trans: "",
  });

  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [isConfigurationComplete, setIsConfigurationComplete] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [threeDMats, setThreeDMats] = useState<MatsData[]>([]);
  const [selectedMat, setSelectedMat] = useState<MatsData | null>(null);
  const [isLoadingMats, setIsLoadingMats] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Słownik konfiguracji - dynamicznie przechowuje dane z każdego etapu konfiguratora
  const [configuratorDictionary, setConfiguratorDictionary] = useState<ConfiguratorDictionary>({
    carSelection: {
      brand: '',
      model: '',
      year: '',
      body: '',
      trans: '',
      isComplete: false,
    },
    configuration: {
      selectedConfig: 0,
      configName: '',
      configPrice: 0,
      isComplete: false,
    },
    customization: {
      selectedCarpet: 0,
      carpetColor: '',
      carpetColorName: '',
      selectedEdge: 0,
      edgeColor: '',
      edgeColorName: '',
      selectedTexture: 0,
      textureName: '',
      texturePrice: 0,
      selected3DVariant: 0,
      variantName: '',
      variantPrice: 0,
      selectedMatImage: '',
      isComplete: false,
    },
    summary: {
      totalPrice: 0,
      isComplete: false,
    },
    customer: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      country: 'Polska',
      isComplete: false,
    },
    shipping: {
      method: '',
      methodName: '',
      cost: 0,
      estimatedDelivery: '',
      isComplete: false,
    },
    payment: {
      method: '',
      methodName: '',
      isComplete: false,
    },
    company: {
      name: '',
      nip: '',
      isInvoice: false,
      isComplete: false,
    },
    additional: {
      termsAccepted: false,
      newsletter: false,
      discountCode: '',
      discountApplied: false,
      discountAmount: 0,
      notes: '',
    },
          metadata: {
        currentStep: 1,
        lastUpdated: new Date(),
        isConfigurationComplete: false,
        orderFinalized: false,
        orderId: '',
        orderDate: new Date(),
        source: 'eva-website',
        utmSource: '',
        utmMedium: '',
        utmCampaign: '',
        sessionId: sessionId,
      },
  });

  // Auto-save functionality z izolacją per-sesja
  useEffect(() => {
    // Sprawdź czy jesteśmy po stronie klienta i czy sessionId jest prawidłowy
    if (typeof window !== 'undefined' && sessionId && !sessionId.startsWith('temp-')) {
      const savedConfig = localStorage.getItem(localStorageKeys.configuratorState);
      if (savedConfig) {
        try {
          const parsedConfig = JSON.parse(savedConfig);
          setState(parsedConfig);
          console.log('📋 Przywrócono konfigurację dla sesji:', sessionId);
        } catch (error) {
          console.log('No saved configuration found for this session');
        }
      }
    }
  }, [localStorageKeys.configuratorState, sessionId]);



  // Auto-save dla stanu konfiguratora używając HybridSessionManager
  useEffect(() => {
    if (HybridSessionManager.isValidSession(sessionId)) {
      HybridSessionManager.saveConfigData(sessionId, state);
    }
  }, [state, sessionId]);

  // Auto-load dla stanu konfiguratora
  useEffect(() => {
    if (HybridSessionManager.isValidSession(sessionId)) {
      const savedState = HybridSessionManager.getConfigData(sessionId);
      if (savedState) {
        setState(savedState);
        console.log('📋 Przywrócono stan konfiguratora dla sesji:', sessionId);
      }
    }
  }, [sessionId]);

  // Auto-save dla słownika konfiguracji
  useEffect(() => {
    if (HybridSessionManager.isValidSession(sessionId)) {
      HybridSessionManager.saveOrderData(sessionId, configuratorDictionary);
    }
  }, [configuratorDictionary, sessionId]);

  // Auto-load dla słownika konfiguracji
  useEffect(() => {
    if (HybridSessionManager.isValidSession(sessionId)) {
      const savedDictionary = HybridSessionManager.getOrderData(sessionId);
      if (savedDictionary) {
        setConfiguratorDictionary(savedDictionary);
        console.log('📋 Przywrócono słownik dla sesji:', sessionId);
      }
    }
  }, [sessionId]);

  // Check if configuration is complete
  useEffect(() => {
    const isComplete = state.brand && state.model && state.year && state.body && state.trans;
    setIsConfigurationComplete(!!isComplete);
  }, [state.brand, state.model, state.year, state.body, state.trans]);



  // Fetch mats when edge color, 3D variant, or texture changes with debouncing
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      const edgeColorName = edgeColors[state.selectedEdge].name.toLowerCase();
      if (edgeColorName === 'czarny') {
        fetchMatsWithBlackEdging('black');
      } else {
        setThreeDMats([]);
        setSelectedMat(null);
      }
    }, 300); // 300ms debounce

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [state.selectedEdge, state.selected3DVariant, state.selectedTexture]);

  const updateState = useCallback((updates: Partial<ConfiguratorState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Funkcja do aktualizacji słownika konfiguracji
  const updateConfiguratorDictionary = useCallback((step: string, data: any) => {
    setConfiguratorDictionary(prev => {
      const updated = { ...prev };
      
      switch (step) {
        case 'carSelection':
          updated.carSelection = {
            ...updated.carSelection,
            ...data,
            isComplete: !!(data.brand && data.model && data.year && data.body && data.trans)
          };
          break;
          
        case 'configuration':
          updated.configuration = {
            ...updated.configuration,
            ...data,
            isComplete: data.selectedConfig > 0
          };
          break;
          
        case 'customization':
          updated.customization = {
            ...updated.customization,
            ...data,
            isComplete: !!(data.selectedCarpet > 0 && data.selectedEdge > 0 && data.selectedTexture > 0 && data.selected3DVariant >= 0)
          };
          break;
          
        case 'summary':
          updated.summary = {
            ...updated.summary,
            ...data,
            isComplete: true
          };
          break;
          
        case 'customer':
          updated.customer = {
            ...updated.customer,
            ...data,
            isComplete: !!(data.firstName && data.lastName && data.email && data.phone && data.address && data.city && data.postalCode)
          };
          break;
          
        case 'shipping':
          updated.shipping = {
            ...updated.shipping,
            ...data,
            isComplete: !!(data.method && data.methodName)
          };
          break;
          
        case 'payment':
          updated.payment = {
            ...updated.payment,
            ...data,
            isComplete: !!(data.method && data.methodName)
          };
          break;
          
        case 'company':
          updated.company = {
            ...updated.company,
            ...data,
            isComplete: data.isInvoice ? !!(data.name && data.nip) : true
          };
          break;
          
        case 'additional':
          updated.additional = {
            ...updated.additional,
            ...data
          };
          break;
      }
      
      updated.metadata.lastUpdated = new Date();
      updated.metadata.isConfigurationComplete = 
        updated.carSelection.isComplete && 
        updated.configuration.isComplete && 
        updated.customization.isComplete;
      
      return updated;
    });
  }, []);

  // Funkcja do auto-scroll do podglądu
  const scrollToPreview = useCallback(() => {
    setTimeout(() => {
      const previewElement = document.getElementById('main-preview');
      if (previewElement) {
        previewElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
  }, []);

  // Funkcja do zmiany koloru dywanika
  const handleCarpetColorChange = useCallback((colorIndex: number) => {
    updateState({ selectedCarpet: colorIndex });
    
    // Jeśli mamy dostępne dywaniki z czarnym obszyciem, zmień główny obrazek
    if (threeDMats.length > 0) {
      const colorName = carpetColors[colorIndex].name.toLowerCase();
      const colorKey = Object.keys(colorMapping).find(key => 
        colorMapping[key].name.toLowerCase() === colorName
      );
      
      if (colorKey) {
        const matchingMat = threeDMats.find(mat => mat.color === colorKey);
        if (matchingMat) {
          setSelectedMat(matchingMat);
        }
      }
    }
    
    // Auto-scroll do głównego podglądu
    scrollToPreview();
  }, [threeDMats, updateState, scrollToPreview]);

  // Funkcja do pobierania dywaników z czarnym obszyciem
  const fetchMatsWithBlackEdging = useCallback(async (edgeColor: string) => {
    if (edgeColor === 'black') {
      setIsLoadingMats(true);
      try {
        let matType = 'classic'; // Domyślnie klasyczne dla "3D bez rantów"
        
        // Sprawdź czy wybrano wariant 3D
        if (state.selected3DVariant === 0) { // "3D Z rantami"
          matType = '3d';
        } else if (state.selected3DVariant === 1) { // "3D bez rantów"
          matType = 'classic'; // Używamy klasycznych dla "3D bez rantów"
        }
        
        const response = await fetch(`/api/mats/3d?edgeColor=${edgeColor}&cellType=diamonds&type=${matType}`);
        const data = await response.json();
        if (data.success) {
          setThreeDMats(data.data);
          if (data.data.length > 0) {
            setSelectedMat(data.data[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching mats:', error);
      } finally {
        setIsLoadingMats(false);
      }
    } else {
      setThreeDMats([]);
      setSelectedMat(null);
    }
  }, [state.selected3DVariant]);

  const resetConfiguration = useCallback(() => {
    setState({
      selectedCarpet: 0,
      selectedEdge: 0,
      selectedTexture: 0,
      selectedConfig: 0,
      selected3DVariant: 0,
      brand: "",
      model: "",
      year: "",
      body: "",
      trans: "",
    });
    
    // Resetuj słownik konfiguracji
    setConfiguratorDictionary({
      carSelection: {
        brand: '',
        model: '',
        year: '',
        body: '',
        trans: '',
        isComplete: false,
      },
      configuration: {
        selectedConfig: 0,
        configName: '',
        configPrice: 0,
        isComplete: false,
      },
      customization: {
        selectedCarpet: 0,
        carpetColor: '',
        carpetColorName: '',
        selectedEdge: 0,
        edgeColor: '',
        edgeColorName: '',
        selectedTexture: 0,
        textureName: '',
        texturePrice: 0,
        selected3DVariant: 0,
        variantName: '',
        variantPrice: 0,
        selectedMatImage: '',
        isComplete: false,
      },
      summary: {
        totalPrice: 0,
        isComplete: false,
      },
      customer: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'Polska',
        isComplete: false,
      },
      shipping: {
        method: '',
        methodName: '',
        cost: 0,
        estimatedDelivery: '',
        isComplete: false,
      },
      payment: {
        method: '',
        methodName: '',
        isComplete: false,
      },
      company: {
        name: '',
        nip: '',
        isInvoice: false,
        isComplete: false,
      },
      additional: {
        termsAccepted: false,
        newsletter: false,
        discountCode: '',
        discountApplied: false,
        discountAmount: 0,
        notes: '',
      },
      metadata: {
        currentStep: 1,
        lastUpdated: new Date(),
        isConfigurationComplete: false,
        orderFinalized: false,
        orderId: '',
        orderDate: new Date(),
        source: 'eva-website',
        utmSource: '',
        utmMedium: '',
        utmCampaign: '',
        sessionId: sessionId,
      },
    });
    
    // Wyczyść dane używając HybridSessionManager
    if (HybridSessionManager.isValidSession(sessionId)) {
      HybridSessionManager.clearSession(sessionId);
    }
    
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 2000);
    setCurrentStep(1);
  }, [sessionId, localStorageKeys]);

  // Funkcja do debugowania sesji (tylko w trybie development)
  const debugSession = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🆔 Session ID:', sessionId);
      console.log('🔑 LocalStorage keys:', localStorageKeys);
      console.log('💾 Saved state:', localStorage.getItem(localStorageKeys.configuratorState));
      console.log('📋 Saved dictionary:', localStorage.getItem(localStorageKeys.configuratorDictionary));
    }
  }, [sessionId, localStorageKeys]);

  // Funkcja do czyszczenia starych sesji (tylko w trybie development)
  const cleanupOldSessions = useCallback(() => {
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      const keys = Object.keys(localStorage);
      const sessionKeys = keys.filter(key => key.includes('configurator-'));
      const oldSessions = sessionKeys.filter(key => {
        const sessionIdFromKey = key.split('-').slice(-4).join('-');
        return !sessionIdFromKey.includes(sessionId);
      });
      
      if (oldSessions.length > 0) {
        console.log('🧹 Czyszczenie starych sesji:', oldSessions);
        oldSessions.forEach(key => localStorage.removeItem(key));
      }
    }
  }, [sessionId]);

  const calculateTotalPrice = useCallback(() => {
    const basePrice = configurations[state.selectedConfig].price;
    const texturePrice = textures[state.selectedTexture].price;
    const variantPrice = threeDVariants[state.selected3DVariant].price;
    return basePrice + texturePrice + variantPrice;
  }, [state.selectedConfig, state.selectedTexture, state.selected3DVariant]);

  // Funkcja do przygotowania danych do wysłania do Bitrix24
  const prepareBitrixData = useCallback(() => {
    return {
      customer: {
        firstName: configuratorDictionary.customer.firstName,
        lastName: configuratorDictionary.customer.lastName,
        email: configuratorDictionary.customer.email,
        phone: configuratorDictionary.customer.phone,
        address: `${configuratorDictionary.customer.address}, ${configuratorDictionary.customer.postalCode} ${configuratorDictionary.customer.city}, ${configuratorDictionary.customer.country}`,
      },
      carDetails: {
        brand: configuratorDictionary.carSelection.brand,
        model: configuratorDictionary.carSelection.model,
        year: configuratorDictionary.carSelection.year,
        body: configuratorDictionary.carSelection.body,
        trans: configuratorDictionary.carSelection.trans,
      },
      productDetails: {
        type: configuratorDictionary.customization.variantName.includes('3D') ? '3D' : 'klasyczny',
        color: configuratorDictionary.customization.carpetColorName,
        texture: configuratorDictionary.customization.textureName,
        variant: configuratorDictionary.customization.variantName,
        edgeColor: configuratorDictionary.customization.edgeColorName,
        image: configuratorDictionary.customization.selectedMatImage,
      },
      shipping: {
        method: configuratorDictionary.shipping.method,
        methodName: configuratorDictionary.shipping.methodName,
        cost: configuratorDictionary.shipping.cost,
        estimatedDelivery: configuratorDictionary.shipping.estimatedDelivery,
      },
      payment: {
        method: configuratorDictionary.payment.method,
        methodName: configuratorDictionary.payment.methodName,
      },
      company: {
        name: configuratorDictionary.company.name,
        nip: configuratorDictionary.company.nip,
        isInvoice: configuratorDictionary.company.isInvoice,
      },
      pricing: {
        subtotal: configuratorDictionary.summary.totalPrice,
        shippingCost: configuratorDictionary.shipping.cost,
        discountAmount: configuratorDictionary.additional.discountAmount,
        totalAmount: configuratorDictionary.summary.totalPrice + configuratorDictionary.shipping.cost - configuratorDictionary.additional.discountAmount,
      },
      additional: {
        termsAccepted: configuratorDictionary.additional.termsAccepted,
        newsletter: configuratorDictionary.additional.newsletter,
        discountCode: configuratorDictionary.additional.discountCode,
        discountApplied: configuratorDictionary.additional.discountApplied,
        notes: configuratorDictionary.additional.notes,
      },
      metadata: {
        orderId: configuratorDictionary.metadata.orderId,
        orderDate: configuratorDictionary.metadata.orderDate,
        source: configuratorDictionary.metadata.source,
        utmSource: configuratorDictionary.metadata.utmSource,
        utmMedium: configuratorDictionary.metadata.utmMedium,
        utmCampaign: configuratorDictionary.metadata.utmCampaign,
      },
    };
  }, [configuratorDictionary]);

  // Funkcja do wysłania zamówienia do Bitrix24
  const sendOrderToBitrix = useCallback(async () => {
    try {
      const bitrixData = prepareBitrixData();
      
      console.log('📤 Wysyłanie zamówienia do Bitrix24:', bitrixData);
      
      const response = await fetch('/api/bitrix/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bitrixData)
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Zamówienie zostało pomyślnie wysłane do Bitrix24');
        return result;
      } else {
        console.error('❌ Błąd podczas wysyłania zamówienia:', result.error);
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ Błąd podczas wysyłania zamówienia do Bitrix24:', error);
      throw error;
    }
  }, [prepareBitrixData]);

  // Funkcja do finalizacji zamówienia - wywoływana przy kliknięciu "DODAJ DO KOSZYKA"
  const finalizeOrder = useCallback(async () => {
    try {
      // Generuj unikalny ID zamówienia
      const orderId = `EVA-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      // Aktualizuj słownik z finalnymi danymi konfiguracji
      const finalDictionary = {
        ...configuratorDictionary,
        metadata: {
          ...configuratorDictionary.metadata,
          orderFinalized: true,
          lastUpdated: new Date(),
          orderId: orderId,
          orderDate: new Date(),
          sessionId: sessionId, // Dodaj sessionId do metadanych
        }
      };
      
      setConfiguratorDictionary(finalDictionary);
      
      console.log('📋 Finalny słownik konfiguracji:', finalDictionary);
      console.log('📤 Dane do Bitrix24:', prepareBitrixData());
      console.log('🆔 Session ID:', sessionId);
      
      // Przekieruj do strony finalizacji zamówienia z danymi
      const orderData = encodeURIComponent(JSON.stringify(finalDictionary));
      window.location.href = `/checkout?orderData=${orderData}&sessionId=${sessionId}`;
      
    } catch (error) {
      console.error('❌ Błąd podczas finalizacji zamówienia:', error);
      alert('❌ Wystąpił błąd podczas finalizacji zamówienia');
    }
  }, [configuratorDictionary, prepareBitrixData, sessionId]);

  const getProgressPercentage = useMemo(() => {
    const steps = [state.brand, state.model, state.year, state.body, state.trans];
    const completedSteps = steps.filter(step => step).length;
    return (completedSteps / steps.length) * 100;
  }, [state.brand, state.model, state.year, state.body, state.trans]);

  const nextStep = useCallback(() => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  }, [currentStep]);

  // Automatyczna aktualizacja słownika konfiguracji
  useEffect(() => {
    // Aktualizuj dane samochodu
    updateConfiguratorDictionary('carSelection', {
      brand: state.brand,
      model: state.model,
      year: state.year,
      body: state.body,
      trans: state.trans,
    });
  }, [state.brand, state.model, state.year, state.body, state.trans, updateConfiguratorDictionary]);

  // Aktualizuj konfigurację
  useEffect(() => {
    updateConfiguratorDictionary('configuration', {
      selectedConfig: state.selectedConfig,
      configName: configurations[state.selectedConfig]?.name || '',
      configPrice: configurations[state.selectedConfig]?.price || 0,
    });
  }, [state.selectedConfig, updateConfiguratorDictionary]);

  // Aktualizuj personalizację
  useEffect(() => {
    updateConfiguratorDictionary('customization', {
      selectedCarpet: state.selectedCarpet,
      carpetColor: carpetColors[state.selectedCarpet]?.color || '',
      carpetColorName: carpetColors[state.selectedCarpet]?.name || '',
      selectedEdge: state.selectedEdge,
      edgeColor: edgeColors[state.selectedEdge]?.color || '',
      edgeColorName: edgeColors[state.selectedEdge]?.name || '',
      selectedTexture: state.selectedTexture,
      textureName: textures[state.selectedTexture]?.name || '',
      texturePrice: textures[state.selectedTexture]?.price || 0,
      selected3DVariant: state.selected3DVariant,
      variantName: threeDVariants[state.selected3DVariant]?.name || '',
      variantPrice: threeDVariants[state.selected3DVariant]?.price || 0,
      selectedMatImage: selectedMat?.image || '',
    });
  }, [state.selectedCarpet, state.selectedEdge, state.selectedTexture, state.selected3DVariant, selectedMat, updateConfiguratorDictionary]);

  // Aktualizuj podsumowanie
  useEffect(() => {
    const totalPrice = calculateTotalPrice();
    updateConfiguratorDictionary('summary', {
      totalPrice,
    });
  }, [calculateTotalPrice, updateConfiguratorDictionary]);

  // Aktualizuj metadane
  useEffect(() => {
    setConfiguratorDictionary(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        currentStep,
        lastUpdated: new Date(),
      }
    }));
  }, [currentStep]);

  const Tooltip = useMemo(() => ({ children, content }: { children: React.ReactNode; content: string }) => (
    <div className="relative group">
      {children}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
        {content}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  ), []);

  const steps = [
    { id: 1, name: "Wybór samochodu", icon: Car, completed: !!(state.brand && state.model && state.year && state.body && state.trans) },
    { id: 2, name: "Konfiguracja", icon: Settings, completed: !!(state.selectedConfig !== 0) },
    { id: 3, name: "Kolory i tekstury", icon: Palette, completed: !!(state.selectedCarpet !== 0 || state.selectedTexture !== 0) },
    { id: 4, name: "Podsumowanie", icon: Check, completed: isConfigurationComplete }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-2 mb-4">
            <Zap className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm font-medium">Konfigurator 3D</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Konfigurator Dywaników
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Stwórz idealne dywaniki dla swojego samochodu w 4 prostych krokach
          </p>
        </div>

        {/* Enhanced Step Navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-3">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                    currentStep === step.id 
                      ? "border-red-500 bg-red-500 text-white" 
                      : step.completed 
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-gray-600 bg-gray-800 text-gray-400"
                  }`}>
                    {step.completed ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                  </div>
                  <div className="hidden md:block">
                    <div className={`text-sm font-medium transition-colors duration-300 ${
                      currentStep === step.id ? "text-white" : step.completed ? "text-green-400" : "text-gray-400"
                    }`}>
                      {step.name}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 transition-all duration-300 ${
                      step.completed ? "bg-green-500" : "bg-gray-600"
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isPreviewMode 
                    ? "bg-red-500/20 text-red-400 border border-red-500/30" 
                    : "bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700"
                }`}
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Podgląd</span>
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Main Layout - Preview Left, Configuration Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Preview Panel - Left Side */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="relative group">
                <div className="w-full h-full min-h-[600px] relative rounded-xl overflow-hidden border-2 border-red-500/50 shadow-xl shadow-red-500/10 transition-all duration-300 group-hover:border-red-400">
                  <Image 
                    src={selectedMat?.image || "/images/konfigurator/dywanik.jpg"} 
                    alt="Podgląd dywanika" 
                    fill 
                    className="object-cover transition-transform duration-300 group-hover:scale-105" 
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  
                  {/* Enhanced Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  <div className="absolute top-4 left-4 bg-black/80 backdrop-blur rounded-xl p-4 text-white">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ 
                          background: selectedMat ? colorMapping[selectedMat.color]?.color || "#ccc" : carpetColors[state.selectedCarpet].color 
                        }}></div>
                        <span className="text-sm font-medium">
                          {selectedMat ? colorMapping[selectedMat.color]?.name || selectedMat.color : carpetColors[state.selectedCarpet].name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-red-400" />
                        <span className="text-sm">{threeDVariants[state.selected3DVariant].name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4 text-red-400" />
                        <span className="text-sm">{textures[state.selectedTexture].name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Price Badge */}
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                    {calculateTotalPrice()} zł
                  </div>
                </div>
                
                {/* Enhanced Thumbnail Gallery */}
                <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
                  {configurations.map((config, index) => (
                    <button
                      key={config.name}
                      onClick={() => updateState({ selectedConfig: index })}
                      className={`flex-shrink-0 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                        state.selectedConfig === index 
                          ? "border-red-500 ring-2 ring-red-500/50 shadow-lg shadow-red-500/25" 
                          : "border-gray-700 hover:border-red-400"
                      }`}
                      style={{ width: 80, height: 60 }}
                    >
                      <Image 
                        src={config.img} 
                        alt={config.name} 
                        width={76} 
                        height={56} 
                        className="object-cover rounded-lg" 
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Configuration Panel - Right Side */}
          <div className="lg:col-span-1">
            {/* Price Summary - Top of Configuration */}
            <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl p-3 mb-3">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Star className="w-5 h-5 text-red-400" />
                  Podsumowanie ceny
                </h3>
                <div className="text-right">
                  <div className="text-red-400 font-bold text-2xl">{calculateTotalPrice()} zł</div>
                  <div className="text-gray-400 text-sm">Cena całkowita</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Zestaw:</span>
                  <span className="text-white">{configurations[state.selectedConfig].price} zł</span>
                </div>
                {textures[state.selectedTexture].price > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-300">Tekstura:</span>
                    <span className="text-white">+{textures[state.selectedTexture].price} zł</span>
                  </div>
                )}
                {threeDVariants[state.selected3DVariant].price > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-300">Wariant 3D:</span>
                    <span className="text-white">+{threeDVariants[state.selected3DVariant].price} zł</span>
                  </div>
                )}
              </div>
            </div>

            {/* Step Content */}
            <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl p-4">
                              {currentStep === 1 && (
                  <div className="space-y-6">
                  <div className="text-center mb-6">
                    <Car className="w-10 h-10 text-red-400 mx-auto mb-3" />
                    <h2 className="text-xl font-bold text-white mb-2">Wybór samochodu</h2>
                    <p className="text-gray-300 text-sm">Wybierz markę, model i specyfikację swojego auta</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-white font-medium mb-3">Marka samochodu</label>
                        <select 
                          className="w-full border rounded-xl px-4 py-3 bg-gray-800 text-white border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/50 transition-all duration-200"
                          value={state.brand} 
                          onChange={e => updateState({ brand: e.target.value, model: "", year: "", body: "", trans: "" })}
                        >
                          <option value="">Wybierz markę</option>
                          {carBrands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-white font-medium mb-3">Model</label>
                        <select 
                          className="w-full border rounded-xl px-4 py-3 bg-gray-800 text-white border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/50 transition-all duration-200 disabled:opacity-50"
                          value={state.model} 
                          onChange={e => updateState({ model: e.target.value, year: "", body: "", trans: "" })}
                          disabled={!state.brand}
                        >
                          <option value="">Wybierz model</option>
                          {carModels.map(model => <option key={model} value={model}>{model}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-white font-medium mb-3">Rocznik</label>
                        <select 
                          className="w-full border rounded-xl px-4 py-3 bg-gray-800 text-white border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/50 transition-all duration-200 disabled:opacity-50"
                          value={state.year} 
                          onChange={e => updateState({ year: e.target.value, body: "", trans: "" })}
                          disabled={!state.model}
                        >
                          <option value="">Wybierz rocznik</option>
                          {carYears.map(year => <option key={year} value={year}>{year}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-white font-medium mb-3">Nadwozie</label>
                        <select 
                          className="w-full border rounded-xl px-4 py-3 bg-gray-800 text-white border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/50 transition-all duration-200 disabled:opacity-50"
                          value={state.body} 
                          onChange={e => updateState({ body: e.target.value, trans: "" })}
                          disabled={!state.year}
                        >
                          <option value="">Wybierz nadwozie</option>
                          {carBodies.map(body => <option key={body} value={body}>{body}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-white font-medium mb-3">Skrzynia biegów</label>
                        <select 
                          className="w-full border rounded-xl px-4 py-3 bg-gray-800 text-white border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/50 transition-all duration-200 disabled:opacity-50"
                          value={state.trans} 
                          onChange={e => updateState({ trans: e.target.value })}
                          disabled={!state.body}
                        >
                          <option value="">Wybierz skrzynię</option>
                          {carTransmissions.map(trans => <option key={trans} value={trans}>{trans}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

                              {currentStep === 2 && (
                  <div className="space-y-6">
                  <div className="text-center mb-6">
                    <Settings className="w-10 h-10 text-red-400 mx-auto mb-3" />
                    <h2 className="text-xl font-bold text-white mb-2">Konfiguracja zestawu</h2>
                    <p className="text-gray-300 text-sm">Wybierz rodzaj zestawu dywaników</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {configurations.map((config, idx) => (
                      <button
                        key={config.name}
                        onClick={() => updateState({ selectedConfig: idx })}
                        className={`rounded-xl border-2 p-4 transition-all duration-300 hover:scale-105 ${
                          state.selectedConfig === idx
                            ? "border-red-500 ring-2 ring-red-500/50 bg-red-500/10 shadow-lg shadow-red-500/25"
                            : "border-gray-700 hover:border-red-400 bg-gray-800"
                        }`}
                      >
                        <Image
                          src={config.img}
                          alt={config.name}
                          width={120}
                          height={80}
                          className="object-contain rounded-lg mb-3"
                        />
                        <div className="text-center">
                          <div className="text-white font-medium mb-1">{config.name}</div>
                          <div className="text-gray-400 text-sm mb-2">{config.description}</div>
                          <div className="text-red-400 font-bold">{config.price} zł</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

                              {currentStep === 3 && (
                  <div className="space-y-4">
                  <div className="text-center mb-4">
                    <Palette className="w-8 h-8 text-red-400 mx-auto mb-2" />
                    <h2 className="text-lg font-bold text-white mb-1">Kolory i tekstury</h2>
                    <p className="text-gray-300 text-xs">Dostosuj wygląd swoich dywaników</p>
                  </div>

                  {/* Wariant 3D */}
                  <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2 text-base">
                      <Shield className="w-5 h-5 text-red-400" />
                      Wariant 3D
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {threeDVariants.map((variant, index) => (
                        <Tooltip key={variant.name} content={variant.description}>
                          <button
                            onClick={() => updateState({ selected3DVariant: index })}
                            className={`group relative rounded-lg border-2 p-3 transition-all duration-300 hover:scale-105 ${
                              state.selected3DVariant === index 
                                ? "border-red-500 ring-2 ring-red-500/50 bg-red-500/10 shadow-lg shadow-red-500/25" 
                                : "border-gray-700 hover:border-red-400 bg-gray-800/50 hover:bg-gray-800"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0">
                                <Image 
                                  src={variant.image} 
                                  alt={variant.name} 
                                  width={40} 
                                  height={40} 
                                  className="object-contain" 
                                  loading="lazy"
                                />
                              </div>
                              <div className="flex-1 text-left">
                                <div className="text-white font-medium mb-1 text-sm">{variant.name}</div>
                                <div className="text-gray-300 text-xs mb-1">{variant.description}</div>
                                {variant.price > 0 && (
                                  <div className="text-red-400 text-xs font-medium">+{variant.price} zł</div>
                                )}
                              </div>
                            </div>
                          </button>
                        </Tooltip>
                      ))}
                    </div>
                  </div>

                                    {/* Kolory */}
                  <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2 text-base">
                      <Palette className="w-5 h-5 text-red-400" />
                      Kolory
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-200 font-medium mb-3 text-sm">Kolor dywanika</label>
                        <div className="grid grid-cols-8 gap-2">
                          {carpetColors.map((color, index) => (
                            <Tooltip key={color.name} content={color.name}>
                              <button
                                onClick={() => handleCarpetColorChange(index)}
                                className={`w-10 h-10 rounded-full border-2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500/50 ${
                                  state.selectedCarpet === index 
                                    ? "border-red-500 ring-2 ring-red-500/50 shadow-lg shadow-red-500/25" 
                                    : "border-gray-700 hover:border-red-400"
                                }`}
                                style={{ background: color.color }}
                              />
                            </Tooltip>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-200 font-medium mb-3 text-sm">Kolor obszycia</label>
                        <div className="grid grid-cols-8 gap-2">
                          {edgeColors.map((color, index) => (
                            <Tooltip key={color.name} content={color.name}>
                              <button
                                onClick={() => updateState({ selectedEdge: index })}
                                className={`w-10 h-10 rounded-full border-2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500/50 ${
                                  state.selectedEdge === index 
                                    ? "border-red-500 ring-2 ring-red-500/50 shadow-lg shadow-red-500/25" 
                                    : "border-gray-700 hover:border-red-400"
                                }`}
                                style={{ background: color.color }}
                              />
                            </Tooltip>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>



                  {/* Tekstury */}
                  <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2 text-base">
                      <Settings className="w-5 h-5 text-red-400" />
                      Tekstura
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {textures.map((texture, index) => (
                        <Tooltip key={texture.name} content={texture.description}>
                          <button
                            onClick={() => updateState({ selectedTexture: index })}
                            className={`group relative rounded-lg border-2 p-3 transition-all duration-300 hover:scale-105 ${
                              state.selectedTexture === index 
                                ? "border-red-500 ring-2 ring-red-500/50 bg-red-500/10 shadow-lg shadow-red-500/25" 
                                : "border-gray-700 hover:border-red-400 bg-gray-800/50 hover:bg-gray-800"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0">
                                <Image 
                                  src={texture.img} 
                                  alt={texture.name} 
                                  width={40} 
                                  height={40} 
                                  className="object-contain" 
                                  loading="lazy"
                                />
                              </div>
                              <div className="flex-1 text-left">
                                <div className="text-white font-medium mb-1 text-sm">{texture.name}</div>
                                <div className="text-gray-300 text-xs mb-1">{texture.description}</div>
                                {texture.price > 0 && (
                                  <div className="text-red-400 text-xs font-medium">+{texture.price} zł</div>
                                )}
                              </div>
                            </div>
                          </button>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                </div>
              )}

                              {currentStep === 4 && (
                  <div className="space-y-6">
                  <div className="text-center mb-6">
                    <Check className="w-10 h-10 text-green-400 mx-auto mb-3" />
                    <h2 className="text-xl font-bold text-white mb-2">Podsumowanie</h2>
                    <p className="text-gray-300 text-sm">Sprawdź swoją konfigurację przed dodaniem do koszyka</p>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-xl p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-white font-semibold mb-3">Szczegóły samochodu</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-300">Marka:</span>
                            <span className="text-white">{state.brand}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Model:</span>
                            <span className="text-white">{state.model}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Rocznik:</span>
                            <span className="text-white">{state.year}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Nadwozie:</span>
                            <span className="text-white">{state.body}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Skrzynia:</span>
                            <span className="text-white">{state.trans}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-white font-semibold mb-3">Konfiguracja dywaników</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-300">Zestaw:</span>
                            <span className="text-white">{configurations[state.selectedConfig].name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Kolor dywanika:</span>
                            <span className="text-white">{carpetColors[state.selectedCarpet].name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Kolor obszycia:</span>
                            <span className="text-white">{edgeColors[state.selectedEdge].name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Tekstura:</span>
                            <span className="text-white">{textures[state.selectedTexture].name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Wariant 3D:</span>
                            <span className="text-white">{threeDVariants[state.selected3DVariant].name}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  

                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-3">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md font-medium transition-all duration-200 text-sm ${
                    currentStep === 1
                      ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                      : "bg-gray-800 text-white hover:bg-gray-700"
                  }`}
                >
                  <ChevronLeft className="w-3 h-3" />
                  Wstecz
                </button>

                {currentStep < 4 ? (
                  <button
                    onClick={nextStep}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md font-medium transition-all duration-200 text-sm"
                  >
                    Dalej
                    <ChevronRight className="w-3 h-3" />
                  </button>
                ) : (
                  <button 
                    onClick={finalizeOrder}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md font-medium transition-all duration-200 text-sm ${
                      isConfigurationComplete
                        ? "bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white shadow-lg hover:shadow-red-500/25 transform hover:scale-105"
                        : "bg-gray-700 text-gray-400 cursor-not-allowed"
                    }`}
                    disabled={!isConfigurationComplete}
                  >
                    <ShoppingCart className="w-3 h-3" />
                    DODAJ DO KOSZYKA
                  </button>
                )}
              </div>
            </div>
            
            {/* Reset Button */}
            <div className="mt-3">
              <button
                onClick={resetConfiguration}
                className="w-full flex items-center justify-center gap-1 px-2 py-1.5 text-gray-300 hover:text-white transition-colors duration-200 border border-gray-700 rounded-md hover:border-gray-600 text-xs"
              >
                <RotateCcw className="w-3 h-3" />
                Resetuj konfigurację
              </button>
              
              {showSavedMessage && (
                <div className="flex items-center gap-2 text-green-400 text-sm p-3 bg-green-500/10 border border-green-500/20 rounded-xl mt-4">
                  <Save className="w-4 h-4" />
                  <span>Konfiguracja zresetowana</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ConfiguratorSection; 