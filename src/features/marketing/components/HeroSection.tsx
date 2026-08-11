"use client";

import { useState, useEffect, useCallback, useMemo, useRef, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Phone, ChevronRight, ShieldCheck, Droplets, Truck } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  HERO_PROMO_ASPECT_CLASS,
  HERO_PROMO_IMAGE_SIZES,
  HERO_PROMO_IMAGE_SRC,
  HERO_PROMO_MOBILE_IMAGE_SIZES,
  HERO_PROMO_MOBILE_IMAGE_SRC,
  heroPromoImageProps,
} from "@/features/marketing/lib/heroImage";

type HeroSlide = {
  id: number;
  title: string;
  subtitle: string;
  cta: string;
  price: string;
  benefits: string[];
  video?: string;
  videoWebm?: string;
  videoPoster?: string;
  image?: string;
  /** Opcjonalny baner pionowy poniżej breakpointu md; bez tego używany jest tylko `image`. */
  imageMobile?: string;
  imageAlt?: string;
  isImageSlide?: boolean;
  /** Klikalny CTA nałożony na baner (np. zamiast niewidocznego tekstu w grafice). */
  ctaOverlay?: {
    label: string
    scrollToSectionId: string
    /** Przycisk CTA jest już na grafice — tylko niewidoczny hit area. */
    embeddedInImage?: boolean
  };
};

const HERO_INTRO_VIDEO_MP4 = "/images/hero/0811.mp4"
const HERO_INTRO_VIDEO_WEBM = "/images/hero/0811.webm"
const HERO_INTRO_VIDEO_POSTER = "/images/hero/0811-poster.jpg"

/** Tymczasowo wyłączone — ustaw `true`, aby przywrócić intro video w karuzeli. */
const HERO_INTRO_VIDEO_ENABLED = false

const allHeroSlides: HeroSlide[] = [
  {
    id: 1,
    title: "",
    subtitle: "",
    video: HERO_INTRO_VIDEO_MP4,
    videoWebm: HERO_INTRO_VIDEO_WEBM,
    videoPoster: HERO_INTRO_VIDEO_POSTER,
    cta: "",
    price: "",
    benefits: [],
  },
  {
    id: 2,
    title: "",
    subtitle: "",
    image: HERO_PROMO_IMAGE_SRC,
    imageMobile: HERO_PROMO_MOBILE_IMAGE_SRC,
    imageAlt: "Letnia promocja dywaników samochodowych EVA Premium do -30%",
    cta: "",
    price: "",
    benefits: [],
    isImageSlide: true,
    ctaOverlay: {
      label: "Skonfiguruj dywaniki do swojego auta",
      scrollToSectionId: "products",
      embeddedInImage: true,
    },
  },
]

const heroSlides = HERO_INTRO_VIDEO_ENABLED
  ? allHeroSlides
  : allHeroSlides.filter((slide) => !slide.video)

const HERO_VIDEO_SLIDE_INDEX = heroSlides.findIndex((slide) => Boolean(slide.video))
const HERO_PROMO_SLIDE_INDEX = heroSlides.findIndex((slide) => slide.isImageSlide)
const HERO_HAS_CAROUSEL_NAV = heroSlides.length > 1
const HERO_MOBILE_MEDIA_QUERY = "(max-width: 767px)"

const promoSlide = heroSlides[HERO_PROMO_SLIDE_INDEX] ?? allHeroSlides.find((slide) => slide.isImageSlide)!

const subscribeToMobileMediaQuery = (onStoreChange: () => void) => {
  const mediaQuery = window.matchMedia(HERO_MOBILE_MEDIA_QUERY)
  mediaQuery.addEventListener("change", onStoreChange)

  return () => {
    mediaQuery.removeEventListener("change", onStoreChange)
  }
}

const getIsMobileHero = () => window.matchMedia(HERO_MOBILE_MEDIA_QUERY).matches

type HeroPromoBannerProps = {
  slide: HeroSlide
  onScrollToSection: (sectionId: string) => void
  mobileOnly?: boolean
  priority?: boolean
  ctaTestId?: string
}

