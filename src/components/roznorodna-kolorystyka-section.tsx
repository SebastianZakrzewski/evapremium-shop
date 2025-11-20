"use client";

import { useState } from "react";
import Image from "next/image";
import SectionHeading from "./ui/section-heading";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
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

  return (
    <section className="py-20 bg-black relative overflow-hidden">
      {/* Background Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] blur-[120px] rounded-full opacity-20 transition-colors duration-700 pointer-events-none"
        style={{ backgroundColor: selectedColor.hex }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <SectionHeading 
          title="KOLORYSTYKA" 
          highlight="PREMIUM"
          subtitle="Dopasuj kolor dywaników do wnętrza swojego samochodu lub stwórz kontrastowy akcent."
        />

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
