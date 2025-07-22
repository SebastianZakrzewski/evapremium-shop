"use client";

import { useState, useEffect } from "react";
import { Target, Ruler, Car, CheckCircle, ArrowRight, Star, Zap, Search, MapPin, Calendar, Shield, ClipboardList, BarChart2, Scissors, Package, Truck, Pen } from "lucide-react";
import Image from "next/image";

const carBrands = [
  { 
    name: "BMW", 
    logo: "/images/products/bmw.png",
    models: ["Seria 1", "Seria 3", "Seria 5", "X1", "X3", "X5"],
    description: "Luksusowe niemieckie samochody z doskonałym dopasowaniem"
  },
  { 
    name: "Mercedes", 
    logo: "/images/products/mercedes.jpg",
    models: ["Klasa A", "Klasa C", "Klasa E", "GLA", "GLC", "GLE"],
    description: "Elegancja i komfort w każdym detalu"
  },
  { 
    name: "Audi", 
    logo: "/images/products/audi.jpg",
    models: ["A3", "A4", "A6", "Q3", "Q5", "Q7"],
    description: "Innowacyjne rozwiązania i sportowy charakter"
  },
  { 
    name: "Porsche", 
    logo: "/images/products/porsche.png",
    models: ["911", "Cayenne", "Macan", "Panamera"],
    description: "Sportowe osiągi i precyzyjne dopasowanie"
  },
  { 
    name: "Tesla", 
    logo: "/images/products/tesla.avif",
    models: ["Model 3", "Model S", "Model X", "Model Y"],
    description: "Przyszłość motoryzacji z idealnym dopasowaniem"
  }
];

const fitProcess = [
  {
    step: 1,
    icon: Search,
    title: "Wybierz markę",
    description: "Znajdź swoją markę w naszej bazie ponad 50 producentów"
  },
  {
    step: 2,
    icon: Car,
    title: "Wybierz model",
    description: "Określ dokładny model i rok produkcji swojego auta"
  },
  {
    step: 3,
    icon: Ruler,
    title: "Sprawdź dopasowanie",
    description: "Zobacz wizualizację idealnie dopasowanych dywaników"
  },
  {
    step: 4,
    icon: CheckCircle,
    title: "Zamów",
    description: "Zamów dywaniki szyte na miarę z gwarancją dopasowania"
  }
];

const benefits = [
  {
    icon: Target,
    title: "Precyzyjne dopasowanie",
    description: "Każdy dywanik jest dopasowany do konkretnego modelu z dokładnością do milimetra",
    color: "from-blue-500 to-cyan-600"
  },
  {
    icon: Shield,
    title: "Gwarancja dopasowania",
    description: "100% gwarancja, że dywaniki będą idealnie pasować do Twojego auta",
    color: "from-green-500 to-emerald-600"
  },
  {
    icon: Zap,
    title: "Szybka realizacja",
    description: "Realizacja zamówienia w ciągu 3-5 dni roboczych",
    color: "from-orange-500 to-red-600"
  },
  {
    icon: Star,
    title: "Oryginalne szablony",
    description: "Używamy oryginalnych szablonów producentów dla perfekcyjnego dopasowania",
    color: "from-purple-500 to-pink-600"
  }
];

const timelineSteps = [
  {
    icon: ClipboardList,
    title: "Przyjęcie zamówienia",
    day: "(1 dzień)"
  },
  {
    icon: BarChart2,
    title: "Weryfikacja modelu oraz szablonu",
    day: "(2 dzień)"
  },
  {
    icon: Scissors,
    title: "Cięcie dywaników",
    day: "(3 dzień)"
  },
  {
    icon: Pen,
    title: "Szycie dywaników",
    day: "(6 dzień)"
  },
  {
    icon: Package,
    title: "Formowanie 3D dywaników",
    day: "(9 dzień)"
  },
  {
    icon: CheckCircle,
    title: "Weryfikacja dopasowania dywaników",
    day: "(12 dzień)"
  },
  {
    icon: Truck,
    title: "Pakowanie oraz wysyłka",
    day: "(14 dzień)"
  }
];

export default function CustomFitSection() {
  return (
    <section id="custom-fit-section" className="py-12 md:py-16 bg-black relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 transition-all duration-1000 ease-out">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-full mb-8 animate-pulse-glow shadow-lg shadow-red-500/30">
            <Target className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-white via-red-100 to-white bg-clip-text text-transparent leading-tight">
            SZYTE NA MIARĘ DO TWOJEGO AUTA
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Każdy dywanik jest precyzyjnie dopasowany do konkretnego modelu samochodu z dokładnością do milimetra.
          </p>
        </div>
        {/* Timeline */}
        <div className="relative w-full flex flex-col items-center mt-16">
          {/* Linia główna */}
          <div className="absolute left-8 right-8 top-1/2 md:top-1/2 h-1 bg-gradient-to-r from-red-600 via-red-400 to-red-600 opacity-40 z-0" style={{height: '4px', top: '50%', transform: 'translateY(-50%)'}} />
          <div className="w-full flex flex-col md:flex-row items-center justify-between relative z-10">
            {timelineSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="flex flex-col items-center flex-1 min-w-[120px] max-w-[160px] mx-auto md:mx-0 group">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full border-4 border-red-500 bg-black shadow-lg group-hover:scale-110 transition-transform duration-300 animate-fade-in" style={{animationDelay: `${idx * 120}ms`}}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="mt-4 text-center">
                    <div className="text-white font-semibold text-base md:text-lg mb-1 animate-fade-in" style={{animationDelay: `${200 + idx * 120}ms`}}>{step.title}</div>
                    <div className="text-gray-400 text-xs md:text-sm animate-fade-in" style={{animationDelay: `${400 + idx * 120}ms`}}>{step.day}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
} 