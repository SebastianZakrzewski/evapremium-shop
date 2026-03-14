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
  imageAlt?: string;
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
    title: "Odkryj naszą kolekcję",
    subtitle: "Setki modeli aut, precyzyjne dopasowanie do każdego wnętrza",
    image: "/hero2.png",
    imageAlt: "Dywaniki samochodowe EVA Premium - kolekcja produktów",
    cta: "Zobacz produkty",
    price: "",
    benefits: [],
    isImageSlide: true
  }
]

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
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);

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

  // Autoplay z pauzą przy hover/focus
  useEffect(() => {
    if (isAutoplayPaused) return
    const interval = setInterval(goToNext, 6000)
    return () => clearInterval(interval)
  }, [currentSlide, isAutoplayPaused, goToNext])

  // Określ które slajdy renderować (tylko aktywny + następny dla lazy loading)
  const visibleSlides = useMemo(() => {
    const slides: number[] = [currentSlide];
    const nextSlide = (currentSlide + 1) % heroSlides.length;
    if (nextSlide !== currentSlide) {
      slides.push(nextSlide);
    }
    return slides;
  }, [currentSlide]);

  const handlePauseAutoplay = useCallback(() => setIsAutoplayPaused(true), [])
  const handleResumeAutoplay = useCallback(() => setIsAutoplayPaused(false), [])

  return (
    <section
      className="relative min-h-[85vh] md:min-h-[550px] h-auto md:h-[70vh] overflow-visible md:overflow-hidden pt-24 md:pt-0 pb-20 md:pb-0 bg-neutral-950"
      role="region"
      aria-roledescription="carousel"
      aria-label="Sekcja promocyjna - dywaniki samochodowe"
      onMouseEnter={handlePauseAutoplay}
      onMouseLeave={handleResumeAutoplay}
    >
      {/* Phone number - Mobile only */}
      <div className="md:hidden absolute top-4 left-0 right-0 z-30 px-4">
        <a 
          href="tel:+48793993430"
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2.5 rounded-full shadow-lg shadow-red-900/50 hover:from-red-500 hover:to-red-600 transition-all duration-300 active:scale-95"
        >
          <Phone className="w-4 h-4" />
          <span className="font-semibold text-sm">+48 793 993 430</span>
        </a>
      </div>

      {/* Carousel */}
      <div className="container mx-auto px-4 relative min-h-[85vh] md:min-h-0 md:h-full py-12 md:py-0">
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
              <div className="absolute inset-0 w-full h-full flex justify-center items-center p-4 md:p-8">
                <div className="w-full h-full relative rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10 min-h-[60vh] md:min-h-0">
                  {isImageSlide && slide.image ? (
                    <>
                      <div className="absolute inset-0 bg-neutral-950">
                        <Image
                          src={slide.image}
                          alt={slide.imageAlt ?? "Dywaniki samochodowe EVA Premium"}
                          fill
                          className="object-contain object-center"
                          priority={index === 1}
                          quality={90}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1920px"
                        />
                      </div>
                      {/* Radial Overlay */}
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.2)_50%,rgba(0,0,0,0.6)_100%)]"></div>
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
                          filter: 'brightness(1.2) contrast(1.1)'
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
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.2)_50%,rgba(0,0,0,0.5)_100%)]"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/15"></div>
                    </>
                  )}
                  
                  {/* Content */}
                  {(!isImageSlide || slide.title || slide.cta) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 md:p-12 text-white" aria-live="polite" aria-atomic="true">
                      <div className="max-w-4xl mx-auto space-y-5 md:space-y-8 w-full px-3">
                        {slide.title && (
                          <h1 className={`text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-bold tracking-tight leading-tight animate-fade-up break-words mb-2 drop-shadow-2xl`}>
                            {slide.title}
                          </h1>
                        )}
                        
                        {slide.subtitle && (
                          <p className={`text-sm sm:text-base md:text-xl lg:text-2xl font-light tracking-wide max-w-2xl mx-auto animate-fade-in-delay mb-3 text-gray-200 drop-shadow-lg`}>
                            {slide.subtitle}
                          </p>
                        )}
                        
                        {/* Price badge */}
                        {slide.price && (
                          <div className="animate-fade-in-delay inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-lg font-semibold text-white mb-4">
                            {slide.price}
                          </div>
                        )}
                        
                        {/* Benefits Chips */}
                        {slide.benefits && slide.benefits.length > 0 && (
                          <div className="animate-fade-in-delay flex flex-wrap justify-center gap-2 md:gap-3 mb-4">
                            {slide.benefits.map((benefit, index) => (
                              <div 
                                key={index}
                                className="glass-panel px-3 md:px-4 py-1.5 md:py-2 rounded-full flex items-center gap-2 text-xs md:text-sm font-medium backdrop-blur-md border-white/20 bg-white/5 hover:bg-white/10 transition-colors"
                              >
                                {index === 0 && <ShieldCheck className="w-3 h-3 md:w-4 md:h-4 text-red-500" />}
                                {index === 1 && <Droplets className="w-3 h-3 md:w-4 md:h-4 text-blue-400" />}
                                {index === 2 && <Truck className="w-3 h-3 md:w-4 md:h-4 text-green-400" />}
                                {benefit}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {slide.cta && (
                          <div className="flex flex-col sm:flex-row gap-3 md:gap-6 justify-center items-center animate-fade-in-delay-2 pt-2 pb-6 md:pb-0">
                            <button 
                              onClick={() => {
                                if (slide.cta === "Skonfiguruj swój zestaw") {
                                  router.push('/dywaniki')
                                } else {
                                  const element = document.getElementById('products')
                                  if (element) {
                                    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                  }
                                }
                              }}
                              className="
                                group relative px-6 md:px-8 py-3 md:py-4 rounded-full text-sm md:text-base font-bold tracking-wide transition-all duration-300 w-full sm:w-auto
                                bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-xl shadow-red-900/30
                                hover:scale-105 hover:shadow-2xl hover:shadow-red-600/20 active:scale-95
                              "
                            >
                              <span className="flex items-center justify-center gap-2">
                                {slide.cta}
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                              </span>
                            </button>
                            
                            {!isImageSlide && (
                              <button 
                                onClick={() => {
                                  const element = document.getElementById('3d-mats-section')
                                  if (element) {
                                    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows - widoczne na mobile i desktop */}
      <button
        onClick={goToPrev}
        className="absolute left-2 md:left-6 top-1/2 transform -translate-y-1/2 glass-button p-2.5 md:p-3 rounded-full hover:bg-white/20 transition-all z-20 group min-w-[44px] min-h-[44px] flex items-center justify-center opacity-80 md:opacity-100"
        aria-label="Poprzedni slajd"
      >
        <svg className="w-5 h-5 text-white group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button
        onClick={goToNext}
        className="absolute right-2 md:right-6 top-1/2 transform -translate-y-1/2 glass-button p-2.5 md:p-3 rounded-full hover:bg-white/20 transition-all z-20 group min-w-[44px] min-h-[44px] flex items-center justify-center opacity-80 md:opacity-100"
        aria-label="Następny slajd"
      >
        <svg className="w-5 h-5 text-white group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Indicators - touch targets min 44px */}
      <div className="absolute bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-1 z-20" role="tablist" aria-label="Nawigacja slajdów">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className="relative p-3 -m-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-white/5 transition-colors"
            aria-label={`Przejdź do slajdu ${index + 1}`}
            aria-selected={index === currentSlide}
            role="tab"
          >
            <span
              className={`block h-1.5 rounded-full transition-all duration-500 ${
                index === currentSlide ? "w-8 bg-white" : "w-2 bg-white/30 hover:bg-white/50"
              }`}
            />
          </button>
        ))}
        <span className="sr-only" aria-live="polite">
          Slajd {currentSlide + 1} z {heroSlides.length}
        </span>
      </div>
    </section>
  );
}



