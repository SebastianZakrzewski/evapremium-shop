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
  /** Klikalny CTA nałożony na baner (np. zamiast niewidocznego tekstu w grafice). */
  ctaOverlay?: {
    label: string
    scrollToSectionId: string
  };
};

const heroSlides: HeroSlide[] = [
  {
    id: 1,
    title: "",
    subtitle: "",
    image: "/images/hero/wiosenna-zalety-hero2.png",
    imageAlt: "Wiosenna promocja dywaników samochodowych EVA Premium",
    cta: "",
    price: "",
    benefits: [],
    isImageSlide: true,
    ctaOverlay: {
      label: "Skonfiguruj dywaniki do swojego auta",
      scrollToSectionId: "products",
    },
  }
]

/** Wymiary pikselowe aktualnego banera hero (plik PNG, odczyt z IHDR). */
const HERO_PROMO_IMAGE_NATIVE_WIDTH = 2045
const HERO_PROMO_IMAGE_NATIVE_HEIGHT = 769

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

  const handleScrollToSection = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [])

  return (
    <section
      className="relative overflow-visible bg-neutral-950 pt-24 pb-24 md:overflow-hidden md:pt-0 md:pb-12"
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

      {/* Carousel — wysokość = proporcja oryginalnej rozdzielczości banera */}
      <div className="container relative mx-auto px-4 py-12 md:py-8">
        <div
          className="relative mx-auto w-full max-w-[1240px] overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10 md:rounded-3xl"
          style={{
            aspectRatio: `${HERO_PROMO_IMAGE_NATIVE_WIDTH} / ${HERO_PROMO_IMAGE_NATIVE_HEIGHT}`,
          }}
        >
          {heroSlides.map((slide, index) => {
            const isVisible = visibleSlides.includes(index);
            const isActive = index === currentSlide;
            const isImageSlide = slide.isImageSlide ?? false;
            const videoSource = slide.video ? getVideoSource(slide.video, isMobile, isHighDpi) : null;

            if (!isVisible) {
              return null
            }

            return (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  isActive ? "z-10 opacity-100" : "z-0 opacity-0"
                }`}
              >
                {isImageSlide && slide.image ? (
                  <>
                    <div className="absolute inset-0 bg-neutral-950">
                      <Image
                        src={slide.image}
                        alt={slide.imageAlt ?? "Dywaniki samochodowe EVA Premium"}
                        fill
                        className="object-contain object-center brightness-110 contrast-[1.02]"
                        priority={index === 0}
                        quality={90}
                        sizes="(max-width: 1240px) 100vw, 2045px"
                      />
                    </div>
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.12)_50%,rgba(0,0,0,0.42)_100%)]" />
                    {slide.ctaOverlay ? (
                      <div className="pointer-events-none absolute inset-0 z-30">
                        <button
                          type="button"
                          onClick={() => {
                            if (!slide.ctaOverlay) return
                            handleScrollToSection(slide.ctaOverlay.scrollToSectionId)
                          }}
                          className="pointer-events-auto absolute bottom-[9%] left-[2%] flex max-w-[min(92vw,23rem)] items-center gap-2 rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-600 to-red-700 px-3 py-4 text-left text-sm font-bold text-white shadow-xl shadow-red-900/40 transition-all duration-300 hover:scale-[1.02] hover:from-red-500 hover:to-red-600 hover:shadow-2xl hover:shadow-red-600/25 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 sm:px-5 sm:py-4.5 md:bottom-[11%] md:left-[3%] md:max-w-[min(58%,26rem)] md:px-6 md:py-[1.3125rem] md:text-sm"
                          aria-label={`${slide.ctaOverlay.label} — przewiń do wyboru dywaników`}
                        >
                          <span className="min-w-0 flex-1 leading-tight">{slide.ctaOverlay.label}</span>
                          <ChevronRight className="h-5 w-5 shrink-0 md:h-6 md:w-6" aria-hidden="true" />
                        </button>
                      </div>
                    ) : null}
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
                      className="absolute inset-0 h-full w-full object-cover object-center"
                      style={{
                        objectPosition: "center center",
                        filter: "brightness(1.2) contrast(1.1)",
                      }}
                      onLoadedData={(e) => {
                        const videoEl = e.target as HTMLVideoElement
                        videoEl.playbackRate = 0.8
                      }}
                    >
                      {videoSource && <source src={videoSource} type="video/mp4" />}
                      {!isMobile && slide.video && <source src="/images/hero/video.webm" type="video/webm" />}
                      Your browser does not support the video tag.
                    </video>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.2)_50%,rgba(0,0,0,0.5)_100%)]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/15" />
                  </>
                )}

                {(!isImageSlide || slide.title || slide.cta) && (
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white md:p-12"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    <div className="mx-auto w-full max-w-4xl space-y-5 px-3 md:space-y-8">
                      {slide.title && (
                        <h1
                          className={`mb-2 animate-fade-up break-words text-2xl font-bold leading-tight tracking-tight drop-shadow-2xl sm:text-3xl md:text-5xl lg:text-7xl`}
                        >
                          {slide.title}
                        </h1>
                      )}

                      {slide.subtitle && (
                        <p
                          className={`animate-fade-in-delay mb-3 max-w-2xl text-sm font-light tracking-wide text-gray-200 drop-shadow-lg sm:text-base md:text-xl lg:text-2xl mx-auto`}
                        >
                          {slide.subtitle}
                        </p>
                      )}

                      {slide.price && (
                        <div className="animate-fade-in-delay mb-4 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-lg font-semibold text-white backdrop-blur-md">
                          {slide.price}
                        </div>
                      )}

                      {slide.benefits && slide.benefits.length > 0 && (
                        <div className="animate-fade-in-delay mb-4 flex flex-wrap justify-center gap-2 md:gap-3">
                          {slide.benefits.map((benefit, benefitIndex) => (
                            <div
                              key={benefitIndex}
                              className="glass-panel flex items-center gap-2 rounded-full border-white/20 bg-white/5 px-3 py-1.5 text-xs font-medium backdrop-blur-md hover:bg-white/10 md:px-4 md:py-2 md:text-sm"
                            >
                              {benefitIndex === 0 && <ShieldCheck className="h-3 w-3 text-red-500 md:h-4 md:w-4" />}
                              {benefitIndex === 1 && <Droplets className="h-3 w-3 text-blue-400 md:h-4 md:w-4" />}
                              {benefitIndex === 2 && <Truck className="h-3 w-3 text-green-400 md:h-4 md:w-4" />}
                              {benefit}
                            </div>
                          ))}
                        </div>
                      )}

                      {slide.cta && (
                        <div className="animate-fade-in-delay-2 flex flex-col items-center justify-center gap-3 pt-2 pb-6 sm:flex-row md:gap-6 md:pb-0">
                          <button
                            type="button"
                            onClick={() => {
                              if (slide.cta === "Skonfiguruj swój zestaw") {
                                router.push("/dywaniki")
                              } else {
                                const element = document.getElementById("products")
                                if (element) {
                                  element.scrollIntoView({ behavior: "smooth", block: "start" })
                                }
                              }
                            }}
                            className="
                              group relative w-full rounded-full bg-gradient-to-r from-red-600 to-red-700 px-6 py-3 text-sm font-bold tracking-wide text-white shadow-xl shadow-red-900/30 transition-all duration-300 hover:scale-105 hover:from-red-500 hover:to-red-600 hover:shadow-2xl hover:shadow-red-600/20 active:scale-95 sm:w-auto md:px-8 md:py-4 md:text-base
                            "
                          >
                            <span className="flex items-center justify-center gap-2">
                              {slide.cta}
                              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </span>
                          </button>

                          {!isImageSlide && (
                            <button
                              type="button"
                              onClick={() => {
                                const element = document.getElementById("3d-mats-section")
                                if (element) {
                                  element.scrollIntoView({ behavior: "smooth", block: "start" })
                                }
                              }}
                              className="glass-button w-full rounded-full px-6 py-3 text-sm font-semibold tracking-wide hover:bg-white/10 hover:border-white/40 sm:w-auto md:px-8 md:py-4 md:text-base"
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
            )
          })}

          <button
            type="button"
            onClick={goToPrev}
            className="group absolute left-2 top-1/2 z-20 flex min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center rounded-full p-2.5 glass-button hover:bg-white/20 md:left-4 md:p-3"
            aria-label="Poprzedni slajd"
          >
            <svg className="h-5 w-5 text-white transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            type="button"
            onClick={goToNext}
            className="group absolute right-2 top-1/2 z-20 flex min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center rounded-full p-2.5 glass-button hover:bg-white/20 md:right-4 md:p-3"
            aria-label="Następny slajd"
          >
            <svg className="h-5 w-5 text-white transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div
            className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 md:bottom-4"
            role="tablist"
            aria-label="Nawigacja slajdów"
          >
            {heroSlides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goToSlide(index)}
                className="relative -m-3 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-3 hover:bg-white/5"
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
        </div>
      </div>
    </section>
  );
}



