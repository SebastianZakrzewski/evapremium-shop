"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Brand } from "../../types/carousel";
import { Car } from "lucide-react";

interface BrandGridCardProps {
  brand: Brand;
  onClick?: (brand: Brand) => void;
  className?: string;
  isClicked?: boolean;
  isPriority?: boolean;
}

export const BrandGridCard: React.FC<BrandGridCardProps> = React.memo(({ 
  brand, 
  onClick, 
  className = "",
  isClicked = false,
  isPriority = false
}) => {
  const router = useRouter();
  
  const handleClick = () => {
    if (onClick) {
      onClick(brand);
    } else {
      // Default behavior - redirect to models page with selected brand
      router.push(`/modele/${encodeURIComponent(brand.name.toLowerCase())}`);
    }
  };

  // Sprawdź czy to jest zdjęcie czy logo SVG
  const isImage = brand.logo.includes('.jpg') || 
                  brand.logo.includes('.png') || 
                  brand.logo.includes('.jpeg') || 
                  brand.logo.includes('.avif') || 
                  brand.logo.includes('.webp');
  
  // Sprawdź czy to zdjęcie marki z katalogu /modele/
  const isBrandImage = brand.logo.includes('/modele/');

  return (
    <div
      onClick={handleClick}
      className={`
        group relative aspect-square w-full
        bg-gradient-to-br from-gray-900/90 via-gray-800/80 to-gray-900/90
        backdrop-blur-xl
        border border-gray-700/50
        rounded-xl sm:rounded-2xl
        overflow-hidden
        cursor-pointer
        transition-all duration-500 ease-out
        transform-gpu
        ${isClicked ? 'scale-95' : 'scale-100'}
        hover:scale-105
        hover:border-red-500/70
        hover:shadow-2xl hover:shadow-red-500/30
        focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-black
        ${className}
      `}
      style={{
        transform: isClicked ? 'scale(0.95)' : undefined,
        transformStyle: 'preserve-3d',
      }}
      role="button"
      tabIndex={0}
      aria-label={`Wybierz markę ${brand.name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Gradient border glow przy hover */}
      <div className="absolute inset-0 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-red-500/50 via-red-600/50 to-red-500/50 blur-sm" />
      </div>

      {/* Overlay przy hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

      {/* Zdjęcie/Logo marki */}
      <div className="relative w-full h-full flex items-center justify-center p-3 sm:p-4 md:p-6 z-20">
        {isImage ? (
          <Image
            src={brand.logo}
            alt={`${brand.name} logo`}
            fill
            className={`
              transition-all duration-500
              ${isBrandImage ? 'object-cover object-center' : 'object-contain'}
              group-hover:scale-110
              drop-shadow-[0_0_20px_rgba(220,38,38,0.3)]
            `}
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            quality={100}
            loading={isPriority ? "eager" : "lazy"}
            placeholder="blur"
            priority={isPriority}
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
        ) : (
          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-32 md:h-32 lg:w-40 lg:h-40 flex items-center justify-center">
            <Image
              src={brand.logo}
              alt={`${brand.name} logo`}
              width={160}
              height={160}
              className="object-contain transition-all duration-500 group-hover:scale-110 drop-shadow-[0_0_20px_rgba(220,38,38,0.3)] w-full h-full"
              quality={100}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      {/* Nazwa marki na dole */}
      <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 md:p-4 bg-gradient-to-t from-black/80 via-black/60 to-transparent z-30">
        <h3 className="text-white font-bold text-sm sm:text-base md:text-lg lg:text-xl text-center drop-shadow-2xl">
          {brand.name}
        </h3>
        {brand.description && (
          <p className="text-gray-300 text-[10px] sm:text-xs md:text-sm text-center mt-0.5 sm:mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {brand.description}
          </p>
        )}
      </div>

      {/* Indikator wyboru przy hover */}
      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-40">
        <Car className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-white" />
      </div>

      {/* 3D transform effect przy hover */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          transform: 'perspective(1000px) rotateX(2deg) rotateY(-2deg)',
          transformStyle: 'preserve-3d',
        }}
      />
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.brand.id === nextProps.brand.id && 
         prevProps.isClicked === nextProps.isClicked &&
         prevProps.isPriority === nextProps.isPriority &&
         prevProps.className === nextProps.className;
});

BrandGridCard.displayName = 'BrandGridCard';

export default BrandGridCard;

