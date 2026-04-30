"use client";

import { useState, useEffect } from "react";
import { Target, Sparkles, Zap, Star, ArrowRight, Package } from "lucide-react";
import Image from "next/image";

const advantagesItems = [
  {
    id: 1,
    src: "/images/zalety/dywanik_z_rantami.png",
    title: "Dywaniki 3D z rantami",
    description: "Zaawansowana technologia 3D zapewnia doskonałe dopasowanie i trwałość. Wysokie ranty skutecznie chronią oryginalną tapicerkę przed zabrudzeniami i wilgocią.",
    icon: Sparkles,
    targetSection: "3d-mats-section",
    className: "md:col-span-2 md:row-span-2"
  },
  {
    id: 2,
    src: "/images/zalety/szycie.png",
    title: "Szyte na miarę",
    description: "Każdy dywanik jest precyzyjnie dopasowany do konkretnego modelu samochodu.",
    icon: Target,
    targetSection: "custom-fit-section",
    className: "md:col-span-1 md:row-span-1"
  },
  {
    id: 3,
    src: "/images/zalety/roznorodna-kolorystyka-v2.png",
    title: "Różnorodna kolorystyka",
    description: "Szeroka paleta kolorów dopasowana do wnętrza Twojego auta.",
    icon: Star,
    targetSection: "roznorodna-kolorystyka-section",
    className: "md:col-span-1 md:row-span-1"
  },
  {
    id: 4,
    src: "/images/zalety/pianka.webp",
    title: "Nowoczesny Materiał EVA",
    description: "Specjalna struktura materiału EVA skutecznie zatrzymuje brud i wilgoć. Innowacyjne komórki blokują rozprzestrzenianie się płynów.",
    icon: Zap,
    targetSection: "gleboka-struktura-komorek-section",
    className: "md:col-span-3 md:row-span-1"
  }
];

export default function AdvantagesSection() {
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
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

    const section = document.getElementById('advantages-section');
    if (section) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, []);

  const handleItemClick = (targetId: string) => {
    const section = document.getElementById(targetId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="advantages-section" className="py-20 md:py-32 bg-black relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-900/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Animowane tło */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-black to-red-800/5"></div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-7xl">
        {/* Header */}
        <div className={`flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-24 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
              <Package className="w-4 h-4 text-red-500" />
              <span className="text-sm font-bold text-gray-200 uppercase tracking-wider">Poznaj nasz produkt</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
              Zaprojektowane dla <br/>
              <span className="bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent">
                maksymalnej ochrony
              </span>
            </h2>
          </div>
          <div className="max-w-lg pb-2">
            <p className="text-lg md:text-xl text-gray-400 leading-relaxed font-light">
              Tworzymy dywaniki samochodowe, które łączą w sobie bezkompromisową jakość, nowoczesny design i maksymalną funkcjonalność.
            </p>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 auto-rows-[280px] md:auto-rows-[320px]">
          {advantagesItems.map((item, index) => {
            const Icon = item.icon;
            const isHoveredState = hoveredItem === item.id;
            const isLarge = item.className.includes('col-span-2') || item.className.includes('col-span-3');
            
            return (
              <div
                key={item.id}
                className={`
                  group relative cursor-pointer rounded-3xl overflow-hidden transition-all duration-700 ease-out
                  bg-[#111]/40 backdrop-blur-xl border border-white/5 hover:border-white/20
                  ${item.className}
                  ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}
                `}
                style={{ transitionDelay: `${index * 150}ms` }}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={() => handleItemClick(item.targetSection)}
              >
                {/* Image Background */}
                <div className="absolute inset-0 w-full h-full bg-black">
                  <Image
                    src={item.src}
                    alt={item.title}
                    fill
                    className={`object-cover transition-transform duration-1000 ease-out ${isHoveredState ? 'scale-105' : 'scale-100'}`}
                  />
                  {/* Gradients for text readability */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent transition-opacity duration-500 ${isHoveredState ? 'opacity-90' : 'opacity-80'}`}></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent"></div>
                </div>

                {/* Content */}
                <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-between z-10">
                  {/* Top: Icon */}
                  <div className="flex justify-between items-start">
                    <div className={`
                      w-12 h-12 rounded-2xl flex items-center justify-center
                      bg-white/10 backdrop-blur-md border border-white/10 text-white
                      transition-all duration-500 shadow-xl
                      ${isHoveredState ? 'bg-red-600 border-red-500 scale-110 shadow-red-900/50' : ''}
                    `}>
                      <Icon className="w-6 h-6" />
                    </div>
                    
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10
                      transition-all duration-500
                      ${isHoveredState ? 'bg-white text-black rotate-45' : 'text-white/50'}
                    `}>
                      <ArrowRight className="w-5 h-5 -rotate-45" />
                    </div>
                  </div>

                  {/* Bottom: Text */}
                  <div className="max-w-xl">
                    <h3 className={`
                      font-bold mb-3 transition-colors duration-300 tracking-tight
                      ${isLarge ? 'text-3xl md:text-4xl' : 'text-2xl md:text-3xl'}
                      ${isHoveredState ? 'text-white' : 'text-gray-100'}
                    `}>
                      {item.title}
                    </h3>
                    <p className={`
                      text-gray-400 leading-relaxed transition-all duration-500
                      ${isLarge ? 'text-base md:text-lg' : 'text-sm md:text-base line-clamp-2'}
                      ${isHoveredState ? 'text-gray-300 translate-y-0 opacity-100' : 'translate-y-2 opacity-80'}
                    `}>
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
