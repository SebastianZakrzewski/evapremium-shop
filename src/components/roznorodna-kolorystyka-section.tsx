"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { ArrowRight, Palette } from "lucide-react";
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
  "Czerwony": "/images/kolory dywanikow/czerwony.jpg", // Placeholder if exists
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
    <section id="roznorodna-kolorystyka-section" className="py-12 md:py-16 bg-black relative overflow-hidden">
      {/* Background Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] blur-[120px] rounded-full opacity-20 transition-colors duration-700 pointer-events-none"
        style={{ backgroundColor: selectedColor.hex }}
      />

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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-full mb-8 animate-pulse-glow shadow-lg shadow-red-500/30 transition-all duration-1000 ease-out" style={{transitionDelay: isVisible ? '200ms' : '0ms'}}>
            <Palette className="w-10 h-10 text-white" />
          </div>
          <h1 className={`text-4xl md:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent leading-tight transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{transitionDelay: isVisible ? '400ms' : '0ms'}}>
            KOLORYSTYKA PREMIUM
          </h1>
          <h2 className={`text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{transitionDelay: isVisible ? '600ms' : '0ms'}}>
            Dopasuj kolor dywaników do wnętrza swojego samochodu lub stwórz kontrastowy akcent.
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
          {/* Preview Area */}
          <div className="w-full lg:w-1/2 aspect-square relative bg-[#111] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
             <div className="absolute inset-0 bg-black/40 z-10 transition-opacity duration-500" />
             {colorImages[selectedColor.name] ? (
               <Image
                 src={colorImages[selectedColor.name]}
                 alt={`Dywaniki w kolorze ${selectedColor.name}`}
                 fill
                 className="object-cover transition-transform duration-500 hover:scale-105"
               />
             ) : (
               <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a] text-gray-600">
                 <span>Brak podglądu dla koloru {selectedColor.name}</span>
               </div>
             )}
             
             {/* Label Overlay */}
             <div className="absolute bottom-6 left-6 z-20">
               <span className="px-4 py-2 bg-black/80 backdrop-blur-md border border-white/10 rounded-lg text-white font-mono text-sm">
                 {selectedColor.name.toUpperCase()}
               </span>
             </div>
          </div>

          {/* Controls */}
          <div className="w-full lg:w-1/2 space-y-10">
            {/* Classic Colors */}
            <div>
              <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Klasyczne Odcienie</h4>
              <div className="flex flex-wrap gap-3">
                {colorVariants.filter(c => c.type === 'classic').map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      "w-12 h-12 rounded-full border-2 transition-all duration-300 hover:scale-110 relative group",
                      selectedColor.name === color.name ? "border-white scale-110 ring-4 ring-white/10" : "border-transparent"
                    )}
                    style={{ backgroundColor: color.hex }}
                    aria-label={`Wybierz kolor ${color.name}`}
                  >
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-white opacity-0 group-hover:opacity-100 whitespace-nowrap bg-black px-2 py-1 rounded transition-opacity pointer-events-none z-50">
                      {color.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Vibrant Colors */}
            <div>
              <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Żywe Barwy</h4>
              <div className="flex flex-wrap gap-3">
                {colorVariants.filter(c => c.type === 'vibrant').map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      "w-12 h-12 rounded-full border-2 transition-all duration-300 hover:scale-110 relative group",
                      selectedColor.name === color.name ? "border-white scale-110 ring-4 ring-white/10" : "border-transparent"
                    )}
                    style={{ backgroundColor: color.hex }}
                    aria-label={`Wybierz kolor ${color.name}`}
                  >
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-white opacity-0 group-hover:opacity-100 whitespace-nowrap bg-black px-2 py-1 rounded transition-opacity pointer-events-none z-50">
                      {color.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-white/10">
              <p className="text-gray-400 mb-6">
                Nie możesz się zdecydować? Sprawdź nasz konfigurator i zobacz pełną wizualizację.
              </p>
              <Link href="/konfigurator">
                <Button className="bg-white text-black hover:bg-gray-200 px-8 py-6 text-lg rounded-full group">
                  Przejdź do konfiguratora
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
