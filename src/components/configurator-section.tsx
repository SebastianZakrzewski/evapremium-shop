"use client";
import React, { useState, useEffect } from "react";
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

export default function ConfiguratorSection() {
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

  // Auto-save functionality
  useEffect(() => {
    const savedConfig = localStorage.getItem('configurator-state');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setState(parsedConfig);
      } catch (error) {
        console.log('No saved configuration found');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('configurator-state', JSON.stringify(state));
  }, [state]);

  // Check if configuration is complete
  useEffect(() => {
    const isComplete = state.brand && state.model && state.year && state.body && state.trans;
    setIsConfigurationComplete(!!isComplete);
  }, [state.brand, state.model, state.year, state.body, state.trans]);

  // Fetch mats when edge color, 3D variant, or texture changes
  useEffect(() => {
    const edgeColorName = edgeColors[state.selectedEdge].name.toLowerCase();
    if (edgeColorName === 'czarny') {
      fetchMatsWithBlackEdging('black');
    } else {
      setThreeDMats([]);
      setSelectedMat(null);
    }
  }, [state.selectedEdge, state.selected3DVariant, state.selectedTexture]);

  const updateState = (updates: Partial<ConfiguratorState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  // Funkcja do zmiany koloru dywanika
  const handleCarpetColorChange = (colorIndex: number) => {
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
  };

  // Funkcja do pobierania dywaników z czarnym obszyciem
  const fetchMatsWithBlackEdging = async (edgeColor: string) => {
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
  };

  const resetConfiguration = () => {
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
    localStorage.removeItem('configurator-state');
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 2000);
    setCurrentStep(1);
  };

  const calculateTotalPrice = () => {
    const basePrice = configurations[state.selectedConfig].price;
    const texturePrice = textures[state.selectedTexture].price;
    const variantPrice = threeDVariants[state.selected3DVariant].price;
    return basePrice + texturePrice + variantPrice;
  };

  const getProgressPercentage = () => {
    const steps = [state.brand, state.model, state.year, state.body, state.trans];
    const completedSteps = steps.filter(step => step).length;
    return (completedSteps / steps.length) * 100;
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const Tooltip = ({ children, content }: { children: React.ReactNode; content: string }) => (
    <div className="relative group">
      {children}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
        {content}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );

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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Enhanced Preview Panel */}
          <div className="lg:col-span-3 space-y-6 max-w-4xl">
                          <div className="relative group">
                <div className="w-full aspect-[4/3] relative rounded-2xl overflow-hidden border-2 border-red-500/50 shadow-2xl shadow-red-500/10 transition-all duration-300 group-hover:border-red-400">
                <Image 
                  src={selectedMat?.image || "/images/konfigurator/dywanik.jpg"} 
                  alt="Podgląd dywanika" 
                  fill 
                  className="object-cover transition-transform duration-300 group-hover:scale-105" 
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
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                {configurations.map((config, index) => (
                  <button
                    key={config.name}
                    onClick={() => updateState({ selectedConfig: index })}
                    className={`flex-shrink-0 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                      state.selectedConfig === index 
                        ? "border-red-500 ring-2 ring-red-500/50 shadow-lg shadow-red-500/25" 
                        : "border-gray-700 hover:border-red-400"
                    }`}
                    style={{ width: 100, height: 80 }}
                  >
                    <Image 
                      src={config.img} 
                      alt={config.name} 
                      width={96} 
                      height={76} 
                      className="object-cover rounded-xl" 
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-2xl p-8">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <Car className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Wybór samochodu</h2>
                    <p className="text-gray-400">Wybierz markę, model i specyfikację swojego auta</p>
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
                  <div className="text-center mb-8">
                    <Settings className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Konfiguracja zestawu</h2>
                    <p className="text-gray-400">Wybierz rodzaj zestawu dywaników</p>
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
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <Palette className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Kolory i tekstury</h2>
                    <p className="text-gray-400">Dostosuj wygląd swoich dywaników</p>
                  </div>

                  {/* Wariant 3D */}
                  <div>
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-red-400" />
                      Wariant 3D
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {threeDVariants.map((variant, index) => (
                        <Tooltip key={variant.name} content={variant.description}>
                          <button
                            onClick={() => updateState({ selected3DVariant: index })}
                            className={`rounded-xl border-2 p-4 transition-all duration-300 hover:scale-105 ${
                              state.selected3DVariant === index 
                                ? "border-red-500 ring-2 ring-red-500/50 bg-red-500/10 shadow-lg shadow-red-500/25" 
                                : "border-gray-700 hover:border-red-400 bg-gray-800"
                            }`}
                          >
                            <Image 
                              src={variant.image} 
                              alt={variant.name} 
                              width={80} 
                              height={80} 
                              className="object-contain mx-auto mb-3" 
                            />
                            <div className="text-center">
                              <div className="text-white font-medium mb-1">{variant.name}</div>
                              {variant.price > 0 && (
                                <div className="text-red-400 text-sm">+{variant.price} zł</div>
                              )}
                            </div>
                          </button>
                        </Tooltip>
                      ))}
                    </div>
                  </div>

                  {/* Kolory */}
                  <div>
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Palette className="w-5 h-5 text-red-400" />
                      Kolory
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-300 text-sm mb-3">Kolor dywanika:</label>
                        <div className="flex flex-wrap gap-3">
                          {carpetColors.map((color, index) => (
                            <Tooltip key={color.name} content={color.name}>
                              <button
                                onClick={() => handleCarpetColorChange(index)}
                                className={`w-12 h-12 rounded-full border-2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500/50 ${
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
                        <label className="block text-gray-300 text-sm mb-3">Kolor obszycia:</label>
                        <div className="flex flex-wrap gap-3">
                          {edgeColors.map((color, index) => (
                            <Tooltip key={color.name} content={color.name}>
                              <button
                                onClick={() => updateState({ selectedEdge: index })}
                                className={`w-12 h-12 rounded-full border-2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500/50 ${
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
                  <div>
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Settings className="w-5 h-5 text-red-400" />
                      Tekstura
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {textures.map((texture, index) => (
                        <Tooltip key={texture.name} content={texture.description}>
                          <button
                            onClick={() => updateState({ selectedTexture: index })}
                            className={`rounded-xl border-2 p-4 transition-all duration-300 hover:scale-105 ${
                              state.selectedTexture === index 
                                ? "border-red-500 ring-2 ring-red-500/50 bg-red-500/10 shadow-lg shadow-red-500/25" 
                                : "border-gray-700 hover:border-red-400 bg-gray-800"
                            }`}
                          >
                            <Image 
                              src={texture.img} 
                              alt={texture.name} 
                              width={80} 
                              height={80} 
                              className="object-contain mx-auto mb-3" 
                            />
                            <div className="text-center">
                              <div className="text-white font-medium mb-1">{texture.name}</div>
                              {texture.price > 0 && (
                                <div className="text-red-400 text-sm">+{texture.price} zł</div>
                              )}
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
                  <div className="text-center mb-8">
                    <Check className="w-12 h-12 text-green-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Podsumowanie</h2>
                    <p className="text-gray-400">Sprawdź swoją konfigurację przed dodaniem do koszyka</p>
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
              <div className="flex items-center justify-between pt-6">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    currentStep === 1
                      ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                      : "bg-gray-800 text-white hover:bg-gray-700"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Wstecz
                </button>

                {currentStep < 4 ? (
                  <button
                    onClick={nextStep}
                    className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all duration-200"
                  >
                    Dalej
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button 
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                      isConfigurationComplete
                        ? "bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white shadow-lg hover:shadow-red-500/25 transform hover:scale-105"
                        : "bg-gray-700 text-gray-400 cursor-not-allowed"
                    }`}
                    disabled={!isConfigurationComplete}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    DODAJ DO KOSZYKA
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Price Summary */}
            <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-red-400" />
                Podsumowanie ceny
              </h3>
              <div className="space-y-3">
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
                <div className="border-t border-gray-700 pt-3">
                  <div className="flex justify-between">
                    <span className="text-white font-bold">Razem:</span>
                    <span className="text-red-400 font-bold text-xl">{calculateTotalPrice()} zł</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Configuration Status */}
            <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Check className="w-5 h-5 text-red-400" />
                Status konfiguracji
              </h3>
              <div className="space-y-3">
                {steps.map((step) => (
                  <div key={step.id} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      step.completed ? "bg-green-500" : "bg-gray-600"
                    }`} />
                    <span className={`text-sm ${
                      step.completed ? "text-green-400" : "text-gray-400"
                    }`}>
                      {step.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-2xl p-6">
              <div className="space-y-4">
                <button
                  onClick={resetConfiguration}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-gray-300 hover:text-white transition-colors duration-200 border border-gray-700 rounded-xl hover:border-gray-600"
                >
                  <RotateCcw className="w-4 h-4" />
                  Resetuj konfigurację
                </button>
                
                {showSavedMessage && (
                  <div className="flex items-center gap-2 text-green-400 text-sm p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <Save className="w-4 h-4" />
                    <span>Konfiguracja zresetowana</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 