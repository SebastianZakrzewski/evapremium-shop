"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Brand } from "@/entities/car";
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
  const [imageError, setImageError] = useState(false);
  
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
        bg-white/5 backdrop-blur-md
        border border-white/10
        rounded-3xl
        overflow-hidden
        cursor-pointer
        transition-all duration-500 ease-out
        transform-gpu
        ${isClicked ? 'scale-95' : 'scale-100'}
        hover:scale-105
        hover:border-red-500/30
        hover:shadow-2xl hover:shadow-red-900/20 hover:-translate-y-1
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
      {/* Shine Effect */}
      <div className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
        <div className="absolute inset-0 transform -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* Overlay przy hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500 z-0" />

      {/* Zdjęcie/Logo marki */}
      <div className="relative w-full h-full flex items-center justify-center p-6 z-10">
        {imageError ? (
          <div className="w-full h-full flex items-center justify-center bg-white/5 rounded-2xl">
            <span className="text-4xl md:text-6xl font-bold text-white/20 select-none">
              {brand.name.charAt(0)}
            </span>
          </div>
        ) : isImage ? (
          <Image
            src={brand.logo}
            alt={`${brand.name} logo`}
            fill
            className={`
              transition-all duration-700
              ${isBrandImage ? 'object-cover object-center' : 'object-contain'}
              group-hover:scale-110
              brightness-100 group-hover:brightness-110
            `}
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            quality={90}
            loading={isPriority ? "eager" : "lazy"}
            placeholder={isBrandImage ? "empty" : "blur"}
            priority={isPriority}
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            unoptimized={isBrandImage}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center">
            <Image
              src={brand.logo}
              alt={`${brand.name} logo`}
              width={128}
              height={128}
              className="object-contain transition-all duration-700 group-hover:scale-110 w-full h-full brightness-100 group-hover:brightness-125"
              quality={100}
              unoptimized={isBrandImage}
              onError={() => setImageError(true)}
            />
          </div>
        )}
      </div>

      {/* Nazwa marki na dole */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
        <h3 className="text-white font-bold text-lg text-center drop-shadow-md transform transition-transform duration-300 group-hover:-translate-y-1">
          {brand.name}
        </h3>
        {brand.description && (
          <p className="text-white text-xs text-center mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
            {brand.description}
          </p>
        )}
      </div>

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
