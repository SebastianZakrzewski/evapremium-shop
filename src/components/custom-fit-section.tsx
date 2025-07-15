"use client";

import { useState, useEffect } from "react";
import { Target, Ruler, Car, CheckCircle, ArrowRight, Star, Zap } from "lucide-react";
import Image from "next/image";

const customFitFeatures = [
  {
    icon: Target,
    title: "Precyzyjne dopasowanie",
    description: "Każdy dywanik jest precyzyjnie dopasowany do konkretnego modelu samochodu"
  },
  {
    icon: Ruler,
    title: "Dokładne wymiary",
    description: "Używamy oryginalnych szablonów producentów dla perfekcyjnego dopasowania"
  },
  {
    icon: Car,
    title: "Wszystkie marki samochodów",
    description: "Obsługujemy wszystkie popularne marki i modele samochodów"
  },
  {
    icon: CheckCircle,
    title: "Gwarancja dopasowania",
    description: "100% gwarancja, że dywaniki będą idealnie pasować do Twojego auta"
  }
];

const carBrands = [
  { name: "BMW", logo: "/images/products/bmw.png" },
  { name: "Mercedes", logo: "/images/products/mercedes.jpg" },
  { name: "Audi", logo: "/images/products/audi.jpg" },
  { name: "Porsche", logo: "/images/products/porsche.png" },
  { name: "Tesla", logo: "/images/products/tesla.avif" }
];

export default function CustomFitSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [hoveredBrand, setHoveredBrand] = useState<number | null>(null);

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
    <section id="custom-fit-section" className="py-12 md:py-16 bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Animowane tło */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-black to-blue-800/5"></div>
      
      {/* Animowane cząsteczki */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-2 h-2 bg-blue-500 rounded-full animate-float-hover"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-blue-400 rounded-full animate-float-hover" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-1.5 h-1.5 bg-blue-300 rounded-full animate-float-hover" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 right-1/3 w-1 h-1 bg-blue-600 rounded-full animate-float-hover" style={{animationDelay: '0.5s'}}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full mb-6 animate-pulse-glow">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
            SZYTE NA MIARĘ DO TWOJEGO AUTA
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            Każdy dywanik jest precyzyjnie dopasowany do konkretnego modelu samochodu
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Lewa strona - Obraz i opis */}
          <div className={`transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div className="relative">
              {/* Główny obraz */}
              <div className="relative bg-black rounded-2xl p-6 border-4 border-blue-800/50 shadow-2xl">
                <Image
                  src="/images/zalety/szycie.png"
                  alt="Szyte na miarę dywaniki"
                  width={600}
                  height={400}
                  className="w-full h-auto rounded-xl object-cover"
                />
                
                {/* Overlay z informacjami */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-2xl"></div>
                
                {/* Ikony na obrazie */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-blue-500/90 backdrop-blur-sm px-3 py-2 rounded-full">
                  <Ruler className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-medium">Precyzyjne wymiary</span>
                </div>
                
                <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-green-500/90 backdrop-blur-sm px-3 py-2 rounded-full">
                  <CheckCircle className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-medium">Dopasowanie 100%</span>
                </div>
              </div>

              {/* Dodatkowe informacje */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3 text-blue-300">
                  <Star className="w-5 h-5 text-blue-400" />
                  <span className="text-lg">Używamy oryginalnych szablonów producentów</span>
                </div>
                <div className="flex items-center gap-3 text-blue-300">
                  <Zap className="w-5 h-5 text-blue-400" />
                  <span className="text-lg">Szybka realizacja zamówień</span>
                </div>
                <div className="flex items-center gap-3 text-blue-300">
                  <Target className="w-5 h-5 text-blue-400" />
                  <span className="text-lg">Gwarancja idealnego dopasowania</span>
                </div>
              </div>
            </div>
          </div>

          {/* Prawa strona - Funkcje */}
          <div className={`transition-all duration-1000 ease-out delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="space-y-6">
              {customFitFeatures.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div
                    key={index}
                    className={`group p-6 bg-gradient-to-r from-gray-900/50 to-gray-800/30 rounded-xl border border-blue-800/30 transition-all duration-500 ease-out hover:scale-105 cursor-pointer ${
                      hoveredFeature === index ? 'border-blue-500/80 bg-gradient-to-r from-blue-900/20 to-blue-800/10' : ''
                    }`}
                    onMouseEnter={() => setHoveredFeature(index)}
                    onMouseLeave={() => setHoveredFeature(null)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center transition-all duration-500 ${
                        hoveredFeature === index ? 'scale-110 rotate-12' : 'scale-100 rotate-0'
                      }`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-xl font-semibold mb-2 transition-all duration-500 ${
                          hoveredFeature === index ? 'text-blue-400' : 'text-white'
                        }`}>
                          {feature.title}
                        </h3>
                        <p className="text-gray-400 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                      <ArrowRight className={`w-5 h-5 text-blue-400 transition-all duration-500 ${
                        hoveredFeature === index ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                      }`} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sekcja z markami samochodów */}
            <div className="mt-8">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Obsługujemy wszystkie popularne marki</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {carBrands.map((brand, index) => (
                  <div
                    key={index}
                    className={`group p-4 bg-gray-900/50 rounded-lg border border-gray-700/50 transition-all duration-500 ease-out hover:scale-110 cursor-pointer ${
                      hoveredBrand === index ? 'border-blue-500/80 bg-blue-900/20' : ''
                    }`}
                    onMouseEnter={() => setHoveredBrand(index)}
                    onMouseLeave={() => setHoveredBrand(null)}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="relative w-16 h-16 mb-3">
                        <Image
                          src={brand.logo}
                          alt={brand.name}
                          fill
                          className="object-contain transition-all duration-500 group-hover:scale-110"
                        />
                      </div>
                      <span className={`text-sm font-medium transition-all duration-500 ${
                        hoveredBrand === index ? 'text-blue-400' : 'text-gray-300'
                      }`}>
                        {brand.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className={`text-center mt-12 transition-all duration-1000 ease-out delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500/20 to-blue-700/20 px-8 py-4 rounded-full border border-blue-500/30 hover:scale-105 transition-all duration-300 cursor-pointer group">
            <Target className="w-6 h-6 text-blue-400 animate-pulse" />
            <span className="text-blue-300 font-semibold text-lg group-hover:text-blue-200 transition-colors duration-300">
              Sprawdź dopasowanie dla swojego auta
            </span>
            <ArrowRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform duration-300" />
          </div>
        </div>
      </div>
    </section>
  );
} 