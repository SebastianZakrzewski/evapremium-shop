"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { useState } from "react";

const colorVariants = [
  { name: "Niebieski", color: "#0084d1" },
  { name: "Czerwony", color: "#d12d1c" },
  { name: "Żółty", color: "#ffe100" },
  { name: "Kość słoniowa", color: "#d9d7c7" },
  { name: "Granatowy", color: "#1a355b" },
  { name: "Bordowy", color: "#6d2635" },
  { name: "Pomarańczowy", color: "#ff7b1c" },
  { name: "Jasnobeżowy", color: "#d1b48c" },
  { name: "Ciemnoszary", color: "#4a4a4a" },
  { name: "Fioletowy", color: "#7c4bc8" },
  { name: "Jasnozielony", color: "#8be000" },
  { name: "Beżowy", color: "#b48a5a" },
  { name: "Różowy", color: "#ff7eb9" },
  { name: "Czarny", color: "#222" },
  { name: "Zielony", color: "#1b5e3c" },
  { name: "Brązowy", color: "#4b2e1e" },
];

// Przykładowe mapowanie kolorów na zdjęcia dywaników w autach
const colorImages: Record<string, string> = {
  "Czarny": "/images/real/kia-czarny.jpg", // <- tu wstaw ścieżkę do zdjęcia z auta
  "Ciemnoszary": "/images/kolory dywanikow/szare.jpg", // <- nowe zdjęcie dla ciemnoszarego
  "Jasnobeżowy": "/images/kolory dywanikow/jasnobezowy.jpg",
  "Niebieski": "/images/kolory dywanikow/niebieski.jpg", // <- nowe zdjęcie dla niebieskiego
  // Dodaj kolejne kolory, jeśli masz zdjęcia
};

export default function RoznorodnaKolorystykaSection() {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  return (
    <section id="roznorodna-kolorystyka-section" className="py-12 md:py-16 bg-black relative overflow-hidden">
      {/* Animowane tło */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-black to-orange-600/5"></div>
      {/* Animowane cząsteczki */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-2 h-2 bg-yellow-400 rounded-full animate-float-hover"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-orange-400 rounded-full animate-float-hover" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-float-hover" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 right-1/3 w-1 h-1 bg-orange-600 rounded-full animate-float-hover" style={{animationDelay: '0.5s'}}></div>
      </div>
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 transition-all duration-1000 ease-out">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-6 animate-pulse-glow">
            <Star className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent">
            RÓŻNORODNA KOLORYSTYKA
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            Szeroka paleta kolorów dopasowana do wnętrza Twojego auta. Wybierz swój styl!
          </p>
          <p className="text-base text-yellow-300 mt-2 max-w-2xl mx-auto">
            Pełna konfiguracja kolorystyczna (materiał + obszycie) dostępna jest w <b>konfiguratorze</b> podczas personalizacji zamówienia. Poniżej prezentujemy przykładowe kolory materiału dywanika w realnych autach.
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-12 items-center justify-center">
          {/* Obrazek */}
          <div className="relative w-full md:w-1/2 flex justify-center">
            <div className="relative bg-black rounded-2xl p-12 shadow-2xl w-full max-w-2xl min-h-[520px] flex items-center justify-center">
              {selectedColor && colorImages[selectedColor] ? (
                <Image
                  src={colorImages[selectedColor]}
                  alt={`Dywanik w aucie - kolor ${selectedColor}`}
                  width={400}
                  height={400}
                  className="w-full h-auto rounded-xl object-cover transition-all duration-500"
                />
              ) : (
                <Image
                  src="/images/zalety/kolorystyka.png"
                  alt="Różnorodna kolorystyka dywaników"
                  width={400}
                  height={400}
                  className="w-full h-auto rounded-xl object-cover"
                />
              )}
            </div>
          </div>
          {/* Paleta kolorów */}
          <div className="w-full md:w-1/2 flex flex-col items-center">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Dostępne kolory</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
              {colorVariants.map((variant) => (
                <div key={variant.name} className="flex flex-col items-center">
                  <button
                    className={`w-12 h-12 rounded-full border-4 shadow-lg mb-2 transition-transform duration-300 hover:scale-110 focus:outline-none ${
                      selectedColor === variant.name ? 'border-yellow-400 ring-2 ring-yellow-300' : 'border-yellow-400'
                    }`}
                    style={{ background: variant.color }}
                    title={variant.name}
                    onClick={() => setSelectedColor(variant.name)}
                    aria-pressed={selectedColor === variant.name}
                  ></button>
                  <span className="text-sm text-gray-200 text-center">{variant.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 