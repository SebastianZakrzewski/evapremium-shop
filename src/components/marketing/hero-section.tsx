"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Phone, ChevronRight, ShieldCheck, Droplets, Truck } from "lucide-react";
import Image from "next/image";

type HeroSlide = {
  id: number;
  title: string;
  subtitle: string;
  cta: string;
  price: string;
  benefits: string[];
  video?: string;
  image?: string;
  isImageSlide?: boolean;
};

const heroSlides: HeroSlide[] = [
  {
    id: 1,
    title: "Dywaniki Samochodowe EVA Premium",
    subtitle: "Wodoodporne, łatwe w czyszczeniu, precyzyjnie dopasowane do Twojego auta",
    video: "/images/hero/video.mp4",
    cta: "Skonfiguruj swój zestaw",
    price: "Od 199 zł",
    benefits: ["Wodoodporne", "Łatwe w czyszczeniu", "Gwarancja 2 lata"]
  },
  {
    id: 2,
    title: "",
    subtitle: "",
    image: "/hero2.png",
    cta: "",
    price: "",
    benefits: [],
    isImageSlide: true
  },
  {
    id: 3,
    title: "",
    subtitle: "",
    image: "/blackfriday.png",
    cta: "Sprawdź promocję",
    price: "",
    benefits: [],
    isImageSlide: true
  },
  {
    id: 4,
    title: "Najwyższa Jakość Materiałów EVA",
    subtitle: "Profesjonalne dywaniki samochodowe najwyższej jakości",
    video: "/images/hero/video.mp4",
    cta: "Poznaj Materiały",
    price: "Gwarancja 2 lata",
    benefits: ["Materiał EVA", "Odporność na wilgoć", "Trwałość"]
  },
  {
    id: 5,
    title: "Spersonalizowane Dywaniki Samochodowe",
    subtitle: "Dokładnie dopasowane do modelu Twojego auta",
    video: "/images/hero/video.mp4",
    cta: "Wybierz Model",
    price: "Dostawa 24h",
    benefits: ["Precyzyjne dopasowanie", "Szybka dostawa", "5000+ zadowolonych klientów"]
  }
];

// Funkcja do wykrywania odpowiedniego formatu video
const getVideoSource = (baseVideo: string, isMobile: boolean, isHighDpi: boolean) => {
  if (isMobile) {
    return baseVideo; // Mobile - użyj standardowego mp4
  }
  if (isHighDpi && typeof window !== 'undefined' && window.innerWidth >= 1920) {
    return baseVideo.replace('.mp4', '-4k.mp4'); // 4K dla dużych ekranów
  }
  return baseVideo; // Standardowy format
};

