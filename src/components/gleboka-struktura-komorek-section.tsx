"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function GlebokaStrukturaKomorekSection() {
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

    const section = document.getElementById('gleboka-struktura-komorek-section');
    if (section) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      title: "Niezwykła Elastyczność",
      description: "Pianka EVA odzyskuje kształt po każdym nacisku. Nie odkształca się trwale nawet po długotrwałym użytkowaniu, zachowując estetyczny wygląd przez lata."
    },
    {
      title: "Doskonała Izolacja",
      description: "Materiał skutecznie izoluje od temperatur zewnętrznych. Zatrzymuje ciepło zimą i nie nagrzewa się nadmiernie latem, zwiększając komfort podróży."
    },
    {
      title: "Właściwości Antybakteryjne",
      description: "Polimerowa struktura jest naturalnie odporna na rozwój grzybów i bakterii. Nie chłonie zapachów i jest bezpieczna dla alergików."
    },
    {
      title: "100% Wodoodporność",
      description: "Zamkniętokomórkowa struktura materiału sprawia, że jest on całkowicie nieprzemakalny. Wilgoć i brud pozostają w komórkach, nie przenikając na wykładzinę."
    }
  ];

  return (
    <section 
      id="gleboka-struktura-komorek-section" 
      className="py-20 md:py-24 bg-black relative overflow-hidden"
      role="region"
      aria-label="Cechy materiału EVA - struktura komórkowa"
    >
      {/* Gradient line top */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent z-10" aria-hidden="true" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Nowoczesny materiał <span className="text-red-500">EVA</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Technologia polimerowa, która zmienia standardy ochrony wnętrza samochodu.
            Lekkość, wytrzymałość i funkcjonalność w jednym materiale.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-7xl mx-auto">
          {/* Obrazek */}
          <div className={`relative order-2 lg:order-1 transition-all duration-1000 delay-200 ease-out ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-white/5 backdrop-blur-sm group">
              <div className="aspect-square relative">
                <Image
                  src="/images/zalety/pianka.webp"
                  alt="Struktura komórkowa materiału EVA w zbliżeniu"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 via-transparent to-transparent"></div>
              </div>
              
              {/* Subtle glass badge */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                <p className="text-white font-medium text-sm text-center">
                  Głęboka struktura komórek (Diamond/Plaster miodu) zatrzymuje do <span className="text-red-500 font-bold">1 litra</span> płynów.
                </p>
              </div>
            </div>
          </div>
          
          {/* Lista cech */}
          <div className={`flex flex-col justify-center space-y-10 order-1 lg:order-2 transition-all duration-1000 delay-400 ease-out ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="space-y-8">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="flex gap-6 group"
                >
                  <div className="flex-shrink-0 pt-1">
                    <span className="text-4xl font-bold text-white/10 group-hover:text-red-500/50 transition-colors duration-300 font-mono">
                      0{index + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-red-400 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed group-hover:text-gray-400 transition-colors duration-300">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Additional info */}
            <div className="pt-4 border-t border-white/10">
              <p className="text-sm text-gray-400 italic">
                Materiał EVA (etylen-octan winylu) jest bezpieczny, nietoksyczny i przyjazny dla środowiska.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
