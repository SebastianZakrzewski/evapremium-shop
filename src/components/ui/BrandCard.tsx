import React from "react";
import Image from "next/image";
import { Brand } from "../../types/carousel";
import { Car } from "lucide-react";

interface BrandCardProps {
  brand: Brand;
  className?: string;
}

export const BrandCard: React.FC<BrandCardProps> = ({ brand, className = "" }) => {
  // Sprawdź czy to jest zdjęcie czy logo SVG
  const isImage = brand.logo.includes('.jpg') || brand.logo.includes('.png') || brand.logo.includes('.jpeg') || brand.logo.includes('.avif') || brand.logo.includes('.webp');
  
  // Sprawdź czy to zdjęcie marki z katalogu /modele/
  const isBrandImage = brand.logo.includes('/modele/');
  
  return (
    <div
      className={`w-56 h-80 md:w-72 md:h-112 aspect-[9/16] flex flex-col items-center justify-center rounded-2xl shadow-lg overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 transition-all duration-300 cursor-pointer relative group ${className}`}
    >
              {/* Zdjęcie/Logo marki */}
        <div className="w-full h-full relative">
          {isImage ? (
            // Dla zdjęć - pełne tło z wysoką jakością
            <Image
              src={brand.logo}
              alt={`${brand.name}`}
              fill
              className={`group-hover:scale-105 transition-transform duration-300 ${
                isBrandImage ? 'object-cover' : 'object-contain'
              }`}
              sizes="(max-width: 768px) 224px 320px, 288px 448px"
              priority={true}
              quality={95}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            />
          ) : (
            // Dla logo SVG - w centrum
            <div className="w-32 h-32 mb-8 flex items-center justify-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Image
                src={brand.logo}
                alt={`${brand.name} logo`}
                width={128}
                height={128}
                className="object-contain"
                quality={95}
                onError={(e) => {
                  // Fallback jeśli logo nie istnieje
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          )}
          
          {/* Overlay dla lepszej czytelności tekstu */}
          <div className={`absolute inset-0 transition-colors duration-300 ${
            isBrandImage 
              ? 'bg-black/40 group-hover:bg-black/30' 
              : 'bg-black/20 group-hover:bg-black/10'
          }`} />
        </div>
      
      {/* Zawartość tekstowa */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        {/* Nazwa marki */}
        <h3 className={`text-center mb-3 font-bold ${
          isBrandImage 
            ? 'text-white text-4xl drop-shadow-2xl' 
            : 'text-white text-3xl drop-shadow-lg'
        }`}>
          {brand.name}
        </h3>
        
        {/* Opis marki */}
        {brand.description && (
          <p className={`text-center px-6 ${
            isBrandImage 
              ? 'text-white text-lg drop-shadow-2xl' 
              : 'text-white/90 text-base drop-shadow-lg'
          }`}>
            {brand.description}
          </p>
        )}
      </div>
      
      {/* Efekt hover */}
      <div className="absolute inset-0 bg-[#ff0033]/0 group-hover:bg-[#ff0033]/10 transition-colors duration-300 z-20" />
      
      {/* Indikator wyboru */}
      <div className="absolute top-4 right-4 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
        <Car className="w-4 h-4 text-white" />
      </div>
    </div>
  );
};

export default BrandCard; 