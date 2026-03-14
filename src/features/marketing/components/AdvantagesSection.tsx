"use client";

import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react"
import Image from "next/image";

const advantagesItems = [
  {
    id: 1,
    src: "/images/zalety/dywanik_z_rantami.png",
    title: "Dywaniki 3D z rantami",
    description: "Zaawansowana technologia 3D zapewnia doskonałe dopasowanie i trwałość",
    targetSection: "3d-mats-section"
  },
  {
    id: 2,
    src: "/images/zalety/szycie.png",
    title: "Szyte na miarę",
    description: "Każdy dywanik jest precyzyjnie dopasowany do konkretnego modelu samochodu",
    targetSection: "custom-fit-section"
  },
  {
    id: 3,
    src: "/kolory.png",
    title: "Różnorodna kolorystyka",
    description: "Szeroka paleta kolorów dopasowana do wnętrza Twojego auta",
    targetSection: "roznorodna-kolorystyka-section"
  },
  {
    id: 4,
    src: "/images/zalety/pianka.webp",
    title: "Nowoczesny Materiał EVA",
    description: "Specjalna struktura materiału EVA skutecznie zatrzymuje brud i wilgoć",
    targetSection: "gleboka-struktura-komorek-section"
  }
]

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

  const handleCardKeyDown = (e: React.KeyboardEvent, targetId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleItemClick(targetId)
    }
  }

  return (
    <section
      id="advantages-section"
      className="w-full bg-neutral-950 py-20 md:py-24 relative overflow-x-hidden overflow-y-visible"
      role="region"
      aria-label="Poznaj nasz produkt - zalety dywaników EVA Premium"
    >
      {/* Gradient line top - spójność z QuickSearchBar i ProductGallery */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent z-10" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header - spójny z QuickSearchBar i ProductGallery */}
        <div className={`text-center mb-12 md:mb-16 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 md:mb-6 leading-tight break-words px-2 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{transitionDelay: isVisible ? '200ms' : '0ms'}}>
            Poznaj nasz <span className="text-red-500">produkt</span>
          </h2>
          <p className={`text-sm sm:text-base md:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed px-2 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{transitionDelay: isVisible ? '400ms' : '0ms'}}>
            Tworzymy dywaniki samochodowe, które łączą w sobie bezkompromisową jakość, nowoczesny design i maksymalną funkcjonalność. Odkryj unikalne rozwiązania, które podniosą standard Twojej codziennej jazdy.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {advantagesItems.map((item, index) => {
            const isHoveredState = hoveredItem === item.id;
            
            return (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                className={`
                  group relative cursor-pointer rounded-3xl transition-all duration-500 ease-out h-full
                  ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 md:translate-y-20'}
                `}
                style={{ transitionDelay: `${index * 100}ms` }}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={() => handleItemClick(item.targetSection)}
                onKeyDown={(e) => handleCardKeyDown(e, item.targetSection)}
                aria-label={`${item.title} - ${item.description}. Kliknij, aby zobaczyć więcej.`}
              >
                {/* Card Content */}
                <div className={`
                  relative h-full flex flex-col
                  bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden
                  transition-all duration-500
                  ${isHoveredState 
                    ? 'bg-white/10 border-red-500/30 transform -translate-y-2 shadow-2xl shadow-red-900/20' 
                    : 'hover:border-white/20 shadow-xl shadow-red-900/30'}
                `}>
                  
                  {/* Image Area */}
                  <div className="relative h-56 w-full overflow-hidden bg-neutral-900/50">
                    <Image
                      src={item.src}
                      alt={item.title}
                      fill
                      className={`object-cover transition-transform duration-700 ${isHoveredState ? 'scale-110' : 'scale-100'}`}
                    />
                    {/* Gradient Overlay - spójny z BrandCard */}
                    <div className={`absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent transition-opacity duration-500 ${isHoveredState ? 'opacity-60' : 'opacity-80'}`}></div>
                    
                    {/* Shine Effect - spójny z BrandCard */}
                    <div className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                      <div className="absolute inset-0 transform -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    </div>
                  </div>

                  {/* Text Area */}
                  <div className="p-6 md:p-8 flex-1 flex flex-col justify-between bg-neutral-900/30">
                    <div>
                      <h3 className={`
                        text-xl font-bold mb-3 transition-colors duration-300
                        ${isHoveredState ? 'text-white' : 'text-gray-100'}
                      `}>
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-300 leading-relaxed mb-4">
                        {item.description}
                      </p>
                    </div>
                    
                    <div className={`
                      flex items-center text-xs font-bold uppercase tracking-wider transition-all duration-300 mt-auto
                      ${isHoveredState ? 'text-red-500 translate-x-2' : 'text-gray-400'}
                    `}>
                      Więcej <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-2" />
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
