import React from "react";
import Image from "next/image";
import { Model } from "../../types/carousel";

interface ModelCardProps {
  model: Model;
  className?: string;
}

export const ModelCard: React.FC<ModelCardProps> = ({ model, className = "" }) => {
  return (
    <div
      className={`w-44 h-72 md:w-56 md:h-96 aspect-[9/16] flex flex-col items-center justify-center rounded-2xl shadow-lg overflow-hidden relative cursor-pointer ${className}`}
    >
      {/* Zdjęcie modelu z wysoką jakością */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={model.imageSrc}
          alt={`${model.brand} ${model.name}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 176px 288px, 224px 384px"
          priority={true}
          quality={95}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        />
        {/* Overlay dla lepszej czytelności tekstu */}
        <div className="absolute inset-0 bg-black/30" />
      </div>
      
      {/* Zawartość tekstowa */}
      <div className="relative z-10 text-center px-3 flex flex-col justify-center items-center h-full">
        {/* Nazwa modelu */}
        <h3 className="text-white text-xl font-bold mb-2 drop-shadow-lg">
          {model.name}
        </h3>
        
        {/* Marka i rok */}
        <p className="text-white/90 text-sm mb-2 drop-shadow-lg">
          {model.brand} • {model.year}
        </p>
        
        {/* Cena */}
        {model.price && (
          <p className="text-[#ff0033] font-semibold text-lg drop-shadow-lg">
            {model.price}
          </p>
        )}
        
        {/* Opis */}
        {model.description && (
          <p className="text-white/80 text-xs mt-2 drop-shadow-lg line-clamp-2">
            {model.description}
          </p>
        )}
      </div>
      
      {/* Efekt hover */}
      <div className="absolute inset-0 bg-[#ff0033]/0 hover:bg-[#ff0033]/20 transition-colors duration-300" />
    </div>
  );
};

export default ModelCard; 