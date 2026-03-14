"use client";

import { useState, useEffect } from "react";
import { CheckCircle, ArrowRight } from "lucide-react";
import Image from "next/image";

const processSteps = [
  { id: 1, title: "Przyjęcie zamówienia", day: "Dzień 1" },
  { id: 2, title: "Weryfikacja modelu", day: "Dzień 2" },
  { id: 3, title: "Cięcie dywaników", day: "Dzień 3" },
  { id: 4, title: "Szycie", day: "Dzień 6" },
  { id: 5, title: "Formowanie 3D", day: "Dzień 9" },
  { id: 6, title: "Kontrola jakości", day: "Dzień 12" },
  { id: 7, title: "Wysyłka", day: "Dzień 14" }
];

export default function CustomFitSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);

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
    <section id="custom-fit-section" className="py-20 md:py-24 bg-neutral-950 relative overflow-hidden">
      {/* Gradient line top */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent z-10" aria-hidden="true" />

      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-bl from-red-900/5 via-neutral-950 to-neutral-950 pointer-events-none"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className={`text-center mb-16 md:mb-24 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight break-words px-2 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{transitionDelay: isVisible ? '200ms' : '0ms'}}>
            Szyte na miarę do <span className="text-red-500">Twojego auta</span>
          </h2>
          <p className={`text-sm sm:text-base md:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed px-2 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{transitionDelay: isVisible ? '400ms' : '0ms'}}>
            Każdy dywanik jest precyzyjnie dopasowany do konkretnego modelu samochodu z dokładnością do milimetra. Nasz proces produkcyjny gwarantuje idealne pokrycie podłogi i perfekcyjne dopasowanie.
          </p>
        </div>

        {/* Split Layout: Text Left, Image Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
          
          {/* Left Column: Process List */}
          <div className={`order-2 lg:order-1 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div className="space-y-8">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Proces realizacji
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Od momentu zamówienia do wysyłki, Twój zestaw przechodzi przez 7-etapowy proces produkcji, zapewniający najwyższą jakość wykonania.
                </p>
              </div>

              {/* Clean Numbered List */}
              <div className="space-y-3">
                {processSteps.map((step, index) => (
                  <div 
                    key={step.id}
                    className={`
                      group flex items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 
                      transition-all duration-500 cursor-default
                      ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                    `}
                    style={{ transitionDelay: `${600 + (index * 150)}ms` }}
                    onMouseEnter={() => setActiveStep(step.id)}
                    onMouseLeave={() => setActiveStep(null)}
                  >
                    <div className={`
                      text-lg font-bold mr-6 w-8 text-right transition-colors duration-300 font-mono
                      ${activeStep === step.id ? 'text-red-500' : 'text-gray-600'}
                    `}>
                      0{step.id}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold transition-colors duration-300 ${activeStep === step.id ? 'text-white' : 'text-gray-300'}`}>
                        {step.title}
                      </h4>
                    </div>
                    <div className={`
                      text-xs uppercase tracking-wider font-medium transition-colors duration-300
                      ${activeStep === step.id ? 'text-red-400' : 'text-gray-500'}
                    `}>
                      {step.day}
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="pt-6">
                <button 
                  onClick={() => {
                    const element = document.getElementById('products');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className="
                    bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 
                    text-white font-bold uppercase tracking-wide py-4 px-8 rounded-full 
                    shadow-xl shadow-red-900/30 hover:shadow-2xl hover:shadow-red-600/20 
                    transition-all duration-300 transform hover:scale-105 active:scale-95
                    flex items-center gap-2 min-h-[44px]
                  "
                >
                  Zamów do swojego auta
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Image */}
          <div className={`order-1 lg:order-2 transition-all duration-1000 ease-out delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="relative group">
              {/* Glass Container */}
              <div className="relative bg-white/5 backdrop-blur-md rounded-3xl p-2 border border-white/10 shadow-2xl shadow-black/50 overflow-hidden group-hover:border-red-500/20 transition-all duration-500">
                <div className="relative rounded-2xl overflow-hidden aspect-[4/5] lg:aspect-[3/4] bg-neutral-900">
                  <Image
                    src="/images/zalety/szycie.png"
                    alt="Proces szycia dywaników na miarę"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  
                  {/* Text Overlay */}
                  <div className="absolute bottom-0 left-0 p-8">
                    <div className="flex items-center gap-2 text-red-500 font-bold uppercase tracking-wider text-sm mb-2">
                      <CheckCircle className="w-4 h-4" />
                      Precyzja wykonania
                    </div>
                    <p className="text-white text-lg font-medium leading-relaxed">
                      Każdy szew jest kontrolowany, aby zapewnić maksymalną trwałość i estetykę.
                    </p>
                  </div>
                </div>
                
                {/* Shine Effect */}
                <div className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                  <div className="absolute inset-0 transform -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
