"use client";

import { useState, useEffect } from "react";
import { Target, Sparkles, Zap, Star, ArrowRight } from "lucide-react";
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
    <section id="advantages-section" className="py-24 bg-black relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-900/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-900/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-bold uppercase tracking-widest mb-6">
            Dlaczego My?
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Poznaj Nasz <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600">Produkt</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Tworzymy dywaniki samochodowe, które łączą w sobie bezkompromisową jakość, 
            nowoczesny design i maksymalną funkcjonalność.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {advantagesItems.map((item, index) => {
            const Icon = item.icon;
            const isHoveredState = hoveredItem === item.id;
            
            return (
              <div
                key={item.id}
                className={`
                  group relative cursor-pointer rounded-3xl p-2 transition-all duration-500 ease-out
                  ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}
                `}
                style={{ transitionDelay: `${index * 100}ms` }}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={() => handleItemClick(item.targetSection)}
              >
                {/* Card Content */}
                <div className={`
                  relative h-full bg-gray-900/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden
                  transition-all duration-500
                  ${isHoveredState ? 'bg-gray-800/60 border-red-500/30 transform -translate-y-2 shadow-2xl shadow-red-900/20' : 'hover:border-white/10'}
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
                  <div className="p-6">
                    <h3 className={`
                      text-xl font-bold mb-2 transition-colors duration-300
                      ${isHoveredState ? 'text-white' : 'text-gray-200'}
                    `}>
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed mb-4">
                      {item.description}
                    </p>
                    
                    <div className={`
                      flex items-center text-sm font-bold uppercase tracking-wider transition-all duration-300
                      ${isHoveredState ? 'text-red-500 translate-x-2' : 'text-gray-600'}
                    `}>
                      Więcej <ArrowRight className="w-4 h-4 ml-2" />
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
