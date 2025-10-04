"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
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
      return "z-10 scale-95 blur-sm -mx-8 opacity-90";
    case "right":
      return "z-10 scale-95 blur-sm -mx-8 opacity-90";
    case "far-left":
      return "z-0 scale-90 blur-md -mx-12 opacity-70";
    case "far-right":
      return "z-0 scale-90 blur-md -mx-12 opacity-70";
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
  const [search, setSearch] = useState("");

  // Inteligentne filtrowanie po nazwie z priorytetyzacją
  const filteredItems = React.useMemo(() => {
    if (search.trim().length === 0) return items;
    
    const searchTerm = search.toLowerCase().trim();
    const searchResults = items
      .filter((item: any) => typeof item === 'object' && 'name' in item)
      .map((item: any) => {
        const name = item.name.toLowerCase();
        let score = 0;
        
        // Najwyższy priorytet: nazwa zaczyna się od wyszukiwanej frazy
        if (name.startsWith(searchTerm)) {
          score = 1000;
        }
        // Wysoki priorytet: nazwa zawiera wyszukiwaną frazę na początku słowa
        else if (name.includes(` ${searchTerm}`) || name.includes(`-${searchTerm}`)) {
          score = 500;
        }
        // Średni priorytet: nazwa zawiera wyszukiwaną frazę
        else if (name.includes(searchTerm)) {
          score = 100;
        }
        // Niski priorytet: nazwa zawiera części wyszukiwanej frazy
        else if (searchTerm.length > 1) {
          const searchChars = searchTerm.split('');
          const nameChars = name.split('');
          let matchCount = 0;
          let searchIndex = 0;
          
          for (let i = 0; i < nameChars.length && searchIndex < searchChars.length; i++) {
            if (nameChars[i] === searchChars[searchIndex]) {
              matchCount++;
              searchIndex++;
            }
          }
          
          if (matchCount === searchChars.length) {
            score = 50;
          }
        }
        
        return { item, score };
      })
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(result => result.item);
    
    return searchResults;
  }, [items, search]);

  // Jeśli po wyszukiwaniu zmienia się liczba elementów, ustaw środek
  React.useEffect(() => {
    if (filteredItems.length > 0) {
      const searchTerm = search.toLowerCase().trim();
      if (searchTerm.length > 0) {
        // Znajdź najlepsze dopasowanie (pierwsze w posortowanej liście)
        const bestMatchIndex = filteredItems.findIndex((item: any) => 
          typeof item === 'object' && 'name' in item && 
          item.name.toLowerCase().startsWith(searchTerm)
        );
        
        if (bestMatchIndex !== -1) {
          // Ustaw na najlepsze dopasowanie
          setCenterIndex(bestMatchIndex);
        } else {
          // Jeśli nie ma dokładnego dopasowania, ustaw na pierwszy wynik
          setCenterIndex(0);
        }
      } else {
        // Bez wyszukiwania, ustaw na środek
        setCenterIndex(Math.floor(filteredItems.length / 2));
      }
    } else {
      setCenterIndex(0);
    }
  }, [search, filteredItems]);

  // Jeśli nie ma elementów, nie renderuj karuzeli
  if (!filteredItems || filteredItems.length === 0) {
    return (
      <div className={`relative bg-black py-16 flex flex-col justify-center items-center ${className}`}>
        <div className="relative mb-6 w-full max-w-xs">
          <input
            type="text"
            placeholder="Szukaj marki..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-900/50 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 placeholder-gray-400"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <div className="text-white text-xl mb-2">Brak wyników</div>
          <div className="text-gray-400 text-sm">Spróbuj wpisać inną nazwę marki</div>
        </div>
      </div>
    );
  }

  const getVisibleIndexes = () => {
    // Pokazuj tylko tyle kart, ile jest dostępnych (max 5)
    const visible = [];
    const maxVisible = Math.min(5, filteredItems.length);
    
    // Jeśli jest tylko jedna karta, pokaż ją na środku
    if (filteredItems.length === 1) {
      return [0];
    }
    
    // Oblicz pozycje względem centerIndex
    const halfVisible = Math.floor(maxVisible / 2);
    for (let i = 0; i < maxVisible; i++) {
      const index = (centerIndex - halfVisible + i + filteredItems.length) % filteredItems.length;
      visible.push(index);
    }
    return visible;
  };

  const handlePrev = () => {
    setCenterIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
  };

  const handleNext = () => {
    setCenterIndex((prev) => (prev + 1) % filteredItems.length);
  };

  const visibleIndexes = getVisibleIndexes();

  const handleCardClick = (item: T) => {
    if (onItemClick) {
      onItemClick(item);
    }
  };

  return (
    <div className={`relative bg-black py-16 flex flex-col justify-center items-center ${className}`}>
      <div className="relative mb-6 w-full max-w-xs">
        <input
          type="text"
          placeholder="Szukaj marki..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-gray-900/50 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 placeholder-gray-400"
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>

      <div className="w-full flex justify-center items-center relative">
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-black/70 text-red-500 p-3 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-red-500/25"
          onClick={handlePrev}
          aria-label="Poprzedni"
        >
          <ChevronLeft size={32} />
        </button>
        
        <div className="flex w-full max-w-6xl justify-center items-center gap-0 select-none animate-fade-in">
          {visibleIndexes.map((itemIdx, posIdx) => {
            const item = filteredItems[itemIdx];
            // Oblicz pozycję względem centerIndex
            const relativePos = (itemIdx - centerIndex + filteredItems.length) % filteredItems.length;
            let position;
            
            if (filteredItems.length === 1) {
              position = "center";
            } else if (relativePos === 0) {
              position = "center";
            } else if (relativePos === 1 || relativePos === filteredItems.length - 1) {
              position = "right";
            } else if (relativePos === 2 || relativePos === filteredItems.length - 2) {
              position = "far-right";
            } else if (relativePos === filteredItems.length - 1 || relativePos === 1) {
              position = "left";
            } else if (relativePos === filteredItems.length - 2 || relativePos === 2) {
              position = "far-left";
            } else {
              position = "center";
            }
            
            const positionClass = getPositionClass(position) + " transition-all duration-700 ease-out";
            
            if (!item) return null;
            if (renderItem) {
              return (
                <div 
                  key={`${itemIdx}-${position}`} 
                  className={positionClass}
                  onClick={() => handleCardClick(item)}
                  style={{ cursor: onItemClick ? 'pointer' : 'default' }}
                >
                  {renderItem(item, itemIdx, position)}
                </div>
              );
            }
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
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-black/70 text-red-500 p-3 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-red-500/25"
          onClick={handleNext}
          aria-label="Następny"
        >
          <ChevronRight size={32} />
        </button>
      </div>
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