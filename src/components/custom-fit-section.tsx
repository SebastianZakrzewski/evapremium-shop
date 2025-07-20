"use client";

import { useState, useEffect } from "react";
import { Target, Ruler, Car, CheckCircle, ArrowRight, Star, Zap, Search, MapPin, Calendar, Shield } from "lucide-react";
import Image from "next/image";

const carBrands = [
  { 
    name: "BMW", 
    logo: "/images/products/bmw.png",
    models: ["Seria 1", "Seria 3", "Seria 5", "X1", "X3", "X5"],
    description: "Luksusowe niemieckie samochody z doskonałym dopasowaniem"
  },
  { 
    name: "Mercedes", 
    logo: "/images/products/mercedes.jpg",
    models: ["Klasa A", "Klasa C", "Klasa E", "GLA", "GLC", "GLE"],
    description: "Elegancja i komfort w każdym detalu"
  },
  { 
    name: "Audi", 
    logo: "/images/products/audi.jpg",
    models: ["A3", "A4", "A6", "Q3", "Q5", "Q7"],
    description: "Innowacyjne rozwiązania i sportowy charakter"
  },
  { 
    name: "Porsche", 
    logo: "/images/products/porsche.png",
    models: ["911", "Cayenne", "Macan", "Panamera"],
    description: "Sportowe osiągi i precyzyjne dopasowanie"
  },
  { 
    name: "Tesla", 
    logo: "/images/products/tesla.avif",
    models: ["Model 3", "Model S", "Model X", "Model Y"],
    description: "Przyszłość motoryzacji z idealnym dopasowaniem"
  }
];

const fitProcess = [
  {
    step: 1,
    icon: Search,
    title: "Wybierz markę",
    description: "Znajdź swoją markę w naszej bazie ponad 50 producentów"
  },
  {
    step: 2,
    icon: Car,
    title: "Wybierz model",
    description: "Określ dokładny model i rok produkcji swojego auta"
  },
  {
    step: 3,
    icon: Ruler,
    title: "Sprawdź dopasowanie",
    description: "Zobacz wizualizację idealnie dopasowanych dywaników"
  },
  {
    step: 4,
    icon: CheckCircle,
    title: "Zamów",
    description: "Zamów dywaniki szyte na miarę z gwarancją dopasowania"
  }
];

const benefits = [
  {
    icon: Target,
    title: "Precyzyjne dopasowanie",
    description: "Każdy dywanik jest dopasowany do konkretnego modelu z dokładnością do milimetra",
    color: "from-blue-500 to-cyan-600"
  },
  {
    icon: Shield,
    title: "Gwarancja dopasowania",
    description: "100% gwarancja, że dywaniki będą idealnie pasować do Twojego auta",
    color: "from-green-500 to-emerald-600"
  },
  {
    icon: Zap,
    title: "Szybka realizacja",
    description: "Realizacja zamówienia w ciągu 3-5 dni roboczych",
    color: "from-orange-500 to-red-600"
  },
  {
    icon: Star,
    title: "Oryginalne szablony",
    description: "Używamy oryginalnych szablonów producentów dla perfekcyjnego dopasowania",
    color: "from-purple-500 to-pink-600"
  }
];

