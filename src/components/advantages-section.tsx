"use client";

import { useState, useEffect } from "react";
import { Target, Sparkles, Zap, Star, ArrowRight } from "lucide-react";
import Image from "next/image";

const advantagesItems = [
  {
    id: 1,
    type: "image" as const,
    src: "/images/zalety/3d.png",
    title: "Dywaniki 3D z rantami",
    description: "Zaawansowana technologia 3D zapewnia doskonałe dopasowanie i trwałość",
    icon: Sparkles,
    color: "from-blue-500 to-purple-600"
  },
  {
    id: 2,
    type: "image" as const,
    src: "/images/zalety/szycie.png",
    title: "Szyte na miarę do twojego auta",
    description: "Każdy dywanik jest precyzyjnie dopasowany do konkretnego modelu samochodu",
    icon: Target,
    color: "from-green-500 to-teal-600"
  },
  {
    id: 3,
    type: "image" as const,
    src: "/images/zalety/kolorystyka.png",
    title: "Różnorodna kolorystyka",
    description: "Szeroka paleta kolorów dopasowana do wnętrza Twojego auta",
    icon: Star,
    color: "from-yellow-500 to-orange-600"
  },
  {
    id: 4,
    type: "image" as const,
    src: "/images/zalety/plaster.png",
    title: "Głęboka struktura komórek blokująca zabrudzenia",
    description: "Specjalna struktura materiału EVA skutecznie zatrzymuje brud i wilgoć",
    icon: Zap,
    color: "from-red-500 to-pink-600"
  }
];

