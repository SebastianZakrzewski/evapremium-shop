import React from "react";
import Image from "next/image";
import { Brand } from "../../types/carousel";

interface BrandCardProps {
  brand: Brand;
  className?: string;
}

export const BrandCard: React.FC<BrandCardProps> = ({ brand, className = "" }) => {
  // Sprawdź czy to jest zdjęcie czy logo SVG
  const isImage = brand.logo.includes('.jpg') || brand.logo.includes('.png') || brand.logo.includes('.jpeg');
  
  return (
    <div
      className={`w-44 h-72 md:w-56 md:h-96 aspect-[9/16] flex flex-col items-center justify-center rounded-2xl shadow-lg overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 transition-all duration-300 cursor-pointer relative ${className}`}
    >
      {/* Zdjęcie/Logo marki */}
      <div className="w-full h-full relative">
        {isImage ? (
          // Dla zdjęć - pełne tło z wysoką jakością
          <Image
            src={brand.logo}
            alt={`${brand.name}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 176px 288px, 224px 384px"
            priority={true}
            quality={95}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
        ) : (
          // Dla logo SVG - w centrum
          <div className="w-24 h-24 mb-6 flex items-center justify-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Image
              src={brand.logo}
              alt={`${brand.name} logo`}
              width={96}
              height={96}
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
        <div className="absolute inset-0 bg-black/20" />
      </div>
      
      {/* Zawartość tekstowa */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        {/* Nazwa marki */}
        <h3 className="text-white text-2xl font-bold text-center mb-2 drop-shadow-lg">
          {brand.name}
        </h3>
        
        {/* Opis marki */}
        {brand.description && (
          <p className="text-white/90 text-sm text-center px-4 drop-shadow-lg">
            {brand.description}
          </p>
        )}
      </div>
      
      {/* Efekt hover */}
      <div className="absolute inset-0 bg-[#ff0033]/0 hover:bg-[#ff0033]/10 transition-colors duration-300 z-20" />
    </div>
  );
};

export default BrandCard; 