export default function HeroSection() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isHighDpi, setIsHighDpi] = useState(false);

  // Wykrywanie typu urządzenia
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkDevice = () => {
        setIsMobile(window.innerWidth < 768);
        setIsHighDpi(window.devicePixelRatio > 1.5);
      };
      checkDevice();
      window.addEventListener('resize', checkDevice);
      return () => window.removeEventListener('resize', checkDevice);
    }
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev]);

  // Określ które slajdy renderować (tylko aktywny + następny dla lazy loading)
  const visibleSlides = useMemo(() => {
    const slides: number[] = [currentSlide];
    const nextSlide = (currentSlide + 1) % heroSlides.length;
    if (nextSlide !== currentSlide) {
      slides.push(nextSlide);
    }
    return slides;
  }, [currentSlide]);

  return (
    <section className="relative h-[100svh] min-h-[700px] w-full bg-black overflow-hidden">
      {/* Phone number - Mobile only */}
      <div className="md:hidden absolute top-24 left-0 right-0 z-30 px-6">
        <a 
          href="tel:+48793993430"
          className="flex items-center justify-center gap-3 bg-black/70 backdrop-blur-xl border border-white/10 text-white px-5 py-3.5 rounded-full shadow-2xl transition-all duration-300 active:scale-95"
        >
          <div className="bg-gradient-to-r from-red-600 to-red-700 p-2 rounded-full">
            <Phone className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-medium text-sm tracking-wide">+48 793 993 430</span>
        </a>
      </div>

      {/* Carousel */}
      <div className="absolute inset-0 w-full h-full">
        {heroSlides.map((slide, index) => {
          const isVisible = visibleSlides.includes(index);
          const isActive = index === currentSlide;
          const isImageSlide = slide.isImageSlide ?? false;
          const videoSource = slide.video ? getVideoSource(slide.video, isMobile, isHighDpi) : null;
          
          // Renderuj tylko widoczne slajdy (lazy loading)
          if (!isVisible) {
            return null;
          }

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              {/* Background Media */}
              <div className="absolute inset-0 w-full h-full overflow-hidden">
                {isImageSlide && slide.image ? (
                  <>
                    <Image
                      src={slide.image}
                      alt={slide.title || "Promocja"}
                      fill
                      className={`object-cover md:object-[scale-down] object-center transition-transform duration-[10s] ease-out ${
                        isActive ? "scale-105" : "scale-100"
                      }`}
                      priority={index === 1}
                      sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                  </>
                ) : (
                  <>
                    <video
                      autoPlay={isActive}
                      loop
                      muted
                      playsInline
                      preload={index === 0 ? "auto" : "metadata"}
                      poster="/images/hero/video-poster.jpg"
                      className={`w-full h-full object-cover object-center transition-transform duration-[10s] ease-out ${
                        isActive ? "scale-105" : "scale-100"
                      }`}
                      style={{
                        filter: 'brightness(0.85) contrast(1.1) saturate(1.1)'
                      }}
                      onLoadedData={(e) => {
                        const video = e.target as HTMLVideoElement;
                        video.playbackRate = 0.8;
                      }}
                    >
                      {videoSource && <source src={videoSource} type="video/mp4" />}
                      {!isMobile && slide.video && <source src="/images/hero/video.webm" type="video/webm" />}
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent md:w-3/4"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-black/40"></div>
                  </>
                )}
              </div>

              {/* Content */}
              {!isImageSlide && (
                <div className="absolute inset-0 z-20 flex flex-col justify-end md:justify-center max-w-[1400px] mx-auto px-6 md:px-16 pb-32 md:pb-0 pt-32">
                  <div className={`max-w-3xl space-y-6 md:space-y-8 transition-all duration-1000 delay-300 ${
                    isActive ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
                  }`}>
                    {/* Benefits */}
                    {slide.benefits && slide.benefits.length > 0 && (
                      <div className="flex flex-wrap gap-2 md:gap-3">
                        {slide.benefits.map((benefit, idx) => (
                          <div 
                            key={idx}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-gray-200 text-xs md:text-sm font-medium"
                          >
                            {idx === 0 && <ShieldCheck className="w-4 h-4 text-red-500" />}
                            {idx === 1 && <Droplets className="w-4 h-4 text-blue-400" />}
                            {idx === 2 && <Truck className="w-4 h-4 text-green-400" />}
                            {benefit}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Title */}
                    {slide.title && (
                      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
                        {slide.title}
                      </h1>
                    )}

                    {/* Subtitle */}
                    {slide.subtitle && (
                      <p className="text-lg md:text-xl lg:text-2xl font-normal text-gray-300 max-w-2xl leading-relaxed">
                        {slide.subtitle}
                      </p>
                    )}

                    {/* CTAs */}
                    {slide.cta && (
                      <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button 
                          onClick={() => {
                            if (slide.cta === "Skonfiguruj swój zestaw") {
                              router.push('/dywaniki');
                            } else {
                              const element = document.getElementById('products');
                              if (element) {
                                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }
                            }
                          }}
                          className="group flex items-center justify-center gap-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-8 py-4 rounded-full text-base font-bold transition-all duration-300 active:scale-95 shadow-xl shadow-red-900/30"
                        >
                          {slide.cta}
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                        
                        <button 
                          onClick={() => {
                            const element = document.getElementById('3d-mats-section');
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                          }}
                          className="flex items-center justify-center px-8 py-4 rounded-full text-base font-semibold text-white bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 transition-all duration-300 active:scale-95"
                        >
                          Dowiedz się więcej
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation Controls */}
      <div className="hidden md:flex absolute right-12 top-1/2 -translate-y-1/2 flex-col gap-3 z-30">
        <button
          onClick={goToPrev}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 text-white transition-all active:scale-95 group"
          aria-label="Poprzedni slajd"
        >
          <ChevronRight className="w-5 h-5 rotate-180 group-hover:-translate-x-0.5 transition-transform" />
        </button>
        <button
          onClick={goToNext}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 text-white transition-all active:scale-95 group"
          aria-label="Następny slajd"
        >
          <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-12 md:bottom-12 left-6 md:left-16 flex gap-2 z-30">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              index === currentSlide ? "w-12 bg-white" : "w-4 bg-white/30 hover:bg-white/50"
            }`}
            aria-label={`Przejdź do slajdu ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
