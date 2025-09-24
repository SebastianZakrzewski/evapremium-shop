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
  },
  { 
    name: "Acura", 
    logo: "/images/products/acura.avif",
    models: ["TLX", "RDX", "MDX", "ILX"],
    description: "Japońska precyzja i luksus"
  },
  { 
    name: "Alfa Romeo", 
    logo: "/images/products/alfa_romeo.jpg",
    models: ["Giulia", "Stelvio", "Tonale", "4C"],
    description: "Włoska pasja i elegancja"
  },
  { 
    name: "Aston Martin", 
    logo: "/images/products/aston_martin.avif",
    models: ["DB11", "Vantage", "DBX", "DBS"],
    description: "Brytyjski luksus i elegancja"
  },
  { 
    name: "BAIC", 
    logo: "/images/products/baic2.webp",
    models: ["EU5", "EX5", "EU7", "EC5"],
    description: "Chińska innowacja elektryczna"
  },
  { 
    name: "Bentley", 
    logo: "/images/products/bentley.webp",
    models: ["Continental GT", "Bentayga", "Flying Spur", "Mulsanne"],
    description: "Brytyjski luksus i elegancja"
  },
  { 
    name: "Bugatti", 
    logo: "/images/products/bugatti.jpg",
    models: ["Chiron", "Veyron", "Divo", "Centodieci"],
    description: "Francuska supremacja sportowa"
  },
  { 
    name: "Buick", 
    logo: "/images/products/buick.avif",
    models: ["Enclave", "Encore", "LaCrosse", "Regal"],
    description: "Amerykański komfort i styl"
  },
  { 
    name: "Cadillac", 
    logo: "/images/products/cadilac.jpeg",
    models: ["Escalade", "CT5", "XT6", "CT4"],
    description: "Amerykański luksus i prestiż"
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
    <section id="custom-fit-section" className="pt-0 md:pt-0 pb-64 md:pb-[400px] bg-black relative overflow-visible">
      {/* Tło auta */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Image
          src="/mc.webp"
          alt="Auto w tle"
          fill
          className="object-cover object-center opacity-30"
          priority={true}
          quality={90}
          style={{ objectPosition: 'center' }}
        />
        {/* Overlay dla lepszej czytelności */}
        <div className="absolute inset-0 bg-black/60" />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-4 transition-all duration-1000 ease-out">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-full mb-8 animate-pulse-glow shadow-lg shadow-red-500/30">
            <Target className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-2 bg-gradient-to-r from-white via-red-100 to-white bg-clip-text text-transparent leading-tight">
            SZYTE NA MIARĘ DO TWOJEGO AUTA
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Każdy dywanik jest precyzyjnie dopasowany do konkretnego modelu samochodu z dokładnością do milimetra.
          </p>
        </div>
        {/* Nagłówek procesu timeline */}
        <div className="text-center mb-0">
          <h3 className="text-2xl md:text-3xl font-semibold text-white mb-2">Jak wygląda proces realizacji zamówienia?</h3>
          <p className="text-gray-400 max-w-2xl mx-auto">Poznaj wszystkie etapy produkcji i wysyłki Twoich dywaników szytych na miarę.</p>
        </div>
        {/* Timeline stylizowany jak na przesłanym obrazku */}
        <div className="relative w-full flex flex-col items-center mt-48">
          {/* Jedna linia pod wszystkimi węzłami */}
          <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 z-0 h-2">
            <div className="w-full h-full bg-gradient-to-r from-red-700 via-red-500 to-red-400 opacity-80 rounded-full border-2 border-red-500" />
          </div>
          <div className="w-full flex flex-col md:flex-row items-center justify-between relative z-10">
            {timelineSteps.map((step, idx) => {
              const Icon = step.icon;
              const isEven = idx % 2 === 0;
              return (
                <div
                  key={idx}
                  className={`relative flex flex-col items-center flex-1 min-w-[120px] max-w-[160px] mx-auto md:mx-0 group gap-6 md:gap-12`}
                  tabIndex={0}
                >
                  {/* Węzeł (ikona) na linii – premium: czerwona obwódka, czarne tło, biała ikona, cień */}
                  <div
                    className={`relative z-10 w-16 h-16 flex items-center justify-center rounded-full border-4 border-red-500 bg-black shadow-lg transition-transform duration-300 animate-fade-in
                      group-hover:scale-110 group-focus:scale-110 group-hover:border-white group-focus:border-white group-hover:bg-red-700 group-focus:bg-red-700'}`}
                    style={{animationDelay: `${idx * 120}ms`}}
                  >
                    <Icon className="w-8 h-8 text-white" />
                    {/* Tooltip */}
                    <span className="absolute left-1/2 -translate-x-1/2 -bottom-10 px-3 py-1 rounded bg-black text-white text-xs opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-lg border border-red-500">
                      {step.title}
                    </span>
                  </div>
                  {/* Zygzakowaty opis */}
                  <div className={`absolute w-max max-w-[110px] ${isEven ? 'top-24 md:top-20' : 'bottom-24 md:bottom-20'} left-1/2 -translate-x-1/2 text-center md:${isEven ? '' : 'top-auto bottom-20'} ${isEven ? '' : 'md:top-auto md:bottom-20'} ${isEven ? 'sm:top-24' : 'sm:bottom-24'} ${isEven ? 'top-auto' : 'top-auto'} sm:top-auto` + (typeof window !== 'undefined' && window.innerWidth < 768 ? ' top-auto bottom-20' : '')}>
                    <div className="text-white font-semibold text-base md:text-lg mb-1 animate-fade-in drop-shadow-lg" style={{animationDelay: `${200 + idx * 120}ms`}}>{step.title}</div>
                    <div className="text-gray-300 text-xs md:text-sm animate-fade-in drop-shadow-lg" style={{animationDelay: `${400 + idx * 120}ms`}}>{step.day}</div>
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