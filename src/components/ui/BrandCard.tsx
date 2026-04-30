import React from "react";
import Image from "next/image";
import { Brand } from "@/entities/car";
import { ChevronRight } from "lucide-react";

interface BrandCardProps {
  brand: Brand;
  className?: string;
  isPriority?: boolean;
}

export const BrandCard: React.FC<BrandCardProps> = React.memo(({ brand, className = "", isPriority = false }) => {
  // Sprawdź czy to jest zdjęcie czy logo SVG
  const isImage = brand.logo.includes('.jpg') || brand.logo.includes('.png') || brand.logo.includes('.jpeg') || brand.logo.includes('.avif') || brand.logo.includes('.webp');
  
  // Sprawdź czy to zdjęcie marki z katalogu /modele/
  const isBrandImage = brand.logo.includes('/modele/');
  
  return (
    <div
      className={`
        group relative w-56 h-80 md:w-72 md:h-112 aspect-[9/16] 
        flex flex-col items-center justify-center 
        rounded-3xl overflow-hidden 
        bg-gradient-to-br from-gray-900 to-black 
        border border-white/10
        shadow-2xl shadow-black/50
        hover:shadow-red-900/20 hover:border-white/20
        transition-all duration-500 ease-out
        cursor-pointer 
        ${className}
      `}
    >
        {/* Zdjęcie/Logo marki */}
        <div className="w-full h-full relative overflow-hidden">
          {isImage ? (
            // Dla zdjęć - pełne tło z wysoką jakością
            <Image
              src={brand.logo}
              alt={`${brand.name}`}
              fill
              className={`
                transition-transform duration-700 ease-out will-change-transform
                group-hover:scale-110
                ${isBrandImage ? 'object-cover object-center' : 'object-contain p-8'}
                opacity-100 brightness-110 group-hover:brightness-125
              `}
              sizes="(max-width: 768px) 224px 320px, 288px 448px"
              priority={isPriority}
              quality={90}
              loading={isPriority ? "eager" : "lazy"}
            />
          ) : (
            // Dla logo SVG - w centrum
            <div className="w-32 h-32 mb-8 flex items-center justify-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Image
                src={brand.logo}
                alt={`${brand.name} logo`}
                width={128}
                height={128}
                className="object-contain transition-transform duration-500 group-hover:scale-110"
                quality={95}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          )}
          
          {/* Gradient Overlays - zmniejszona intensywność dla jaśniejszych zdjęć */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-50 transition-opacity duration-500 group-hover:opacity-60`} />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
        </div>
      
      {/* Shine Effect */}
      <div className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
        <div className="absolute inset-0 transform -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
      
      {/* Zawartość tekstowa */}
      <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 flex flex-col items-center justify-end z-20 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
        {/* Nazwa marki */}
        <h3 className={`
          text-center font-bold tracking-tight mb-2
          text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-300
          ${isBrandImage ? 'text-3xl md:text-4xl' : 'text-2xl md:text-3xl'}
          drop-shadow-lg
        `}>
          {brand.name}
        </h3>
        
        {/* Opis marki */}
        {brand.description && (
          <p className={`
            text-center text-sm md:text-base text-white mb-4
            max-w-[200px] line-clamp-2
            opacity-0 group-hover:opacity-100 transition-all duration-500 delay-75
            transform translate-y-4 group-hover:translate-y-0
          `}>
            {brand.description}
          </p>
        )}

        {/* CTA Indicator */}
        <div className="
          flex items-center gap-2 text-xs font-bold text-red-500 uppercase tracking-wider
          opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100
          transform translate-y-4 group-hover:translate-y-0
        ">
          Wybierz model <ChevronRight className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.brand.id === nextProps.brand.id && 
         prevProps.isPriority === nextProps.isPriority &&
         prevProps.className === nextProps.className;
});

export default BrandCard;
