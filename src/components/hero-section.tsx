"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const heroSlides = [
  {
    id: 1,
    title: "Odkryj Nową Kolekcję",
    subtitle: "Najnowsze trendy w modzie",
    image: "/next.svg",
    cta: "Zobacz Kolekcję"
  },
  {
    id: 2,
    title: "Ekskluzywne Materiały",
    subtitle: "Najwyższa jakość wykonania",
    image: "/vercel.svg",
    cta: "Poznaj Materiały"
  },
  {
    id: 3,
    title: "Spersonalizowane Projekty",
    subtitle: "Dostosowane do Twoich potrzeb",
    image: "/file.svg",
    cta: "Zamów Projekt"
  }
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  //   }, 5000);

  //   return () => clearInterval(timer);
  // }, []);

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
    <section className="relative h-screen overflow-hidden">
      {/* Carousel */}
      <div className="relative w-full h-full">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Background Image */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900">
              <div className="absolute inset-0 bg-black/50"></div>
            </div>
            
            {/* Content */}
            <div className="relative z-10 flex items-center justify-center h-full text-center text-white px-4">
              <div className="max-w-4xl">
                <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
                  {slide.title}
                </h1>
                <p className="text-xl md:text-2xl mb-8 text-gray-300 animate-fade-in-delay">
                  {slide.subtitle}
                </p>
                <button className="bg-white text-black px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-200 transition-colors animate-fade-in-delay-2">
                  {slide.cta}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrev}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors z-20"
        aria-label="Poprzedni slajd"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors z-20"
        aria-label="Następny slajd"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? "bg-white" : "bg-white/50"
            }`}
            aria-label={`Przejdź do slajdu ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
} 