const HeroPromoBanner = ({
  slide,
  onScrollToSection,
  mobileOnly = false,
  priority = true,
  ctaTestId = "hero-promo-cta-hit-area",
}: HeroPromoBannerProps) => {
  if (!slide.image) {
    return null
  }

  return (
    <>
      <div className="absolute inset-0 bg-neutral-100">
        {slide.imageMobile ? (
          <>
            <Image
              src={slide.imageMobile}
              alt={slide.imageAlt ?? "Dywaniki samochodowe EVA Premium"}
              fill
              className="object-contain object-center md:hidden"
              priority={priority}
              sizes={HERO_PROMO_MOBILE_IMAGE_SIZES}
              {...heroPromoImageProps}
            />
            {!mobileOnly ? (
              <Image
                src={slide.image}
                alt={slide.imageAlt ?? "Dywaniki samochodowe EVA Premium"}
                fill
                className="hidden object-contain object-center md:block"
                priority={priority}
                sizes={HERO_PROMO_IMAGE_SIZES}
                {...heroPromoImageProps}
              />
            ) : null}
          </>
        ) : (
          <Image
            src={slide.image}
            alt={slide.imageAlt ?? "Dywaniki samochodowe EVA Premium"}
            fill
            className="object-contain object-center"
            priority={priority}
            sizes={HERO_PROMO_IMAGE_SIZES}
            {...heroPromoImageProps}
          />
        )}
      </div>
      {slide.ctaOverlay?.embeddedInImage ? null : (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.12)_50%,rgba(0,0,0,0.42)_100%)]" />
      )}
      {slide.ctaOverlay ? (
        <div className="pointer-events-none absolute inset-0 z-30">
          {!slide.imageMobile && !slide.ctaOverlay.embeddedInImage ? (
            <button
              type="button"
              onClick={() => onScrollToSection(slide.ctaOverlay!.scrollToSectionId)}
              data-testid="hero-promo-cta-button"
              className="pointer-events-auto absolute bottom-[8%] left-1/2 flex min-h-11 w-[calc(100%-1rem)] max-w-none -translate-x-1/2 items-center gap-2 rounded-xl border border-red-500/30 bg-gradient-to-r from-red-600 to-red-700 px-3.5 py-3 text-left text-xs font-bold leading-snug text-white shadow-xl shadow-red-900/40 transition-all duration-300 hover:scale-[1.02] hover:from-red-500 hover:to-red-600 hover:shadow-2xl hover:shadow-red-600/25 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:bottom-[9%] sm:left-[2%] sm:w-auto sm:max-w-[min(92vw,23rem)] sm:min-h-0 sm:translate-x-0 sm:rounded-2xl sm:px-5 sm:py-4 sm:text-sm sm:leading-tight md:hidden"
              aria-label={`${slide.ctaOverlay.label} — przewiń do wyboru dywaników`}
            >
              <span className="min-w-0 flex-1 leading-tight">{slide.ctaOverlay.label}</span>
              <ChevronRight className="size-4 shrink-0 sm:size-5" aria-hidden="true" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              if (!slide.ctaOverlay) return
              onScrollToSection(slide.ctaOverlay.scrollToSectionId)
            }}
            data-testid={ctaTestId}
            className={cn(
              "pointer-events-auto absolute inset-x-0 bottom-0 z-30 cursor-pointer border-0 bg-transparent p-0",
              slide.ctaOverlay.embeddedInImage
                ? "top-[72%] sm:top-[74%] md:top-[76%]"
                : slide.imageMobile
                  ? "top-[30%]"
                  : "top-[42%] hidden md:block"
            )}
            aria-label={`${slide.ctaOverlay.label} — przewiń do wyboru dywaników`}
          />
        </div>
      ) : null}
    </>
  )
}

const playHeroVideo = (video: HTMLVideoElement) => {
  try {
    // Natywne 1.0 — slow-mo jest w pliku; playbackRate < 1 powoduje szarpanie.
    video.playbackRate = 1
    const playPromise = video.play()

    if (playPromise && typeof playPromise.catch === "function") {
      void playPromise.catch(() => undefined)
    }
  } catch {
    // Autoplay może być zablokowany przez przeglądarkę lub środowisko testowe.
  }
}

const pauseHeroVideo = (video: HTMLVideoElement) => {
  try {
    video.pause()
  } catch {
    // jsdom nie implementuje pause() dla <video>.
  }
}

