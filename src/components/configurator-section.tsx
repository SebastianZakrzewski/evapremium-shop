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
  Eye
} from "lucide-react";

const carpetColors = [
  { name: "Niebieski", color: "#0084d1" },
  { name: "Czerwony", color: "#d12d1c" },
  { name: "Żółty", color: "#ffe100" },
  { name: "Kość słoniowa", color: "#d9d7c7" },
  { name: "Granatowy", color: "#1a355b" },
  { name: "Bordowy", color: "#6d2635" },
  { name: "Pomarańczowy", color: "#ff7b1c" },
  { name: "Jasnobeżowy", color: "#d1b48c" },
  { name: "Ciemnoszary", color: "#4a4a4a" },
  { name: "Fioletowy", color: "#7c4bc8" },
  { name: "Jasnozielony", color: "#8be000" },
  { name: "Beżowy", color: "#b48a5a" },
  { name: "Różowy", color: "#ff7eb9" },
  { name: "Czarny", color: "#222" },
  { name: "Zielony", color: "#1b5e3c" },
  { name: "Brązowy", color: "#4b2e1e" },
];

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
  brand: string;
  model: string;
  year: string;
  body: string;
  trans: string;
}

export default function ConfiguratorSection() {
  const [state, setState] = useState<ConfiguratorState>({
    selectedCarpet: 0,
    selectedEdge: 0,
    selectedTexture: 0,
    selectedConfig: 0,
    brand: "",
    model: "",
    year: "",
    body: "",
    trans: "",
  });

  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [isConfigurationComplete, setIsConfigurationComplete] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);

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

  const updateState = (updates: Partial<ConfiguratorState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const resetConfiguration = () => {
    setState({
      selectedCarpet: 0,
      selectedEdge: 0,
      selectedTexture: 0,
      selectedConfig: 0,
      brand: "",
      model: "",
      year: "",
      body: "",
      trans: "",
    });
    localStorage.removeItem('configurator-state');
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 2000);
  };

  const calculateTotalPrice = () => {
    const basePrice = configurations[state.selectedConfig].price;
    const texturePrice = textures[state.selectedTexture].price;
    return basePrice + texturePrice;
  };

  const getProgressPercentage = () => {
    const steps = [state.brand, state.model, state.year, state.body, state.trans];
    const completedSteps = steps.filter(step => step).length;
    return (completedSteps / steps.length) * 100;
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

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Konfigurator Dywaników
          </h1>
          <p className="text-gray-300 text-lg">
            Stwórz idealne dywaniki dla swojego samochodu
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white text-sm">Postęp konfiguracji</span>
            <span className="text-red-400 text-sm">{Math.round(getProgressPercentage())}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Galeria */}
          <div className="space-y-6">
            <div className="relative">
              <div className="w-full aspect-square relative rounded-xl overflow-hidden border-2 border-red-500 shadow-2xl">
                <Image 
                  src="/images/konfigurator/dywanik.jpg" 
                  alt="Podgląd dywanika gumowego czarnego" 
                  fill 
                  className="object-cover" 
                />
                {/* Overlay z informacjami o wyborach */}
                <div className="absolute top-4 left-4 bg-black/80 backdrop-blur rounded-lg p-3 text-white text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Palette className="w-4 h-4 text-red-400" />
                    <span>{carpetColors[state.selectedCarpet].name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-red-400" />
                    <span>{textures[state.selectedTexture].name}</span>
                  </div>
                </div>
              </div>
              
              {/* Galeria miniatur */}
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                {configurations.map((config, index) => (
                  <button
                    key={config.name}
                    onClick={() => updateState({ selectedConfig: index })}
                    className={`flex-shrink-0 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                      state.selectedConfig === index 
                        ? "border-red-500 ring-2 ring-red-500/50" 
                        : "border-gray-700 hover:border-red-400"
                    }`}
                    style={{ width: 80, height: 80 }}
                  >
                    <Image 
                      src={config.img} 
                      alt={config.name} 
                      width={76} 
                      height={76} 
                      className="object-cover rounded-lg" 
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Podsumowanie wyborów */}
            <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Check className="w-5 h-5 text-red-400" />
                Podsumowanie konfiguracji
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Konfiguracja:</span>
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
                {state.brand && (
                  <div className="flex justify-between">
                    <span className="text-gray-300">Samochód:</span>
                    <span className="text-white">{state.brand} {state.model} {state.year}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Opcje konfiguracji */}
          <div className="space-y-6">
            {/* Kolory */}
            <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl p-6">
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
                          onClick={() => updateState({ selectedCarpet: index })}
                          className={`w-12 h-12 rounded-full border-2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500/50 ${
                            state.selectedCarpet === index 
                              ? "border-red-500 ring-2 ring-red-500/50" 
                              : "border-gray-700 hover:border-red-400"
                          }`}
                          style={{ background: color.color }}
                          aria-label={`Wybierz kolor dywanika: ${color.name}`}
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
                              ? "border-red-500 ring-2 ring-red-500/50" 
                              : "border-gray-700 hover:border-red-400"
                          }`}
                          style={{ background: color.color }}
                          aria-label={`Wybierz kolor obszycia: ${color.name}`}
                        />
                      </Tooltip>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Rodzaj zestawu */}
            <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-red-400" />
                Rodzaj zestawu
              </h3>
              <div className="flex gap-4 flex-wrap justify-center mb-2">
                {configurations.map((config, idx) => (
                  <button
                    key={config.name}
                    onClick={() => updateState({ selectedConfig: idx })}
                    className={`flex flex-col items-center justify-center w-28 h-32 rounded-lg border-2 p-2 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500/50 ${
                      state.selectedConfig === idx
                        ? "border-red-500 ring-2 ring-red-500/50 bg-red-500/10"
                        : "border-gray-700 hover:border-red-400 bg-gray-800"
                    }`}
                    aria-label={`Wybierz zestaw: ${config.name}`}
                  >
                    <Image
                      src={config.img}
                      alt={config.name}
                      width={72}
                      height={48}
                      className="object-contain rounded mb-2"
                    />
                    <span className="text-white text-xs font-medium text-center leading-tight">{config.name}</span>
                  </button>
                ))}
              </div>
              <div className="text-gray-400 text-sm italic mb-2 text-center">
                {configurations[state.selectedConfig].description}
              </div>
            </div>

            {/* Wariant Dywanika */}
            <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-red-400" />
                Wariant Dywanika
              </h3>
              <div className="text-gray-400 text-sm italic mb-2 text-center">
                Wybierz wariant dywanika (np. Standard, Premium, z logo, bez logo itp.)
              </div>
              {/* Tu możesz dodać przyciski/checkboxy do wyboru wariantu */}
            </div>

            {/* Tekstury */}
            <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-red-400" />
                Tekstura
              </h3>
              <div className="flex gap-4">
                {textures.map((texture, index) => (
                  <Tooltip key={texture.name} content={texture.description}>
                    <button
                      onClick={() => updateState({ selectedTexture: index })}
                      className={`rounded-lg border-2 p-2 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500/50 ${
                        state.selectedTexture === index 
                          ? "border-red-500 ring-2 ring-red-500/50 bg-red-500/10" 
                          : "border-gray-700 hover:border-red-400 bg-gray-800"
                      }`}
                      aria-label={`Wybierz teksturę: ${texture.name}`}
                    >
                      <Image 
                        src={texture.img} 
                        alt={texture.name} 
                        width={60} 
                        height={60} 
                        className="object-contain" 
                      />
                      <div className="text-center mt-2">
                        <div className="text-white text-sm font-medium">{texture.name}</div>
                        {texture.price > 0 && (
                          <div className="text-red-400 text-xs">+{texture.price} zł</div>
                        )}
                      </div>
                    </button>
                  </Tooltip>
                ))}
              </div>
            </div>

            {/* Wybór samochodu */}
            <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Car className="w-5 h-5 text-red-400" />
                Wybór samochodu
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-red-500 w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-sm">1</span>
                  <label className="text-white flex-1">Marka:</label>
                  <select 
                    className="flex-1 border rounded-lg px-3 py-2 bg-gray-800 text-white border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/50 transition-all duration-200"
                    value={state.brand} 
                    onChange={e => updateState({ brand: e.target.value, model: "", year: "", body: "", trans: "" })}
                    aria-label="Wybierz markę samochodu"
                  >
                    <option value="">Wybierz markę</option>
                    {carBrands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold text-red-500 w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-sm">2</span>
                  <label className="text-white flex-1">Model:</label>
                  <select 
                    className="flex-1 border rounded-lg px-3 py-2 bg-gray-800 text-white border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    value={state.model} 
                    onChange={e => updateState({ model: e.target.value, year: "", body: "", trans: "" })}
                    disabled={!state.brand}
                    aria-label="Wybierz model samochodu"
                  >
                    <option value="">Wybierz model</option>
                    {carModels.map(model => <option key={model} value={model}>{model}</option>)}
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold text-red-500 w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-sm">3</span>
                  <label className="text-white flex-1">Rocznik:</label>
                  <select 
                    className="flex-1 border rounded-lg px-3 py-2 bg-gray-800 text-white border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    value={state.year} 
                    onChange={e => updateState({ year: e.target.value, body: "", trans: "" })}
                    disabled={!state.model}
                    aria-label="Wybierz rocznik samochodu"
                  >
                    <option value="">Wybierz rocznik</option>
                    {carYears.map(year => <option key={year} value={year}>{year}</option>)}
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold text-red-500 w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-sm">4</span>
                  <label className="text-white flex-1">Nadwozie:</label>
                  <select 
                    className="flex-1 border rounded-lg px-3 py-2 bg-gray-800 text-white border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    value={state.body} 
                    onChange={e => updateState({ body: e.target.value, trans: "" })}
                    disabled={!state.year}
                    aria-label="Wybierz typ nadwozia"
                  >
                    <option value="">Wybierz nadwozie</option>
                    {carBodies.map(body => <option key={body} value={body}>{body}</option>)}
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold text-red-500 w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-sm">5</span>
                  <label className="text-white flex-1">Skrzynia biegów:</label>
                  <select 
                    className="flex-1 border rounded-lg px-3 py-2 bg-gray-800 text-white border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    value={state.trans} 
                    onChange={e => updateState({ trans: e.target.value })}
                    disabled={!state.body}
                    aria-label="Wybierz typ skrzyni biegów"
                  >
                    <option value="">Wybierz skrzynię</option>
                    {carTransmissions.map(trans => <option key={trans} value={trans}>{trans}</option>)}
                  </select>
                </div>
              </div>

              {/* Komunikat o niekompletnej konfiguracji */}
              {!isConfigurationComplete && (
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 text-sm">Uzupełnij wszystkie pola, aby dodać do koszyka</span>
                </div>
              )}
            </div>

            {/* Akcje */}
            <div className="flex items-center justify-between p-6 bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl">
              <div className="flex items-center gap-4">
                <button
                  onClick={resetConfiguration}
                  className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200"
                  aria-label="Resetuj konfigurację"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden sm:inline">Resetuj</span>
                </button>
                
                {showSavedMessage && (
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <Save className="w-4 h-4" />
                    <span>Konfiguracja zresetowana</span>
                  </div>
                )}
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-white mb-2">
                  {calculateTotalPrice()} zł
                </div>
                <button 
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    isConfigurationComplete
                      ? "bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white shadow-lg hover:shadow-red-500/25 transform hover:scale-105"
                      : "bg-gray-700 text-gray-400 cursor-not-allowed"
                  }`}
                  disabled={!isConfigurationComplete}
                  aria-label="Dodaj do koszyka"
                >
                  <ShoppingCart className="w-5 h-5" />
                  DODAJ DO KOSZYKA
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 