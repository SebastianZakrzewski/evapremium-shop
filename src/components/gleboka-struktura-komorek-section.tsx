"use client";

import { useState } from "react";
import Image from "next/image";
import { Zap, Shield, Droplets, Sparkles, CheckCircle, Star, ArrowRight } from "lucide-react";

export default function GlebokaStrukturaKomorekSection() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      id: 1,
      icon: Droplets,
      title: "100% Wodoodporny",
      description: "Materiał EVA całkowicie odporny na wilgoć i wodę",
      color: "from-red-500 to-red-600"
    },
    {
      id: 2,
      icon: Shield,
      title: "Ochrona 360°",
      description: "Kompletna ochrona podłogi przed brudem i zabrudzeniami",
      color: "from-red-600 to-red-700"
    },
    {
      id: 3,
      icon: Sparkles,
      title: "Łatwe Czyszczenie",
      description: "Wystarczy woda i mydło - bez chemikaliów",
      color: "from-red-400 to-red-500"
    }
  ];

  return (
    <section id="gleboka-struktura-komorek-section" className="py-12 md:py-16 bg-black relative overflow-hidden">
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
        <div className="text-center mb-12 transition-all duration-1000 ease-out">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-full mb-6 animate-pulse-glow">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white via-red-100 to-white bg-clip-text text-transparent">
            NOWOCZESNY MATERIAŁ EVA
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            <span className="text-red-400 font-semibold">Najwyższej jakości pianka EVA</span> o grubości 
            <span className="text-red-300 font-semibold"> 10mm</span> - rewolucja w ochronie wnętrza Twojego auta. 
            <span className="text-red-200"> Maksymalna ochrona</span> i komfort w jednym.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-12 items-center justify-center">
          {/* Obrazek */}
          <div className="relative w-full md:w-1/2 flex justify-center">
            <div className="relative bg-black rounded-2xl p-6 shadow-2xl w-full max-w-md">
              <Image
                src="/images/zalety/pianka.webp"
                alt="Nowoczesny Materiał EVA"
                width={800}
                height={800}
                className="w-full h-auto rounded-xl object-cover"
              />
              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-red-500 to-red-700 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-bounce">
                <Star className="w-4 h-4 inline mr-1" />
                100% WODODPORNY
              </div>
            </div>
          </div>
          
          {/* Opis cechy */}
          <div className="w-full md:w-1/2 flex flex-col items-center">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Dlaczego to ważne?</h3>
            <p className="text-gray-200 text-lg text-center mb-4">
              Nowoczesny materiał EVA z głęboką strukturą komórek działa jak bariera, która blokuje przedostawanie się zabrudzeń i wilgoci do wnętrza samochodu. Dzięki temu dywaniki EVA są nie tylko łatwe w czyszczeniu, ale także skutecznie chronią podłogę auta.
            </p>
            
            {/* Interaktywne karty funkcji */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {features.map((feature) => (
                <div
                  key={feature.id}
                  className={`relative p-4 rounded-xl border transition-all duration-300 cursor-pointer group ${
                    hoveredFeature === feature.id
                      ? 'border-red-400/50 bg-gradient-to-br from-red-500/10 to-red-600/10 scale-105 shadow-lg shadow-red-500/20'
                      : 'border-gray-700 bg-gray-800/50 hover:border-red-400/30 hover:bg-gray-800/70'
                  }`}
                  onMouseEnter={() => setHoveredFeature(feature.id)}
                  onMouseLeave={() => setHoveredFeature(null)}
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-white font-bold text-sm mb-1">{feature.title}</h4>
                  <p className="text-gray-400 text-xs">{feature.description}</p>
                  
                  {/* Hover effect */}
                  {hoveredFeature === feature.id && (
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-red-600/5 rounded-xl"></div>
                  )}
                </div>
              ))}
            </div>
            
            <ul className="list-disc text-left text-gray-300 pl-6 space-y-2">
              <li>Skuteczne zatrzymywanie błota, piasku i wody</li>
              <li>Łatwe opróżnianie i czyszczenie dywaników</li>
              <li>Ochrona przed nieprzyjemnymi zapachami</li>
              <li>Wytrzymałość i trwałość na lata</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
} 