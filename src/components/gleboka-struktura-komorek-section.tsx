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
      title: "Niezwykła Elastyczność",
      description: "Pianka EVA odzyskuje kształt po każdym nacisku - jak nowa przez lata",
      color: "from-red-500 to-red-600"
    },
    {
      id: 2,
      icon: Shield,
      title: "Doskonała Izolacja",
      description: "Zatrzymuje ciepło zimą, chłód latem - komfort w każdych warunkach",
      color: "from-red-600 to-red-700"
    },
    {
      id: 3,
      icon: Sparkles,
      title: "Antybakteryjny",
      description: "Naturalne właściwości antybakteryjne - brak nieprzyjemnych zapachów",
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
            <span className="text-red-400 font-semibold">Pianka EVA</span> - najnowocześniejszy materiał używany w 
            <span className="text-red-400 font-semibold"> samochodach premium</span>. 
            <span className="text-red-400 font-semibold"> Niezwykła elastyczność</span>, 
            <span className="text-red-400 font-semibold"> doskonała izolacja</span> i 
            <span className="text-red-400 font-semibold"> 100% wodoodporność</span> w jednym materiale.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
          {/* Obrazek */}
          <div className="relative flex justify-center">
            <div className="relative bg-black rounded-2xl p-6 shadow-2xl w-full max-w-lg">
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
          <div className="flex flex-col justify-center space-y-8">
            <div className="text-center lg:text-left">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">Dlaczego to ważne?</h3>
              <p className="text-gray-200 text-lg leading-relaxed">
                <span className="text-red-400 font-semibold">Pianka EVA</span> to materiał używany w 
                <span className="text-red-400 font-semibold"> samochodach luksusowych</span> - 
                <span className="text-red-400 font-semibold"> niezwykle elastyczna</span>, 
                <span className="text-red-400 font-semibold"> doskonale izolująca</span> i 
                <span className="text-red-400 font-semibold"> w 100% wodoodporna</span>. 
                <span className="text-red-400 font-semibold"> Odzyskuje kształt po każdym nacisku</span> i 
                <span className="text-red-400 font-semibold"> nie traci właściwości przez lata</span>.
              </p>
            </div>
            
            {/* Interaktywne karty funkcji */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            
            {/* Lista korzyści */}
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700">
              <h4 className="text-white font-bold text-xl mb-4 text-center lg:text-left">
                Kluczowe Zalety Pianki EVA
              </h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-300">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-red-400 mr-3 flex-shrink-0" />
                  <span><span className="text-red-400 font-semibold">Elastyczność</span> - odzyskuje kształt po każdym nacisku</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-red-400 mr-3 flex-shrink-0" />
                  <span><span className="text-red-400 font-semibold">Izolacja termiczna</span> - komfort w każdych warunkach</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-red-400 mr-3 flex-shrink-0" />
                  <span><span className="text-red-400 font-semibold">Antybakteryjność</span> - naturalne właściwości higieniczne</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-red-400 mr-3 flex-shrink-0" />
                  <span><span className="text-red-400 font-semibold">Wodoodporność</span> - 100% ochrona przed wilgocią</span>
                </li>
                <li className="flex items-center md:col-span-2">
                  <CheckCircle className="w-4 h-4 text-red-400 mr-3 flex-shrink-0" />
                  <span><span className="text-red-400 font-semibold">Trwałość</span> - nie traci właściwości przez lata</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 