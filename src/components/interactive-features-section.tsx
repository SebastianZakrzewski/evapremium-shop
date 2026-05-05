"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const features = [
  {
    id: "ochrona",
    title: "Doskonała ochrona",
    description: "Ranty 3D o wysokości do 8 cm skutecznie chronią przed wnikaniem brudu, wilgoci i zanieczyszczeń pod dywanik, zapewniając długotrwałą ochronę podłogi Twojego samochodu.",
    position: { top: "25%", left: "20%" },
    image: "/7.webp"
  },
  {
    id: "jezor",
    title: "3D Jęzor",
    description: "Jęzor 3D pod pedałami gazu jest zintegrowany z dywanikiem, nie przesuwa się i skutecznie chroni wykładzinę w miejscu najbardziej narażonym na zużycie.",
    position: { top: "12%", left: "65%" },
    image: "/images/zalety/3d-jezor-detail.png"
  },
  {
    id: "bezpieczenstwo",
    title: "Bezpieczeństwo",
    description: "Specjalne antypoślizgowe właściwości dywaników 3D zapewniają maksymalne bezpieczeństwo podczas jazdy. Materiał EVA o wysokiej gęstości zapobiega przesuwaniu się dywaników.",
    position: { top: "45%", left: "35%" },
    image: "/1.webp"
  },
  {
    id: "czyszczenie",
    title: "Łatwość czyszczenia",
    description: "Głęboka struktura komórek 3D ułatwia szybkie i skuteczne czyszczenie dywaników. Brud i zanieczyszczenia nie wnikają głęboko w materiał, co pozwala na łatwe usunięcie ich za pomocą wody.",
    position: { top: "60%", left: "65%" },
    image: "/komorki.png"
  },
  {
    id: "rzep",
    title: "Rzep na każdym rogu",
    description: "Specjalne rzepy umieszczone na każdym rogu dywanika zapewniają idealne dopasowanie do podłogi samochodu. Dzięki temu dywaniki pozostają na swoim miejscu nawet podczas dynamicznej jazdy.",
    position: { top: "75%", left: "25%" },
    image: "/images/zalety/rzepy.png"
  },
  {
    id: "grubosc",
    title: "Grubość 10mm",
    description: "Grubość dywanika wynosząca 10mm została starannie dobrana, aby zapewnić doskonałą amortyzację, komfort jazdy oraz skuteczną ochronę wykładziny samochodowej.",
    position: { top: "85%", left: "75%" },
    image: "/images/zalety/10mm.png"
  },
];

export default function InteractiveFeaturesSection() {
  // Domyślnie wybrana pierwsza cecha
  const [activeFeature, setActiveFeature] = useState<string>(features[0].id);
  const [displayedFeature, setDisplayedFeature] = useState(features[0]);
  const [isFading, setIsFading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const detailsRef = useRef<HTMLDivElement>(null);

  const handleFeatureClick = (id: string) => {
    if (id === activeFeature) return; // Ignoruj kliknięcie w już aktywną cechę
    
    setActiveFeature(id);
    setIsFading(true); // Rozpocznij zanikanie
    
    // Po zakończeniu zanikania (300ms), zmień dane i pokaż ponownie
    setTimeout(() => {
      const newFeature = features.find(f => f.id === id) || features[0];
      setDisplayedFeature(newFeature);
      setIsFading(false);
    }, 300);
    
    // Automatyczne przewijanie na urządzeniach mobilnych
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setTimeout(() => {
        if (detailsRef.current) {
          const yOffset = -100; // Margines od góry (np. na sticky navbar)
          const y = detailsRef.current.getBoundingClientRect().top + window.scrollY + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 350); // Przewijamy po zakończeniu animacji fade
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById('interactive-features');
    if (section) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      id="interactive-features" 
      className="py-10 md:py-14 bg-black relative overflow-hidden"
    >
      {/* Gradient line top */}
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-tr from-red-900/5 via-black to-black pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className={`text-center mb-8 md:mb-10 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Poznaj <span className="text-red-500">innowacyjne cechy</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Kliknij na etykiety na zdjęciu, aby dowiedzieć się więcej o rozwiązaniach, które zastosowaliśmy w naszych dywanikach EVA.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-start max-w-7xl mx-auto">
          
          {/* Prawa strona: Zdjęcie szczegółowe + Opis */}
          <div ref={detailsRef} className={`order-2 lg:order-2 transition-all duration-1000 ease-out sticky top-24 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="relative group">
              {/* Kontener na zdjęcie */}
              <div className="relative bg-white/5 backdrop-blur-md rounded-3xl p-2 border border-white/10 shadow-2xl shadow-black/50 overflow-hidden group-hover:border-red-500/20 transition-all duration-500">
                <div className={cn("relative rounded-2xl overflow-hidden bg-[#111] flex transition-opacity duration-300 ease-in-out", isFading ? "opacity-0" : "opacity-100")}>
                  <Image
                    src={displayedFeature.image}
                    alt={displayedFeature.title}
                    width={1000}
                    height={1000}
                    className="w-full h-auto"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                </div>
                
                {/* Shine Effect */}
                <div className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                  <div className="absolute inset-0 transform -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>
              </div>
              
              {/* Opis pod zdjęciem */}
              <div className={cn("mt-8 p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 transition-opacity duration-300 ease-in-out", isFading ? "opacity-0" : "opacity-100")}>
                <h3 className="text-2xl font-bold text-white mb-4">
                  {displayedFeature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {displayedFeature.description}
                </p>
              </div>
            </div>
          </div>

          {/* Lewa strona: Interaktywny dywanik */}
          <div className={`order-1 lg:order-1 transition-all duration-1000 ease-out delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div className="relative w-full aspect-square max-w-[600px] mx-auto rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 bg-[#111]">
              <Image
                src="/images/interactive-mat-clean.png"
                alt="Dywaniki EVA - cechy"
                fill
                className="object-cover opacity-90"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              
              {/* Interaktywne obszary na etykietach */}
              {features.map((feature, index) => {
                const isActive = activeFeature === feature.id;
                return (
                  <button
                    key={feature.id}
                    onClick={() => handleFeatureClick(feature.id)}
                    className={cn(
                      "absolute -translate-x-1/2 -translate-y-1/2 px-4 py-2 rounded-full font-bold text-xs sm:text-sm whitespace-nowrap z-20 shadow-xl border-2",
                      isActive 
                        ? "bg-red-600 text-white border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.6)]" 
                        : "bg-white/90 text-black border-transparent hover:bg-white"
                    )}
                    style={{ 
                      top: feature.position.top, 
                      left: feature.position.left,
                      transitionDelay: isVisible && !isActive ? `${400 + (index * 150)}ms` : '0ms'
                    }}
                    aria-label={`Zobacz cechę: ${feature.title}`}
                  >
                    {feature.title}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