export default function AdvantagesSection() {
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const [clickedItem, setClickedItem] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById('advantages-section');
    if (section) {
      observer.observe(section);
    }

    return () => {
      window.removeEventListener('resize', checkMobile);
      observer.disconnect();
    };
  }, []);

  const handleItemClick = (itemId: number) => {
    setClickedItem(itemId);
    setTimeout(() => setClickedItem(null), 300);

    // Płynne przewijanie do sekcji 3D mats dla pierwszego elementu
    if (itemId === 1) {
      const threeDMatsSection = document.getElementById('3d-mats-section');
      if (threeDMatsSection) {
        threeDMatsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }

    // Płynne przewijanie do sekcji custom fit dla drugiego elementu
    if (itemId === 2) {
      const customFitSection = document.getElementById('custom-fit-section');
      if (customFitSection) {
        customFitSection.scrollIntoView({ behavior: 'smooth' });
      }
    }

    // Płynne przewijanie do sekcji różnorodna kolorystyka dla trzeciego elementu
    if (itemId === 3) {
      const kolorystykaSection = document.getElementById('roznorodna-kolorystyka-section');
      if (kolorystykaSection) {
        kolorystykaSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section id="advantages-section" className="py-8 md:py-12 bg-black relative overflow-hidden">
      {/* Animowane tło z gradientem */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-black to-red-800/5"></div>
      
      {/* Animowane cząsteczki tła - teraz również na mobile */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-2 h-2 bg-red-500 rounded-full animate-float-hover"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-red-400 rounded-full animate-float-hover" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-1.5 h-1.5 bg-red-300 rounded-full animate-float-hover" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 right-1/3 w-1 h-1 bg-red-600 rounded-full animate-float-hover" style={{animationDelay: '0.5s'}}></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header z animacją */}
        <div className={`text-center mb-6 md:mb-10 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-full mb-6 animate-pulse-glow">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white via-red-100 to-white bg-clip-text text-transparent">
            POZNAJ NASZ PRODUKT
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            Odkryj wyjątkowe cechy naszych dywaników samochodowych
          </p>
        </div>

        {/* Grid z animowanymi oknami - idealnie wyrównany */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 justify-items-center items-start">
          {advantagesItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.id}
                className={`group cursor-pointer transition-all duration-1000 ease-out w-full max-w-sm lg:max-w-none ${
                  isVisible ? (
                    index === 0 ? 'animate-float-in-delay-1' :
                    index === 1 ? 'animate-float-in-delay-2' :
                    index === 2 ? 'animate-float-in-delay-3' :
                    'animate-float-in-delay-4'
                  ) : 'opacity-0 translate-y-20'
                }`}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={() => handleItemClick(item.id)}
              >
                <div className="relative flex flex-col items-center text-center h-full p-2">
                  {/* Główny kontener z animowanym tłem */}
                  <div className="relative w-full h-full flex flex-col items-center">
                    {/* Animowane tło z gradientem */}
                    <div className={`absolute inset-0 rounded-2xl transition-all duration-700 ease-out ${
                      hoveredItem === item.id 
                        ? 'bg-gradient-to-br from-red-500/20 via-red-600/10 to-red-700/20 scale-105 animate-glow-border' 
                        : 'bg-gradient-to-br from-gray-900/50 to-gray-800/30 scale-100'
                    }`}></div>
                    
                    {/* Kontener z obrazem - wypełnia całą szerokość */}
                    <div className={`relative mb-4 bg-black rounded-xl p-4 w-full h-40 md:h-56 lg:h-72 flex items-center justify-center border-4 transition-all duration-700 ease-out transform ${
                      hoveredItem === item.id 
                        ? 'border-red-500/80 scale-110 shadow-2xl shadow-red-500/30 animate-float-hover' 
                        : 'border-red-800/50 scale-100 shadow-lg'
                    } ${
                      clickedItem === item.id ? 'animate-scale-bounce' : ''
                    }`}>
                      
                      {/* Animowany gradient border */}
                      <div className={`absolute inset-0 rounded-xl transition-all duration-700 ${
                        hoveredItem === item.id 
                          ? 'bg-gradient-to-r from-red-500 via-red-600 to-red-500 bg-[length:200%_100%] animate-shimmer' 
                          : 'bg-transparent'
                      }`}></div>
                      
                      {/* Obraz z animacją - wypełnia całą szerokość */}
                      <div className="relative z-10 flex items-center justify-center w-full h-full">
                        <Image
                          src={item.src}
                          alt={item.title}
                          width={400}
                          height={400}
                          className={`transition-all duration-700 ease-out object-cover w-full h-full ${
                            hoveredItem === item.id 
                              ? 'scale-110 rotate-3' 
                              : 'scale-100 rotate-0'
                          }`}
                        />
                      </div>
                      
                      {/* Ikona z animacją - teraz również na mobile */}
                      <div className={`absolute top-2 right-2 transition-all duration-700 ${
                        hoveredItem === item.id 
                          ? 'opacity-100 scale-100 rotate-12 animate-pulse' 
                          : 'opacity-0 scale-50 rotate-0'
                      }`}>
                        <IconComponent className="w-6 h-6 text-red-400" />
                      </div>

                      {/* Strzałka z animacją - teraz również na mobile */}
                      <div className={`absolute bottom-2 right-2 transition-all duration-700 ${
                        hoveredItem === item.id 
                          ? 'opacity-100 translate-x-0' 
                          : 'opacity-0 translate-x-4'
                      }`}>
                        <ArrowRight className="w-4 h-4 text-red-400" />
                      </div>
                    </div>
                    
                    {/* Tytuł z animacją - idealnie wyśrodkowany */}
                    <h3 className={`text-lg md:text-xl font-semibold transition-all duration-700 ease-out text-center w-full mb-2 ${
                      hoveredItem === item.id 
                        ? 'text-red-400 scale-105' 
                        : 'text-white scale-100'
                    }`}>
                      {item.title}
                    </h3>
                    
                    {/* Opis z animacją - idealnie wyśrodkowany */}
                    <div className={`overflow-hidden transition-all duration-700 ease-out w-full text-center ${
                      hoveredItem === item.id 
                        ? 'max-h-32 opacity-100' 
                        : 'max-h-32 opacity-100'
                    }`}>
                      <p className="text-sm text-gray-400 mt-2 max-w-xs mx-auto leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Efekt świecenia */}
                  <div className={`absolute inset-0 rounded-2xl transition-all duration-700 ${
                    hoveredItem === item.id 
                      ? 'bg-gradient-to-r from-red-500/10 via-transparent to-red-500/10 animate-pulse-glow' 
                      : 'bg-transparent'
                  }`}></div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Dodatkowy element dekoracyjny - idealnie wyśrodkowany */}
        <div className={`text-center mt-8 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500/20 to-red-700/20 px-6 py-3 rounded-full border border-red-500/30 hover:scale-105 transition-all duration-300 cursor-pointer group">
            <Sparkles className="w-5 h-5 text-red-400 animate-pulse" />
            <span className="text-red-300 font-medium group-hover:text-red-200 transition-colors duration-300">Każdy produkt jest unikalny</span>
            <Sparkles className="w-5 h-5 text-red-400 animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
} 