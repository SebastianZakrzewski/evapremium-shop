"use client";
import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageCarouselProps {
  images: string[];
  className?: string;
}

const POSITIONS = [
  "far-left",
  "left",
  "center",
  "right",
  "far-right"
];

const getPositionClass = (pos: string) => {
  switch (pos) {
    case "center":
      return "z-20 scale-100 blur-0 shadow-2xl";
    case "left":
      return "z-10 scale-95 blur-sm -mx-6 opacity-90";
    case "right":
      return "z-10 scale-95 blur-sm -mx-6 opacity-90";
    case "far-left":
      return "z-0 scale-90 blur-md -mx-10 opacity-70";
    case "far-right":
      return "z-0 scale-90 blur-md -mx-10 opacity-70";
    default:
      return "hidden";
  }
};

export default function ImageCarousel({ images, className = "" }: ImageCarouselProps) {
  const [centerIndex, setCenterIndex] = useState(2); // start od środka
  const total = images.length;

  // Wylicz indeksy 5 widocznych kart
  const getVisibleIndexes = () => {
    return [
      (centerIndex - 2 + total) % total,
      (centerIndex - 1 + total) % total,
      centerIndex % total,
      (centerIndex + 1) % total,
      (centerIndex + 2) % total,
    ];
  };

  const handlePrev = () => setCenterIndex((prev) => (prev - 1 + total) % total);
  const handleNext = () => setCenterIndex((prev) => (prev + 1) % total);

  const visibleIndexes = getVisibleIndexes();

  return (
    <div className={`relative bg-black py-16 flex justify-center items-center ${className}`}>
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-black/70 text-[#ff0033] p-3 rounded-full transition-colors"
        onClick={handlePrev}
        aria-label="Poprzedni"
      >
        <ChevronLeft size={32} />
      </button>
      <div className="flex w-full max-w-5xl justify-center items-center gap-0 select-none">
        {visibleIndexes.map((imgIdx, posIdx) => (
          <div
            key={imgIdx}
            className={`transition-all duration-300 w-44 h-72 md:w-56 md:h-96 aspect-[9/16] flex items-center justify-center rounded-2xl ${getPositionClass(POSITIONS[posIdx])}`}
            style={{ backgroundColor: `#${images[imgIdx]}` }}
          >
            <span className="text-white text-xl font-bold select-none">Produkt {imgIdx + 1}</span>
          </div>
        ))}
      </div>
      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-black/70 text-[#ff0033] p-3 rounded-full transition-colors"
        onClick={handleNext}
        aria-label="Następny"
      >
        <ChevronRight size={32} />
      </button>
    </div>
  );
} 