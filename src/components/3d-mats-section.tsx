"use client";

import { useState, useEffect } from "react";
import { Shield, Zap, Target, Star, CheckCircle, ArrowRight } from "lucide-react";
import Image from "next/image";

const benefits3D = [
  {
    id: 1,
    icon: Shield,
    title: "Doskonała ochrona",
    description: "Ranty 3D chronią przed wnikaniem brudu i wilgoci pod dywanik",
    color: "from-blue-500 to-cyan-600"
  },
  {
    id: 2,
    icon: Zap,
    title: "Łatwe czyszczenie",
    description: "Specjalna struktura pozwala na szybkie i skuteczne usuwanie zabrudzeń",
    color: "from-green-500 to-emerald-600"
  },
  {
    id: 3,
    icon: Target,
    title: "Idealne dopasowanie",
    description: "Precyzyjne dopasowanie do kształtu podłogi samochodu",
    color: "from-purple-500 to-pink-600"
  },
  {
    id: 4,
    icon: Star,
    title: "Trwałość materiału",
    description: "Wysokiej jakości EVA zapewnia długoletnie użytkowanie",
    color: "from-orange-500 to-red-600"
  }
];

const features3D = [
  "Ranty o wysokości 15-20mm",
  "Głęboka struktura komórek",
  "Materiał EVA o gęstości 0.6g/cm³",
  "Odporność na temperaturę -40°C do +80°C",
  "Antypoślizgowe spody",
  "Łatwe w montażu i demontażu"
];

export default function ThreeDMatsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredBenefit, setHoveredBenefit] = useState<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById('3d-mats-section');
    if (section) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="3d-mats-section" className="py-12 md:py-16 bg-black relative overflow-hidden">
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
        <div className={`text-center mb-12 md:mb-16 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-8 animate-pulse-glow shadow-lg shadow-blue-500/30">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
            DYWANIKI 3D Z RANTAMI
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Zaawansowana technologia 3D zapewnia doskonałe dopasowanie i maksymalną ochronę podłogi Twojego samochodu
          </p>
        </div>

        {/* Główna zawartość */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Lewa strona - Obraz i opis */}
          <div className={`transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div className="relative">
              {/* Kontener z obrazem */}
              <div className="relative bg-black rounded-2xl p-6 border-2 border-blue-500/30 shadow-2xl shadow-blue-500/20">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-2xl animate-pulse-glow"></div>
                
                <div className="relative z-10">
                  <Image
                    src="/images/zalety/3d.png"
                    alt="Dywaniki 3D z rantami"
                    width={600}
                    height={400}
                    className="w-full h-auto rounded-xl object-cover"
                  />
                </div>
                
                {/* Ikony na obrazie */}
                <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm rounded-full p-2">
                  <Target className="w-6 h-6 text-blue-400" />
                </div>
                <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm rounded-full p-2">
                  <Shield className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Prawa strona - Korzyści */}
          <div className={`transition-all duration-1000 ease-out delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  Dlaczego dywaniki 3D z rantami?
                </h3>
                <p className="text-lg text-gray-300 leading-relaxed">
                  Nasze dywaniki 3D z rantami to najnowocześniejsze rozwiązanie w ochronie podłogi samochodu. 
                  Specjalna technologia 3D zapewnia doskonałe dopasowanie i maksymalną skuteczność w zatrzymywaniu 
                  brudu, wilgoci i innych zanieczyszczeń.
                </p>
              </div>

              {/* Lista korzyści */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits3D.map((benefit, index) => {
                  const IconComponent = benefit.icon;
                  return (
                    <div
                      key={benefit.id}
                      className={`group cursor-pointer transition-all duration-500 ease-out p-4 rounded-xl border-2 ${
                        hoveredBenefit === benefit.id
                          ? 'border-blue-500/80 bg-gradient-to-br from-blue-500/20 to-purple-500/20 scale-105 shadow-lg shadow-blue-500/30'
                          : 'border-gray-700/50 bg-gray-800/30 hover:border-blue-500/50 hover:bg-gray-800/50'
                      }`}
                      onMouseEnter={() => setHoveredBenefit(benefit.id)}
                      onMouseLeave={() => setHoveredBenefit(null)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${benefit.color} ${
                          hoveredBenefit === benefit.id ? 'scale-110' : 'scale-100'
                        } transition-transform duration-300`}>
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className={`font-semibold mb-1 transition-colors duration-300 ${
                            hoveredBenefit === benefit.id ? 'text-blue-300' : 'text-white'
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

              {/* Lista cech technicznych */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <h4 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <CheckCircle className="w-6 h-6 text-green-400 mr-2" />
                  Cechy techniczne
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {features3D.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="flex-1 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                  <span className="flex items-center justify-center">
                    Sprawdź dostępne modele
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </span>
                </button>
                <button className="flex-1 bg-transparent border-2 border-red-500/50 hover:border-red-500 text-red-400 hover:text-red-300 font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105">
                  <span className="flex items-center justify-center">
                    Dowiedz się więcej
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 