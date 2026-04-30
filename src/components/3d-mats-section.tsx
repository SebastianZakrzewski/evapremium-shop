"use client";

import { useState, useEffect, useRef } from "react";
import { Shield, Zap, Target, Star, CheckCircle, ArrowRight, Layers, ChevronRight } from "lucide-react";
import Image from "next/image";

const benefits3D = [
  {
    id: 1,
    icon: Shield,
    title: "Doskonała ochrona",
    description: "Ranty 3D chronią przed wnikaniem brudu i wilgoci pod dywanik",
    fullDescription: "Ranty 3D o wysokości do 8 cm skutecznie chronią przed wnikaniem brudu, wilgoci i zanieczyszczeń pod dywanik, zapewniając długotrwałą ochronę podłogi Twojego samochodu."
  },
  {
    id: 2,
    icon: Zap,
    title: "3D Jęzor",
    description: "Zintegrowany jęzor 3D pod pedałami gazu chroni wykładzinę",
    fullDescription: "Jęzor 3D pod pedałami gazu jest zintegrowany z dywanikiem, nie przesuwa się i skutecznie chroni wykładzinę w miejscu najbardziej narażonym na zużycie. To praktyczne rozwiązanie dla osób, które cenią trwałość i wygodę użytkowania."
  },
  {
    id: 3,
    icon: Shield,
    title: "Bezpieczeństwo",
    description: "Antypoślizgowe właściwości zapewniają bezpieczeństwo podczas jazdy",
    fullDescription: "Specjalne antypoślizgowe właściwości dywaników 3D zapewniają maksymalne bezpieczeństwo podczas jazdy. Materiał EVA o wysokiej gęstości zapobiega przesuwaniu się dywaników, co eliminuje ryzyko zaklinowania pedałów."
  },
  {
    id: 4,
    icon: Star,
    title: "Łatwość czyszczenia",
    description: "Specjalna struktura 3D ułatwia szybkie i skuteczne czyszczenie",
    fullDescription: "Głęboka struktura komórek 3D ułatwia szybkie i skuteczne czyszczenie dywaników. Brud i zanieczyszczenia nie wnikają głęboko w materiał, co pozwala na łatwe usunięcie ich za pomocą wody."
  },
  {
    id: 5,
    icon: Target,
    title: "Rzep na każdym rogu",
    description: "Innowacyjne rzepy na rogach zapewniają idealne dopasowanie",
    fullDescription: "Specjalne rzepy umieszczone na każdym rogu dywanika zapewniają idealne dopasowanie do podłogi samochodu. Dzięki temu dywaniki pozostają na swoim miejscu nawet podczas dynamicznej jazdy."
  },
  {
    id: 6,
    icon: Layers,
    title: "Grubość 10mm",
    description: "Optymalna grubość zapewnia doskonałą amortyzację i komfort",
    fullDescription: "Grubość dywanika wynosząca 10mm została starannie dobrana, aby zapewnić doskonałą amortyzację, komfort jazdy oraz skuteczną ochronę wykładziny samochodowej."
  }
];

const features3D = [
  "Ranty o wysokości do 8 cm",
  "Głęboka struktura komórek",
  "Materiał EVA o gęstości 0.6g/cm³",
  "Odporność na temperaturę -40°C do +80°C",
  "Antypoślizgowe spody",
  "Łatwe w montażu i demontażu"
];

const defaultMainImage = "/images/zalety/dywanik_z_rantami.png";
const ochronaImage = "/7.webp";

const defaultTitle = "Dlaczego dywaniki 3D z rantami?";
const defaultDescription = "Nasze dywaniki 3D z rantami to najnowocześniejsze rozwiązanie w ochronie podłogi samochodu. Specjalna technologia 3D zapewnia doskonałe dopasowanie i maksymalną skuteczność w zatrzymywaniu brudu, wilgoci i innych zanieczyszczeń.";

