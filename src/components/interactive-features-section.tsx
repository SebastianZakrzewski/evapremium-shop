"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const features = [
  {
    id: "ranty",
    title: "Ranty o wysokości 5cm",
    description: "Wysokie na 5 cm ranty skutecznie zatrzymują wodę, błoto i śnieg, chroniąc oryginalną wykładzinę samochodu przed zabrudzeniem.",
    area: { top: "19%", left: "44%", width: "42%", height: "8%" },
    image: "/7.webp"
  },
  {
    id: "3d",
    title: "Wyprofilowania 3D",
    description: "Idealne dopasowanie do kształtu podłogi dzięki technologii skanowania 3D, co gwarantuje brak wolnych przestrzeni i przesuwania się dywaników.",
    area: { top: "36.5%", left: "22%", width: "35%", height: "8%" },
    image: "/images/zalety/3d-jezor-detail.png"
  },
  {
    id: "mocowania",
    title: "Oryginalne mocowania",
    description: "Wykorzystujemy fabryczne systemy mocowań (stoppery), dzięki czemu dywaniki są stabilne i bezpieczne podczas jazdy.",
    area: { top: "54%", left: "6%", width: "41%", height: "8%" },
    image: "/images/zalety/rzepy.png"
  },
  {
    id: "przykrycie",
    title: "95% przykrycie podłogi",
    description: "Maksymalna ochrona podłogi Twojego auta. Nasze dywaniki pokrywają aż do 95% powierzchni, chroniąc to, co najważniejsze.",
    area: { top: "60.5%", left: "51%", width: "42%", height: "8%" },
    image: "/1.webp"
  },
  {
    id: "kolory",
    title: "250+ połączeń kolorystycznych",
    description: "Stwórz unikalny wygląd wnętrza swojego samochodu. Wybieraj spośród setek kombinacji kolorów materiału i obszycia.",
    area: { top: "82.5%", left: "13%", width: "55%", height: "8%" },
    image: "/images/zalety/roznorodna-kolorystyka-v2.png"
  },
];

export default function InteractiveFeaturesSection() {
  // Domyślnie wybrana pierwsza cecha
  const [activeFeature, setActiveFeature] = useState<string>(features[0].id);
  const [isVisible, setIsVisible] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  const activeFeatureData = features.find(f => f.id === activeFeature) || features[0];

  // Efekt przejścia (fade) przy zmianie zdjęcia
  useEffect(() => {
    if (imageRef.current) {
      imageRef.current.classList.remove("opacity-0");
      void imageRef.current.offsetWidth;
      imageRef.current.classList.add("opacity-0");
      setTimeout(() => {
        if (imageRef.current) imageRef.current.classList.remove("opacity-0");
      }, 200);
    }
  }, [activeFeature]);

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
      className="py-20 md:py-24 bg-black relative overflow-hidden"
    >
      {/* Gradient line top */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent z-10" aria-hidden="true" />

      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-tr from-red-900/5 via-black to-black pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className={`text-center mb-16 md:mb-20 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Poznaj <span className="text-red-500">innowacyjne cechy</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Kliknij na etykiety na zdjęciu, aby dowiedzieć się więcej o rozwiązaniach, które zastosowaliśmy w naszych dywanikach EVA.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-start max-w-7xl mx-auto">
          
          {/* Prawa strona: Zdjęcie szczegółowe + Opis */}
          <div className={`order-2 lg:order-2 transition-all duration-1000 ease-out sticky top-24 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="relative group">
              {/* Kontener na zdjęcie */}
              <div className="relative bg-white/5 backdrop-blur-md rounded-3xl p-2 border border-white/10 shadow-2xl shadow-black/50 overflow-hidden group-hover:border-red-500/20 transition-all duration-500">
                <div className="relative rounded-2xl overflow-hidden bg-[#111] flex">
                  <Image
                    ref={imageRef}
                    src={activeFeatureData.image}
                    alt={activeFeatureData.title}
                    width={1000}
                    height={1000}
                    className="w-full h-auto transition-all duration-500 opacity-100"
                    style={{ transition: 'opacity 0.4s' }}
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
              <div className="mt-8 p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10">
                <h3 className="text-2xl font-bold text-white mb-4 transition-all duration-500">
                  {activeFeatureData.title}
                </h3>
                <p className="text-gray-400 leading-relaxed transition-all duration-500">
                  {activeFeatureData.description}
                </p>
              </div>
            </div>
          </div>

          {/* Lewa strona: Interaktywny dywanik */}
          <div className={`order-1 lg:order-1 transition-all duration-1000 ease-out delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div className="relative w-full aspect-square max-w-[600px] mx-auto rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 bg-[#111]">
              <Image
                src="/images/interactive-mat.png"
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
                    onClick={() => setActiveFeature(feature.id)}
                    className={cn(
                      "absolute rounded-full transition-all duration-300 z-20 cursor-pointer",
                      isActive 
                        ? "bg-red-500/20 border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]" 
                        : "bg-transparent border-2 border-transparent hover:bg-white/10 hover:border-white/50"
                    )}
                    style={{ 
                      top: feature.area.top, 
                      left: feature.area.left,
                      width: feature.area.width,
                      height: feature.area.height,
                      transitionDelay: isVisible && !isActive ? `${400 + (index * 150)}ms` : '0ms'
                    }}
                    aria-label={`Zobacz cechę: ${feature.title}`}
                  >
                    {/* Efekt pulsowania dla aktywnego elementu */}
                    {isActive && (
                      <span className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
                    )}
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
