"use client";
import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { WindowCard } from "./ui/WindowCard";
import { ImageCarouselProps } from "../types/carousel";

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

// Zachowujemy kompatybilność wsteczną dla prostych kolorów
interface LegacyImageCarouselProps {
  images: string[];
  className?: string;
}

// Nowy komponent z generics
export default function ImageCarousel<T>({ 
  items, 
  className = "", 
  onItemClick,
  renderItem
}: ImageCarouselProps<T>) {
  const [centerIndex, setCenterIndex] = useState(2);
  const total = items?.length || 0;

  // Jeśli nie ma elementów, nie renderuj karuzeli
  if (!items || items.length === 0) {
    return (
      <div className={`relative bg-black py-16 flex justify-center items-center ${className}`}>
        <div className="text-white text-xl">Brak elementów do wyświetlenia</div>
      </div>
    );
  }

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

  const handleCardClick = (item: T) => {
    if (onItemClick) {
      onItemClick(item);
    }
  };

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
        {visibleIndexes.map((itemIdx, posIdx) => {
          const item = items[itemIdx];
          const positionClass = getPositionClass(POSITIONS[posIdx]) + " transition-all duration-300";
          
          // Sprawdzenie czy item istnieje
          if (!item) return null;
          
          // Jeśli przekazano custom renderItem, użyj go
          if (renderItem) {
            return (
              <div 
                key={itemIdx} 
                className={positionClass}
                onClick={() => handleCardClick(item)}
                style={{ cursor: onItemClick ? 'pointer' : 'default' }}
              >
                {renderItem(item, itemIdx, POSITIONS[posIdx])}
              </div>
            );
          }
          
          // Domyślne renderowanie (kompatybilność wsteczna)
          if (typeof item === 'string') {
            return (
              <WindowCard
                key={itemIdx}
                title={`Produkt ${itemIdx + 1}`}
                backgroundColor={`#${item}`}
                imageSrc="/window.svg"
                className={positionClass}
              />
            );
          }
          
          // Dla obiektów z name i imageSrc
          if (typeof item === 'object' && 'name' in item && 'imageSrc' in item) {
            return (
              <WindowCard
                key={itemIdx}
                title={(item as any).name}
                imageSrc={(item as any).imageSrc}
                className={positionClass}
              />
            );
          }
          
          return null;
        })}
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

// Kompatybilność wsteczna - stary interfejs
export function LegacyImageCarousel({ images, className }: LegacyImageCarouselProps) {
  return (
    <ImageCarousel<string>
      items={images}
      className={className}
      renderItem={(color, index, position) => (
        <WindowCard
          title={`Produkt ${index + 1}`}
          backgroundColor={`#${color}`}
          imageSrc="/window.svg"
          className={getPositionClass(position) + " transition-all duration-300"}
        />
      )}
    />
  );
} 