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
    <section className="relative min-h-[600px] md:min-h-[550px] h-[75vh] md:h-[70vh] overflow-hidden pt-20 md:pt-0 pb-12 md:pb-0 bg-black">
      {/* Carousel */}
      <div className="container mx-auto px-4 relative h-full py-8 md:py-0">
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
              <div className="absolute inset-0 w-full h-full flex justify-center items-center md:p-8">
                <div className="w-full h-full relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                  {isImageSlide && slide.image ? (
                    <>
                      <Image
                        src={slide.image}
                        alt="Black Friday"
                        fill
                        className="object-cover object-center"
                        priority={index === 1}
                        sizes="100vw"
                      />
                      {/* Radial Overlay */}
                      <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/60"></div>
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
                        className="w-full h-full object-cover object-center"
                        style={{
                          objectPosition: 'center center',
                          filter: 'brightness(0.9) contrast(1.1)'
                        }}
                        onLoadedData={(e) => {
                          const video = e.target as HTMLVideoElement;
                          video.playbackRate = 0.8;
                        }}
                      >
                        {videoSource && <source src={videoSource} type="video/mp4" />}
                        {!isMobile && slide.video && <source src="/images/hero/video.webm" type="video/webm" />}
                        Your browser does not support the video tag.
                      </video>
                      {/* Premium Radial Overlay - Focus center */}
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-black/40 to-black/80"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>
                    </>
                  )}
                  
                  {/* Content */}
                  <div className={`absolute inset-0 flex flex-col items-center justify-center text-center p-8 md:p-12 ${isImageSlide ? 'text-white' : 'text-white'}`}>
                    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 w-full px-2">
                      {slide.title && (
                        <h1 className={`text-3xl md:text-5xl lg:text-7xl font-bold tracking-tight leading-tight animate-fade-up break-words ${isImageSlide ? 'drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]' : 'drop-shadow-2xl'}`}>
                          {slide.title}
                        </h1>
                      )}
                      
                      {slide.subtitle && (
                        <p className={`text-lg md:text-xl lg:text-2xl font-light tracking-wide max-w-2xl mx-auto animate-fade-in-delay ${isImageSlide ? 'text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]' : 'text-gray-200 drop-shadow-lg'}`}>
                          {slide.subtitle}
                        </p>
                      )}
                      
                      {/* Benefits Chips */}
                      {slide.benefits && slide.benefits.length > 0 && (
                        <div className="animate-fade-in-delay flex flex-wrap justify-center gap-3">
                          {slide.benefits.map((benefit, index) => (
                            <div 
                              key={index}
                              className="glass-panel px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium backdrop-blur-md border-white/20 bg-white/5 hover:bg-white/10 transition-colors"
                            >
                              {index === 0 && <ShieldCheck className="w-4 h-4 text-red-500" />}
                              {index === 1 && <Droplets className="w-4 h-4 text-blue-400" />}
                              {index === 2 && <Truck className="w-4 h-4 text-green-400" />}
                              {benefit}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {slide.cta && (
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center animate-fade-in-delay-2 pt-4 pb-4 md:pb-0">
                          <button 
                            onClick={() => {
                              if (slide.cta === "Skonfiguruj swój zestaw") {
                                router.push('/dywaniki');
                              } else if (slide.cta === "Sprawdź promocję") {
                                router.push('/konfigurator');
                              } else {
                                const element = document.getElementById('products');
                                if (element) {
                                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                              }
                            }}
                            className={`
                              group relative px-6 md:px-8 py-3 md:py-4 rounded-full text-sm md:text-base font-bold tracking-wide transition-all duration-300 w-full sm:w-auto
                              ${isImageSlide 
                                ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20' 
                                : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-xl shadow-red-900/30'
                              }
                              hover:scale-105 hover:shadow-2xl hover:shadow-red-600/20 active:scale-95
                            `}
                          >
                            <span className="flex items-center justify-center gap-2">
                              {slide.cta}
                              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                          </button>
                          
                          {!isImageSlide && (
                            <button 
                              onClick={() => {
                                const element = document.getElementById('3d-mats-section');
                                if (element) {
                                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                              }}
                              className="glass-button px-6 md:px-8 py-3 md:py-4 rounded-full text-sm md:text-base font-semibold tracking-wide hover:bg-white/10 hover:border-white/40 w-full sm:w-auto"
                            >
                              Dowiedz się więcej
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrev}
        className="absolute left-6 top-1/2 transform -translate-y-1/2 glass-button p-3 rounded-full hover:bg-white/20 transition-all z-20 group opacity-0 md:opacity-100"
        aria-label="Poprzedni slajd"
      >
        <svg className="w-5 h-5 text-white group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button
        onClick={goToNext}
        className="absolute right-6 top-1/2 transform -translate-y-1/2 glass-button p-3 rounded-full hover:bg-white/20 transition-all z-20 group opacity-0 md:opacity-100"
        aria-label="Następny slajd"
      >
        <svg className="w-5 h-5 text-white group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              index === currentSlide ? "w-8 bg-white" : "w-2 bg-white/30 hover:bg-white/50"
            }`}
            aria-label={`Przejdź do slajdu ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
