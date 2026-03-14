"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ArrowRight, Palette, CheckCircle } from "lucide-react";
import Link from "next/link";

const colorVariants = [
  { name: "Czarny", hex: "#222222", type: "classic" },
  { name: "Ciemnoszary", hex: "#4a4a4a", type: "classic" },
  { name: "Jasnobeżowy", hex: "#d1b48c", type: "classic" },
  { name: "Kość słoniowa", hex: "#d9d7c7", type: "classic" },
  { name: "Brązowy", hex: "#4b2e1e", type: "classic" },
  { name: "Niebieski", hex: "#0084d1", type: "vibrant" },
  { name: "Czerwony", hex: "#d12d1c", type: "vibrant" },
  { name: "Bordowy", hex: "#6d2635", type: "vibrant" },
  { name: "Pomarańczowy", hex: "#ff7b1c", type: "vibrant" },
  { name: "Żółty", hex: "#ffe100", type: "vibrant" },
  { name: "Zielony", hex: "#1b5e3c", type: "vibrant" },
  { name: "Jasnozielony", hex: "#8be000", type: "vibrant" },
  { name: "Różowy", hex: "#ff7eb9", type: "vibrant" },
  { name: "Fioletowy", hex: "#7c4bc8", type: "vibrant" },
];

const colorImages: Record<string, string> = {
  "Czarny": "/images/kolory dywanikow/czarny.jpg",
  "Ciemnoszary": "/images/kolory dywanikow/szare.jpg",
  "Jasnobeżowy": "/images/kolory dywanikow/jasnobezowy.jpg",
  "Niebieski": "/images/kolory dywanikow/niebieski.jpg",
  "Bordowy": "/images/kolory dywanikow/bordowy.jpg",
  "Pomarańczowy": "/images/kolory dywanikow/pomaranczowy.jpg",
  "Kość słoniowa": "/images/kolory dywanikow/kosc_sloniowa.jpg",
  "Brązowy": "/images/kolory dywanikow/brazowy.jpg",
  "Czerwony": "/images/kolory dywanikow/czerwony.jpg",
};

export default function RoznorodnaKolorystykaSection() {
  const [selectedColor, setSelectedColor] = useState(colorVariants[0]);
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

    const section = document.getElementById('roznorodna-kolorystyka-section');
    if (section) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="roznorodna-kolorystyka-section" className="py-20 md:py-24 bg-neutral-950 relative overflow-hidden">
      {/* Gradient line top */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent z-10" aria-hidden="true" />

      {/* Background Glow */}
      <div 
        className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] blur-[150px] rounded-full opacity-10 transition-colors duration-1000 pointer-events-none"
        style={{ backgroundColor: selectedColor.hex }}
      />

      {/* Animowane tło */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/5 via-neutral-950 to-red-800/5 pointer-events-none"></div>
      
      {/* Animowane cząsteczki */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-red-500 rounded-full animate-float-hover"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-red-400 rounded-full animate-float-hover" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-1.5 h-1.5 bg-red-300 rounded-full animate-float-hover" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 right-1/3 w-1 h-1 bg-red-600 rounded-full animate-float-hover" style={{animationDelay: '0.5s'}}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className={`text-center mb-16 md:mb-24 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight break-words px-2 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{transitionDelay: isVisible ? '400ms' : '0ms'}}>
            Kolorystyka <span className="text-red-500">Premium</span>
          </h2>
          <p className={`text-sm sm:text-base md:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed px-2 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{transitionDelay: isVisible ? '600ms' : '0ms'}}>
            Dopasuj kolor dywaników do wnętrza swojego samochodu lub stwórz kontrastowy akcent. Oferujemy szeroką paletę barw, od klasycznej elegancji po żywe, sportowe odcienie.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
          {/* Left Column: Image Preview */}
          <div className={`transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div className="relative group">
              {/* Glass Container - Consistent with other sections */}
              <div className="relative bg-white/5 backdrop-blur-md rounded-3xl p-2 border border-white/10 shadow-2xl shadow-black/50 overflow-hidden group-hover:border-red-500/20 transition-all duration-500">
                <div className="relative rounded-2xl overflow-hidden aspect-square bg-neutral-900">
                  {colorImages[selectedColor.name] ? (
                    <Image
                      src={colorImages[selectedColor.name]}
                      alt={`Dywaniki w kolorze ${selectedColor.name}`}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-900 text-gray-500 p-6 text-center">
                      <Palette className="w-12 h-12 mb-4 opacity-20" />
                      <span>Podgląd dla koloru {selectedColor.name} niedostępny</span>
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  
                  {/* Label Overlay */}
                  <div className="absolute bottom-6 left-6 z-20">
                    <div className="px-4 py-2 bg-neutral-950/80 backdrop-blur-md border border-white/10 rounded-xl text-white font-bold text-sm flex items-center gap-2 shadow-lg">
                      <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: selectedColor.hex }}></div>
                      {selectedColor.name.toUpperCase()}
                    </div>
                  </div>
                </div>
                
                {/* Shine Effect */}
                <div className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                  <div className="absolute inset-0 transform -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Controls */}
          <div className={`transition-all duration-1000 ease-out delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="space-y-10">
              
              {/* Classic Colors */}
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/5">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
                  Klasyczne Odcienie
                </h4>
                <div className="flex flex-wrap gap-3">
                  {colorVariants.filter(c => c.type === 'classic').map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        "w-12 h-12 rounded-full border-2 transition-all duration-300 hover:scale-110 relative group shadow-lg",
                        selectedColor.name === color.name 
                          ? "border-white scale-110 ring-4 ring-white/10 shadow-xl" 
                          : "border-transparent hover:border-white/30"
                      )}
                      style={{ backgroundColor: color.hex }}
                      aria-label={`Wybierz kolor ${color.name}`}
                    >
                      <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-xs text-white opacity-0 group-hover:opacity-100 whitespace-nowrap bg-neutral-900 border border-white/10 px-3 py-1.5 rounded-lg transition-all duration-200 pointer-events-none z-50 shadow-xl transform translate-y-2 group-hover:translate-y-0">
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Vibrant Colors */}
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/5">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></div>
                  Żywe Barwy
                </h4>
                <div className="flex flex-wrap gap-3">
                  {colorVariants.filter(c => c.type === 'vibrant').map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        "w-12 h-12 rounded-full border-2 transition-all duration-300 hover:scale-110 relative group shadow-lg",
                        selectedColor.name === color.name 
                          ? "border-white scale-110 ring-4 ring-white/10 shadow-xl" 
                          : "border-transparent hover:border-white/30"
                      )}
                      style={{ backgroundColor: color.hex }}
                      aria-label={`Wybierz kolor ${color.name}`}
                    >
                      <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-xs text-white opacity-0 group-hover:opacity-100 whitespace-nowrap bg-neutral-900 border border-white/10 px-3 py-1.5 rounded-lg transition-all duration-200 pointer-events-none z-50 shadow-xl transform translate-y-2 group-hover:translate-y-0">
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="pt-4">
                <Link href="/konfigurator" className="block">
                  <button className="
                    w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 
                    text-white font-bold uppercase tracking-wide py-4 px-8 rounded-full 
                    shadow-xl shadow-red-900/30 hover:shadow-2xl hover:shadow-red-600/20 
                    transition-all duration-300 transform hover:scale-105 active:scale-95
                    flex items-center justify-center gap-2 min-h-[44px]
                  ">
                    Przejdź do konfiguratora
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
                <p className="text-center sm:text-left text-xs text-gray-500 mt-4 px-2">
                  * Kolory na ekranie mogą nieznacznie różnić się od rzeczywistych.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