export default function ThreeDMatsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredBenefit, setHoveredBenefit] = useState<number | null>(null);
  const [mainImage, setMainImage] = useState<string>(ochronaImage);
  const [activeBenefit, setActiveBenefit] = useState<number | null>(1);
  const [mainTitle, setMainTitle] = useState<string>("DOSKONAŁA OCHRONA");
  const [mainDescription, setMainDescription] = useState<string>("Ranty 3D o wysokości do 8 cm skutecznie chronią przed wnikaniem brudu, wilgoci i zanieczyszczeń pod dywanik, zapewniając długotrwałą ochronę podłogi Twojego samochodu.");
  const imageRef = useRef<HTMLImageElement>(null);

  // Fade animacja przy zmianie obrazka
  useEffect(() => {
    if (imageRef.current) {
      imageRef.current.classList.remove("opacity-0");
      void imageRef.current.offsetWidth;
      imageRef.current.classList.add("opacity-0");
      setTimeout(() => {
        if (imageRef.current) imageRef.current.classList.remove("opacity-0");
      }, 200);
    }
  }, [mainImage]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById('3d-mats-section');
    if (section) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, []);

  const handleBenefitClick = (benefit: typeof benefits3D[0]) => {
    let image = defaultMainImage;
    let title = defaultTitle;
    let description = defaultDescription;
    
    if (benefit.id === 1) {
      image = ochronaImage;
      title = "DOSKONAŁA OCHRONA";
      description = benefit.fullDescription;
    } else if (benefit.id === 2) {
      image = '/images/zalety/3d-jezor-detail.png';
      title = "3D JĘZOR";
      description = benefit.fullDescription;
    } else if (benefit.id === 3) {
      image = '/1.webp';
      title = "BEZPIECZEŃSTWO UŻYTKOWANIA";
      description = benefit.fullDescription;
    } else if (benefit.id === 4) {
      image = '/komorki.png';
      title = "ŁATWOŚĆ CZYSZCZENIA";
      description = benefit.fullDescription;
    } else if (benefit.id === 5) {
      image = '/images/zalety/rzepy.png';
      title = "RZEP NA KAŻDYM ROGU";
      description = benefit.fullDescription;
    } else if (benefit.id === 6) {
      image = '/images/zalety/10mm.png';
      title = "GRUBOŚĆ DYWANIKA";
      description = benefit.fullDescription;
    }
    
    setMainImage(image);
    setMainTitle(title);
    setMainDescription(description);
    setActiveBenefit(benefit.id);
  };

  return (
    <section 
      id="3d-mats-section" 
      className="w-full bg-black py-20 md:py-24 relative overflow-hidden"
      role="region"
      aria-label="Dywaniki 3D z rantami - szczegóły produktu"
    >
      {/* Gradient line top - spójność z sekcjami powyżej */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent z-10" aria-hidden="true" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header - spójny z AdvantagesSection */}
        <div className={`text-center mb-12 md:mb-16 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 md:mb-6 leading-tight break-words px-2 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{transitionDelay: isVisible ? '200ms' : '0ms'}}>
            Dywaniki 3D z <span className="text-red-500">rantami</span>
          </h2>
          <p className={`text-sm sm:text-base md:text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed px-2 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{transitionDelay: isVisible ? '400ms' : '0ms'}}>
            Odkryj nowy wymiar komfortu i ochrony swojego auta! Nasze dywaniki 3D to połączenie nowoczesnej technologii, prestiżowego wyglądu i maksymalnej funkcjonalności.
          </p>
        </div>

        {/* Główna zawartość */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-start">
          {/* Lewa strona - Obraz */}
          <div className={`transition-all duration-1000 ease-out sticky top-24 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div className="relative group">
              {/* Kontener z obrazem - spójny z BrandCard/Gallery */}
              <div className="relative bg-white/5 backdrop-blur-md rounded-3xl p-2 border border-white/10 shadow-2xl shadow-black/50 overflow-hidden group-hover:border-red-500/20 transition-all duration-500">
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-[#111]">
                  <Image
                    ref={imageRef}
                    src={mainImage}
                    alt="Dywaniki 3D z rantami"
                    fill
                    className="object-contain transition-all duration-500 opacity-100"
                    style={{ transition: 'opacity 0.4s' }}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  
                  {/* Overlay gradient - spójny z resztą */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                </div>
                
                {/* Shine Effect */}
                <div className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                  <div className="absolute inset-0 transform -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>
              </div>
              
              {/* Opis pod zdjęciem (tylko desktop) */}
              <div className="mt-8 hidden lg:block p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10">
                <h3 className="text-2xl font-bold text-white mb-4 transition-all duration-500">
                  {mainTitle}
                </h3>
                <p className="text-gray-400 leading-relaxed transition-all duration-500">
                  {mainDescription}
                </p>
                
                {/* Cechy techniczne */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center">
                    <CheckCircle className="w-4 h-4 text-red-500 mr-2" />
                    Specyfikacja techniczna
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {features3D.slice(0, 4).map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-gray-400">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Prawa strona - Lista korzyści */}
          <div className={`transition-all duration-1000 ease-out delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            {/* Opis mobilny (nad listą) */}
            <div className="lg:hidden mb-8 p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10">
              <h3 className="text-xl font-bold text-white mb-3">
                {mainTitle}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {mainDescription}
              </p>
            </div>

            <div className="space-y-4">
              {benefits3D.map((benefit, index) => {
                const IconComponent = benefit.icon;
                const isActive = activeBenefit === benefit.id;
                const isHovered = hoveredBenefit === benefit.id;
                
                return (
                  <div
                    key={benefit.id}
                    className={`
                      group cursor-pointer relative rounded-2xl transition-all duration-300 ease-out
                      ${isActive 
                        ? 'bg-white/10 border-red-500/50 shadow-lg shadow-red-900/20 translate-x-2' 
                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'}
                      border
                    `}
                    tabIndex={0}
                    aria-pressed={isActive}
                    onMouseEnter={() => setHoveredBenefit(benefit.id)}
                    onMouseLeave={() => setHoveredBenefit(null)}
                    onClick={() => handleBenefitClick(benefit)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleBenefitClick(benefit);
                      }
                    }}
                  >
                    <div className="p-4 sm:p-5 flex items-start gap-4">
                      {/* Tekst */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`font-bold text-base sm:text-lg transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-200 group-hover:text-white'}`}>
                            {benefit.title}
                          </h4>
                          {isActive && (
                            <ChevronRight className="w-5 h-5 text-red-500 animate-pulse" />
                          )}
                        </div>
                        <p className={`text-sm leading-relaxed transition-colors duration-300 ${isActive ? 'text-gray-400' : 'text-gray-400 group-hover:text-gray-400'}`}>
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA Buttons - spójne z Hero */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/10">
              <button 
                onClick={() => {
                  const element = document.getElementById('products');
                  if (element) {
                    element.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }
                }}
                className="
                  flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 
                  text-white font-bold uppercase tracking-wide py-4 px-6 rounded-full 
                  shadow-xl shadow-red-900/30 hover:shadow-2xl hover:shadow-red-600/20 
                  transition-all duration-300 transform hover:scale-105 active:scale-95
                  flex items-center justify-center gap-2 min-h-[44px]
                "
              >
                Sprawdź modele
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button className="
                flex-1 glass-button font-bold uppercase tracking-wide py-4 px-6 rounded-full 
                hover:bg-white/10 border border-white/20 hover:border-white/40
                transition-all duration-300 flex items-center justify-center gap-2 min-h-[44px]
              ">
                Więcej informacji
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