export default function HeroSection() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroVideoRef = useRef<HTMLVideoElement | null>(null)
  const isMobileHero = useSyncExternalStore(
    subscribeToMobileMediaQuery,
    getIsMobileHero,
    () => false
  );

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

  useEffect(() => {
    if (isMobileHero) {
      return
    }

    const video = heroVideoRef.current
    if (!video) {
      return
    }

    if (currentSlide === HERO_VIDEO_SLIDE_INDEX) {
      playHeroVideo(video)
      return
    }

    pauseHeroVideo(video)
  }, [currentSlide, isMobileHero])

  // Określ które slajdy renderować (tylko aktywny + następny dla lazy loading)
  const visibleSlides = useMemo(() => {
    const slides: number[] = [currentSlide];
    const nextSlide = (currentSlide + 1) % heroSlides.length;
    if (nextSlide !== currentSlide) {
      slides.push(nextSlide);
    }
    return slides;
  }, [currentSlide]);

  const handleScrollToSection = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [])

  const handleVideoEnded = useCallback(() => {
    setCurrentSlide(HERO_PROMO_SLIDE_INDEX)
  }, [])

  const heroCarouselFrameClass = heroSlides.some((s) => s.imageMobile)
    ? HERO_PROMO_ASPECT_CLASS
    : "aspect-[1234/413]"

  return (
    <section
      className="relative overflow-visible bg-black pt-[4.5rem] pb-14 max-sm:pb-10 md:overflow-hidden md:pt-0 md:pb-12"
      role="region"
      aria-roledescription={isMobileHero || !HERO_HAS_CAROUSEL_NAV ? undefined : "carousel"}
      aria-label="Sekcja promocyjna - dywaniki samochodowe"
    >
      {/* Phone number - Mobile only */}
      <div className="md:hidden absolute top-3 left-0 right-0 z-30 px-3">
        <a 
          href="tel:+48793993430"
          className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-red-600 to-red-700 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-red-900/50 transition-all duration-300 hover:from-red-500 hover:to-red-600 active:scale-95"
        >
          <Phone className="size-4 shrink-0" aria-hidden="true" />
          <span>+48 793 993 430</span>
        </a>
      </div>

      {/* Carousel — wysokość = proporcja oryginalnej rozdzielczości banera */}
      <div className="container relative mx-auto px-2 py-6 sm:px-4 sm:py-8 md:py-8">
        {isMobileHero ? (
          <div
            className={cn(
              "relative mx-auto w-full max-w-[1234px] overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10 sm:rounded-2xl",
              heroCarouselFrameClass
            )}
            data-testid="hero-mobile-static"
          >
            <div className="relative h-full w-full">
              <HeroPromoBanner
                slide={promoSlide}
                onScrollToSection={handleScrollToSection}
                mobileOnly
                ctaTestId="hero-mobile-promo-cta-hit-area"
              />
            </div>
          </div>
        ) : (
        <div
          className={cn(
            "relative mx-auto w-full max-w-[1234px] overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10 sm:rounded-2xl md:rounded-3xl",
            heroCarouselFrameClass
          )}
          data-testid="hero-desktop-carousel"
        >
          {heroSlides.map((slide, index) => {
            const isVisible = visibleSlides.includes(index);
            const isActive = index === currentSlide;
            const isImageSlide = slide.isImageSlide ?? false;

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
                  <HeroPromoBanner
                    slide={slide}
                    onScrollToSection={handleScrollToSection}
                    priority={index === 0}
                  />
                ) : (
                  <>
                    <video
                      ref={index === HERO_VIDEO_SLIDE_INDEX ? heroVideoRef : undefined}
                      autoPlay={isActive}
                      muted
                      playsInline
                      preload="auto"
                      poster={slide.videoPoster}
                      disablePictureInPicture
                      controlsList="nodownload nofullscreen noremoteplayback"
                      data-hero-slide-video
                      data-hero-slide-index={index}
                      data-testid={`hero-video-${slide.id}`}
                      className="absolute inset-0 h-full w-full object-cover object-center transform-gpu will-change-transform [backface-visibility:hidden]"
                      onEnded={index === HERO_VIDEO_SLIDE_INDEX ? handleVideoEnded : undefined}
                      onCanPlay={(e) => {
                        const videoEl = e.currentTarget
                        if (index === currentSlide) {
                          playHeroVideo(videoEl)
                        }
                      }}
                    >
                      {slide.videoWebm ? (
                        <source src={slide.videoWebm} type="video/webm" />
                      ) : null}
                      {slide.video ? (
                        <source src={slide.video} type="video/mp4" />
                      ) : null}
                      Your browser does not support the video tag.
                    </video>
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.12)_50%,rgba(0,0,0,0.35)_100%)]" />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
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

          {HERO_HAS_CAROUSEL_NAV ? (
            <>
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
            </>
          ) : null}
        </div>
        )}
      </div>
    </section>
  );
}



