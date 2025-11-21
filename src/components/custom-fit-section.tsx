"use client";

import { useState, useRef, useEffect } from "react";
import { Target, Search, Ruler, CheckCircle, ClipboardList, BarChart2, Scissors, Pen, Package, Truck } from "lucide-react";
import Image from "next/image";

const carBrands = [
  { name: "BMW", logo: "/images/products/bmw.png" },
  { name: "Mercedes", logo: "/images/products/mercedes.jpg" },
  { name: "Audi", logo: "/images/products/audi.jpg" },
  { name: "Porsche", logo: "/images/products/porsche.png" },
  { name: "Tesla", logo: "/images/products/tesla.avif" },
  { name: "Acura", logo: "/images/products/acura.avif" },
  { name: "Alfa Romeo", logo: "/images/products/alfa_romeo.jpg" },
  { name: "Aston Martin", logo: "/images/products/aston_martin.avif" },
  { name: "Bentley", logo: "/images/products/bentley.webp" },
  { name: "Bugatti", logo: "/images/products/bugatti.jpg" },
  { name: "Cadillac", logo: "/images/products/cadilac.jpeg" }
];

const timelineSteps = [
  { icon: ClipboardList, title: "Przyjęcie zamówienia", day: "Dzień 1" },
  { icon: BarChart2, title: "Weryfikacja modelu", day: "Dzień 2" },
  { icon: Scissors, title: "Cięcie dywaników", day: "Dzień 3" },
  { icon: Pen, title: "Szycie", day: "Dzień 6" },
  { icon: Package, title: "Formowanie 3D", day: "Dzień 9" },
  { icon: CheckCircle, title: "Kontrola jakości", day: "Dzień 12" },
  { icon: Truck, title: "Wysyłka", day: "Dzień 14" }
];

export default function CustomFitSection() {
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

    const section = document.getElementById('custom-fit-section');
    if (section) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="custom-fit-section" className="py-12 md:py-16 bg-neutral-950 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/mc.webp"
          alt="Tło"
          fill
          className="object-cover opacity-20"
          quality={90}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-neutral-950/80 to-neutral-950" />
      </div>

      {/* Animowane tło */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-neutral-950 to-red-800/5"></div>
      
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
            <Target className="w-10 h-10 text-white" />
          </div>
          <h2 className={`text-4xl md:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent leading-tight transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{transitionDelay: isVisible ? '400ms' : '0ms'}}>
            SZYTE NA MIARĘ DO TWOJEGO AUTA
          </h2>
          <p className={`text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{transitionDelay: isVisible ? '600ms' : '0ms'}}>
            Każdy dywanik jest precyzyjnie dopasowany do konkretnego modelu samochodu z dokładnością do milimetra. Nasz proces produkcyjny gwarantuje idealne pokrycie podłogi, perfekcyjne dopasowanie do kształtów i maksymalną ochronę. Obsługujemy ponad 50 marek samochodów, zapewniając rozwiązanie dopasowane do Twojego auta.
          </p>
        </div>

        {/* Timeline */}
        <div className="mb-16 md:mb-24 relative">
          {/* Vertical line for mobile - centered */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-white/10 md:hidden" />
          
          {/* Horizontal line for desktop */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 hidden md:block" />
          
          {/* Timeline Steps */}
          <div className="flex flex-col items-center md:flex-row md:justify-between gap-8 md:gap-4 relative">
            {timelineSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="group relative flex flex-col items-center gap-4 md:gap-0 w-full md:w-auto">
                  {/* Node */}
                  <div className="relative z-10 shrink-0">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-neutral-950 border-2 border-white/20 rounded-full flex items-center justify-center transition-all duration-500 group-hover:border-red-600 group-hover:shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                      <Icon className="w-5 h-5 md:w-7 md:h-7 text-gray-400 group-hover:text-red-500 transition-colors" />
                    </div>
                  </div>
                  
                  {/* Content - Mobile: centered below, Desktop: below */}
                  <div className="text-center md:absolute md:top-20 md:w-32">
                    <p className="text-white font-semibold text-base md:text-base mb-1 group-hover:text-red-500 transition-colors">
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-mono">
                      {step.day}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Marquee Section */}
        <div className="space-y-6 md:space-y-8">
          <p className="text-center text-gray-500 text-xs md:text-sm uppercase tracking-widest px-4">
            Obsługujemy ponad 50 marek samochodów
          </p>
          
          <div className="relative flex overflow-hidden group -mx-4 md:mx-0">
            <div className="flex animate-marquee whitespace-nowrap hover:pause">
              {[...carBrands, ...carBrands].map((brand, idx) => (
                <div key={`${brand.name}-${idx}`} className="mx-4 md:mx-8 flex items-center justify-center w-24 h-16 md:w-32 md:h-20 opacity-50 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 cursor-pointer">
                  <div className="relative w-full h-full rounded-lg overflow-hidden">
                     <Image 
                       src={brand.logo} 
                       alt={brand.name}
                       fill
                       className="object-contain rounded-lg"
                     />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex absolute top-0 animate-marquee2 whitespace-nowrap hover:pause">
               {[...carBrands, ...carBrands].map((brand, idx) => (
                <div key={`${brand.name}-duplicate-${idx}`} className="mx-4 md:mx-8 flex items-center justify-center w-24 h-16 md:w-32 md:h-20 opacity-50 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 cursor-pointer">
                  <div className="relative w-full h-full rounded-lg overflow-hidden">
                     <Image 
                       src={brand.logo} 
                       alt={brand.name}
                       fill
                       className="object-contain rounded-lg"
                     />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
