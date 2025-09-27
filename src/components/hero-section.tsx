"use client";

import { useState, useEffect } from "react";

const heroSlides = [
  {
    id: 1,
    title: "Dywaniki Samochodowe EVA Premium",
    subtitle: "Wodoodporne, łatwe w czyszczeniu, precyzyjnie dopasowane do Twojego auta",
    video: "/images/hero/heromat.mp4",
    cta: "Sprawdź Ceny",
    price: "Od 199 zł",
    benefits: ["Wodoodporne", "Łatwe w czyszczeniu", "Darmowa dostawa"]
  },
  {
    id: 2,
    title: "Najwyższa Jakość Materiałów EVA",
    subtitle: "Profesjonalne dywaniki samochodowe najwyższej jakości",
    video: "/images/hero/heromat.mp4",
    cta: "Poznaj Materiały",
    price: "Gwarancja 2 lata",
    benefits: ["Materiał EVA", "Odporność na wilgoć", "Trwałość"]
  },
  {
    id: 3,
    title: "Spersonalizowane Dywaniki Samochodowe",
    subtitle: "Dokładnie dopasowane do modelu Twojego auta",
    video: "/images/hero/heromat.mp4",
    cta: "Wybierz Model",
    price: "Dostawa 24h",
    benefits: ["Precyzyjne dopasowanie", "Szybka dostawa", "5000+ zadowolonych klientów"]
  }
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const goToPrev = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <section className="relative h-[60vh] md:h-[70vh] overflow-hidden">
      {/* Carousel */}
      <div className="container mx-auto px-4 relative h-full">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Video Background */}
            <div className="absolute inset-0 w-full h-full flex justify-center">
              <div className="w-full h-full">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  poster="/images/hero/heromat-poster.jpg"
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
                <source src={slide.video} type="video/mp4" />
                <source src="/images/hero/heromat.webm" type="video/webm" />
                <source src="/images/hero/heromat-4k.mp4" type="video/mp4" />
                Your browser does not support the video tag.
                </video>
                
                {/* Enhanced Overlay with Gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 rounded-lg"></div>
              </div>
            </div>
            
            {/* Content */}
            <div className="relative z-10 flex items-center justify-center h-full text-center text-white">
              <div className="w-full">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 animate-fade-in drop-shadow-2xl">
                  {slide.title}
                </h1>
                <p className="text-base md:text-lg lg:text-xl mb-4 text-gray-300 animate-fade-in-delay drop-shadow-lg max-w-2xl mx-auto">
                  {slide.subtitle}
                </p>
                
                {/* Price and Benefits */}
                <div className="mb-6 animate-fade-in-delay">
                  <div className="text-xl md:text-2xl font-bold text-red-400 mb-3">
                    {slide.price}
                  </div>
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
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center animate-fade-in-delay-2">
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
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full text-base font-semibold transition-all duration-300 shadow-xl hover:shadow-red-500/25 hover:scale-105"
                  >
                    {slide.cta}
                  </button>
                  <button 
                    onClick={() => {
                      const element = document.getElementById('o-nas');
                      if (element) {
                        element.scrollIntoView({ 
                          behavior: 'smooth',
                          block: 'start'
                        });
                      }
                    }}
                    className="bg-white/10 backdrop-blur border border-white/20 text-white px-6 py-3 rounded-full text-base font-semibold transition-all duration-300 hover:bg-white/20"
                  >
                    Dowiedz się więcej
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrev}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors z-20"
        aria-label="Poprzedni slajd"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button
        onClick={goToNext}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors z-20"
        aria-label="Następny slajd"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentSlide ? "bg-white" : "bg-white/50"
            }`}
            aria-label={`Przejdź do slajdu ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
} 