export default function CustomFitSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  const [hoveredBrand, setHoveredBrand] = useState<number | null>(null);
  const [hoveredBenefit, setHoveredBenefit] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById('custom-fit-section');
    if (section) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="custom-fit-section" className="py-16 md:py-20 bg-black relative overflow-hidden">
      {/* Animowane tło */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-black to-red-800/5"></div>
      
      {/* Animowane cząsteczki */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-2 h-2 bg-red-500 rounded-full animate-float-hover"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-red-400 rounded-full animate-float-hover" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-1.5 h-1.5 bg-red-300 rounded-full animate-float-hover" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 right-1/3 w-1 h-1 bg-red-600 rounded-full animate-float-hover" style={{animationDelay: '0.5s'}}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-full mb-8 animate-pulse-glow shadow-lg shadow-red-500/30">
            <Target className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-white via-red-100 to-white bg-clip-text text-transparent leading-tight">
            SZYTE NA MIARĘ DO TWOJEGO AUTA
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Każdy dywanik jest precyzyjnie dopasowany do konkretnego modelu samochodu z dokładnością do milimetra
          </p>
        </div>

        {/* Konfigurator samochodów */}
        <div className={`mb-16 transition-all duration-1000 ease-out delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                      <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-red-800/50 shadow-2xl">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
              Znajdź dywaniki dla swojego auta
            </h3>
            
            {/* Proces wyboru */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {fitProcess.map((step, index) => {
                const IconComponent = step.icon;
                const isActive = currentStep >= step.step;
                return (
                  <div
                    key={step.step}
                                         className={`relative p-6 rounded-xl border-2 transition-all duration-500 ${
                       isActive 
                         ? 'border-red-500 bg-red-500/10 shadow-lg shadow-red-500/30' 
                         : 'border-gray-600 bg-gray-800/30'
                       }`}
                  >
                    <div className="flex items-center gap-4">
                                             <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                         isActive 
                           ? 'bg-red-500 text-white scale-110' 
                           : 'bg-gray-600 text-gray-400'
                       }`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div>
                                                 <h4 className={`font-semibold mb-1 transition-colors duration-300 ${
                           isActive ? 'text-red-400' : 'text-gray-400'
                         }`}>
                          {step.title}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Wybór marki */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {carBrands.map((brand, index) => (
                <div
                  key={index}
                                     className={`group p-6 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl border-2 transition-all duration-500 cursor-pointer ${
                     selectedBrand === index 
                       ? 'border-red-500 bg-red-500/10 shadow-lg shadow-red-500/30 scale-105' 
                       : hoveredBrand === index
                         ? 'border-red-400/50 bg-red-500/5 scale-105'
                         : 'border-gray-600 hover:border-red-400/50'
                   }`}
                  onClick={() => setSelectedBrand(index)}
                  onMouseEnter={() => setHoveredBrand(index)}
                  onMouseLeave={() => setHoveredBrand(null)}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="relative w-16 h-16 mb-4">
                      <Image
                        src={brand.logo}
                        alt={brand.name}
                        fill
                        className="object-contain transition-all duration-500 group-hover:scale-110"
                      />
                    </div>
                                         <h4 className={`font-semibold mb-2 transition-colors duration-300 ${
                       selectedBrand === index ? 'text-red-400' : 'text-white'
                     }`}>
                      {brand.name}
                    </h4>
                    <p className="text-xs text-gray-400 text-center leading-relaxed">
                      {brand.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

                         {/* Wybór modelu (po wybraniu marki) */}
             {selectedBrand !== null && (
               <div className={`mt-8 p-6 bg-gradient-to-r from-red-900/20 to-red-800/20 rounded-xl border border-red-500/30 transition-all duration-500`}>
                <h4 className="text-xl font-semibold text-white mb-4">
                  Wybierz model {carBrands[selectedBrand].name}:
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {carBrands[selectedBrand].models.map((model, index) => (
                    <button
                      key={index}
                      className="p-3 bg-gray-800/50 hover:bg-red-500/20 border border-gray-600 hover:border-red-400 rounded-lg transition-all duration-300 text-white hover:text-red-300"
                    >
                      {model}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Korzyści */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 transition-all duration-1000 ease-out delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <div
                key={index}
                                 className={`group p-6 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl border-2 transition-all duration-500 cursor-pointer ${
                   hoveredBenefit === index 
                     ? 'border-red-500/80 bg-red-500/10 scale-105 shadow-lg shadow-red-500/30' 
                     : 'border-gray-600 hover:border-red-400/50'
                 }`}
                onMouseEnter={() => setHoveredBenefit(index)}
                onMouseLeave={() => setHoveredBenefit(null)}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${benefit.color} transition-all duration-500 ${
                    hoveredBenefit === index ? 'scale-110 rotate-12' : 'scale-100'
                  }`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div>
                                         <h4 className={`font-semibold mb-2 transition-colors duration-300 ${
                       hoveredBenefit === index ? 'text-red-400' : 'text-white'
                     }`}>
                      {benefit.title}
                    </h4>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to action */}
        <div className={`text-center transition-all duration-1000 ease-out delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                     <button className="inline-flex items-center gap-4 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
            <Target className="w-6 h-6" />
            <span>Sprawdź dopasowanie dla swojego auta</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
} 