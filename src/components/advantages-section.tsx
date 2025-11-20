"use client";

import { useState, useEffect } from "react";
import { Target, Sparkles, Zap, Star, ArrowRight, Package } from "lucide-react";
import Image from "next/image";

const advantagesItems = [
  {
    id: 1,
    src: "/images/zalety/dywanik_z_rantami.png",
    title: "Dywaniki 3D z rantami",
    description: "Zaawansowana technologia 3D zapewnia doskonałe dopasowanie i trwałość",
    icon: Sparkles,
    targetSection: "3d-mats-section"
  },
  {
    id: 2,
    src: "/images/zalety/szycie.png",
    title: "Szyte na miarę",
    description: "Każdy dywanik jest precyzyjnie dopasowany do konkretnego modelu samochodu",
    icon: Target,
    targetSection: "custom-fit-section"
  },
  {
    id: 3,
    src: "/kolory.png",
    title: "Różnorodna kolorystyka",
    description: "Szeroka paleta kolorów dopasowana do wnętrza Twojego auta",
    icon: Star,
    targetSection: "roznorodna-kolorystyka-section"
  },
  {
    id: 4,
    src: "/images/zalety/pianka.webp",
    title: "Nowoczesny Materiał EVA",
    description: "Specjalna struktura materiału EVA skutecznie zatrzymuje brud i wilgoć",
    icon: Zap,
    targetSection: "gleboka-struktura-komorek-section"
  }
];

export default function AdvantagesSection() {
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
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

    return () => observer.disconnect();
  }, []);

  const handleItemClick = (targetId: string) => {
    const section = document.getElementById(targetId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="advantages-section" className="py-12 md:py-16 bg-black relative overflow-x-hidden overflow-y-visible">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-900/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-900/5 rounded-full blur-3xl"></div>
      </div>

      {/* Animowane tło */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-black to-red-800/5"></div>
      
      {/* Animowane cząsteczki */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-2 h-2 bg-red-500 rounded-full animate-float-hover"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-red-400 rounded-full animate-float-hover" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-1.5 h-1.5 bg-red-300 rounded-full animate-float-hover" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 right-1/3 w-1 h-1 bg-red-600 rounded-full animate-float-hover" style={{animationDelay: '0.5s'}}></div>
      </div>
      
      <div className="container mx-auto px-4 md:px-4 relative z-10">
        {/* Header */}
        <div className={`text-center mb-12 md:mb-16 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-full mb-8 animate-pulse-glow shadow-lg shadow-red-500/30 transition-all duration-1000 ease-out" style={{transitionDelay: isVisible ? '200ms' : '0ms'}}>
            <Package className="w-10 h-10 text-white" />
          </div>
          <h1 className={`text-4xl md:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent leading-tight transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{transitionDelay: isVisible ? '400ms' : '0ms'}}>
            POZNAJ NASZ PRODUKT
          </h1>
          <h2 className={`text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{transitionDelay: isVisible ? '600ms' : '0ms'}}>
            Tworzymy dywaniki samochodowe, które łączą w sobie bezkompromisową jakość, nowoczesny design i maksymalną funkcjonalność. Odkryj unikalne rozwiązania, które podniosą standard Twojej codziennej jazdy.
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {advantagesItems.map((item, index) => {
            const Icon = item.icon;
            const isHoveredState = hoveredItem === item.id;
            
            return (
              <div
                key={item.id}
                className={`
                  group relative cursor-pointer rounded-2xl md:rounded-3xl p-1.5 md:p-2 transition-all duration-500 ease-out
                  ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 md:translate-y-20'}
                `}
                style={{ transitionDelay: `${index * 100}ms` }}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={() => handleItemClick(item.targetSection)}
              >
                {/* Card Content */}
                <div className={`
                  relative h-full bg-gray-900/40 backdrop-blur-md border border-white/5 rounded-xl md:rounded-2xl overflow-hidden
                  transition-all duration-500
                  ${isHoveredState ? 'bg-gray-800/60 border-red-500/30 transform -translate-y-1 md:-translate-y-2 shadow-xl md:shadow-2xl shadow-red-900/20' : 'hover:border-white/10'}
                `}>
                  
                  {/* Image Area */}
                  <div className="relative h-48 w-full overflow-hidden bg-black">
                    <Image
                      src={item.src}
                      alt={item.title}
                      fill
                      className={`object-cover transition-transform duration-700 ${isHoveredState ? 'scale-110' : 'scale-100'}`}
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent transition-opacity duration-500 ${isHoveredState ? 'opacity-80' : 'opacity-60'}`}></div>
                    
                    {/* Icon Badge */}
                    <div className={`
                      absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center
                      bg-white/10 backdrop-blur-md border border-white/20 text-white
                      transition-all duration-500
                      ${isHoveredState ? 'bg-red-600 border-red-500 scale-110 rotate-12' : ''}
                    `}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Text Area */}
                  <div className="p-4 md:p-6">
                    <h3 className={`
                      text-lg md:text-xl font-bold mb-2 transition-colors duration-300
                      ${isHoveredState ? 'text-white' : 'text-gray-200'}
                    `}>
                      {item.title}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-400 leading-relaxed mb-3 md:mb-4">
                      {item.description}
                    </p>
                    
                    <div className={`
                      flex items-center text-xs md:text-sm font-bold uppercase tracking-wider transition-all duration-300
                      ${isHoveredState ? 'text-red-500 translate-x-1 md:translate-x-2' : 'text-gray-600'}
                    `}>
                      Więcej <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
