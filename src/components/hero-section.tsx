"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Phone } from "lucide-react";
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
    image: "/blackfriday.png",
    cta: "Sprawdź promocję",
    price: "",
    benefits: [],
    isImageSlide: true
  },
  {
    id: 3,
    title: "Najwyższa Jakość Materiałów EVA",
    subtitle: "Profesjonalne dywaniki samochodowe najwyższej jakości",
    video: "/images/hero/video.mp4",
    cta: "Poznaj Materiały",
    price: "Gwarancja 2 lata",
    benefits: ["Materiał EVA", "Odporność na wilgoć", "Trwałość"]
  },
  {
    id: 4,
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
    <section className="relative min-h-[500px] h-[60vh] md:h-[60vh] overflow-hidden pt-4 md:pt-0">
      {/* Carousel */}
      <div className="container mx-auto px-4 relative h-full py-4 md:py-0">
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
              className={`absolute inset-0 transition-opacity duration-1000 ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              {/* Background - Video or Image */}
              <div className="absolute inset-0 w-full h-full flex justify-center">
                <div className="w-full h-full">
                  {isImageSlide && slide.image ? (
                    <>
                      <Image
                        src={slide.image}
                        alt="Black Friday"
                        fill
                        className="object-cover object-center rounded-lg"
                        priority={index === 1}
                        sizes="100vw"
                      />
                      {/* Overlay dla lepszej widoczności tekstu */}
                      <div className="absolute inset-0 bg-black/30 rounded-lg"></div>
                    </>
                  ) : (
                    <video
                      autoPlay={isActive}
                      loop
                      muted
                      playsInline
                      preload={index === 0 ? "auto" : "metadata"}
                      poster="/images/hero/video-poster.jpg"
                      className="w-full h-full object-cover object-center rounded-lg"
                      style={{
                        objectPosition: 'center center',
                        transform: 'scale(1.0)',
                        filter: 'brightness(1.0) contrast(1.0)'
                      }}
                      onLoadedData={(e) => {
                        const video = e.target as HTMLVideoElement;
                        video.playbackRate = 0.8;
                      }}
                    >
                      {/* Dynamiczne źródło video w zależności od urządzenia */}
                      {videoSource && <source src={videoSource} type="video/mp4" />}
                      {!isMobile && slide.video && <source src="/images/hero/video.webm" type="video/webm" />}
                      Your browser does not support the video tag.
                    </video>
                  )}
                  
                  {/* Enhanced Overlay with Gradient - tylko dla slajdów z video */}
                  {!isImageSlide && (
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 rounded-lg"></div>
                  )}
                </div>
              </div>
            
            {/* Content */}
            <div className={`relative z-10 flex items-start md:items-center justify-center h-full text-center pt-12 md:pt-0 ${isImageSlide ? 'text-white' : 'text-white'}`}>
              <div className="w-full">
                {slide.title && (
                  <h1 className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-3 animate-fade-in ${isImageSlide ? 'drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]' : 'drop-shadow-2xl'}`}>
                    {slide.title}
                  </h1>
                )}
                {slide.subtitle && (
                  <p className={`text-base md:text-lg lg:text-xl mb-4 animate-fade-in-delay max-w-2xl mx-auto ${isImageSlide ? 'text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]' : 'text-gray-300 drop-shadow-lg'}`}>
                    {slide.subtitle}
                  </p>
                )}
                
                {/* Benefits */}
                {slide.benefits && slide.benefits.length > 0 && (
                  <div className="mb-6 animate-fade-in-delay">
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                      {slide.benefits.map((benefit, index) => (
                        <span 
                          key={index}
                          className="bg-white/10 backdrop-blur px-3 py-1.5 rounded-full text-xs md:text-sm border border-white/20"
                        >
                          ✓ {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {slide.cta && (
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center animate-fade-in-delay-2">
                    <button 
                      onClick={() => {
                        // Dla pierwszego slajdu z "Skonfiguruj swój zestaw" przekieruj na /dywaniki
                        if (slide.cta === "Skonfiguruj swój zestaw") {
                          router.push('/dywaniki');
                        } else if (slide.cta === "Sprawdź promocję") {
                          router.push('/konfigurator');
                        } else {
                          // Dla innych przycisków zachowaj poprzednie zachowanie
                          const element = document.getElementById('products');
                          if (element) {
                            element.scrollIntoView({ 
                              behavior: 'smooth',
                              block: 'start'
                            });
                          }
                        }
                      }}
                      className={`${isImageSlide ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} active:bg-red-700 text-white px-6 py-3 rounded-full text-base font-semibold transition-all duration-300 shadow-xl hover:shadow-red-500/25 hover:scale-105 active:scale-95 touch-manipulation min-h-[44px]`}
                    >
                      {slide.cta}
                    </button>
                    {!isImageSlide && (
                      <button 
                        onClick={() => {
                          const element = document.getElementById('3d-mats-section');
                          if (element) {
                            element.scrollIntoView({ 
                              behavior: 'smooth',
                              block: 'start'
                            });
                          }
                        }}
                        className="bg-white/10 backdrop-blur border border-white/20 text-white px-6 py-3 rounded-full text-base font-semibold transition-all duration-300 hover:bg-white/20 active:bg-white/30 touch-manipulation min-h-[44px]"
                      >
                        Dowiedz się więcej
                      </button>
                    )}
                  </div>
                )}
                
                {/* Mobile - Numer telefonu i informacja */}
                {!isImageSlide && (
                  <div className="md:hidden mt-6 mb-16 animate-fade-in-delay-2 flex flex-col items-center gap-3">
                    <a 
                      href="tel:+48570123635"
                      className="text-white text-xl md:text-2xl font-bold flex items-center gap-3 hover:text-red-400 transition-colors drop-shadow-lg"
                    >
                      <Phone className="w-6 h-6" />
                      +48 570 123 635
                    </a>
                    <p className="text-white text-base md:text-lg font-semibold text-center drop-shadow-lg">
                      Zadzwoń i wyceń dywaniki
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
        })}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrev}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 active:bg-white/40 text-white p-3 rounded-full transition-colors z-20 touch-manipulation min-w-[44px] min-h-[44px]"
        aria-label="Poprzedni slajd"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button
        onClick={goToNext}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 active:bg-white/40 text-white p-3 rounded-full transition-colors z-20 touch-manipulation min-w-[44px] min-h-[44px]"
        aria-label="Następny slajd"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 md:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-4 h-4 sm:w-3 sm:h-3 md:w-2 md:h-2 rounded-full transition-colors p-2 ${
              index === currentSlide ? "bg-white" : "bg-white/50"
            }`}
            aria-label={`Przejdź do slajdu ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}