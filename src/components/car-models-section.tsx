"use client";

import Image from "next/image";
import { Model } from "../types/carousel";
import { getAllModels } from "../data/carouselData";

export default function CarModelsSection() {
  const allModels = getAllModels();

  return (
    <section className="py-8 md:py-12 bg-black">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            MODELE AUT
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            Wybierz model swojego auta i spersonalizuj dywaniki
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4">
          {allModels.map((model) => (
            <div
              key={model.id}
              className="flex items-center justify-center group cursor-pointer"
            >
              <div className="flex flex-col items-center text-center transition-all duration-300 transform hover:scale-105">
                {/* Car Model Window */}
                <div className="mb-4 bg-black rounded-xl p-4 w-40 h-40 md:w-56 md:h-56 lg:w-72 lg:h-72 flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl">
                  <div className="w-full h-full relative">
                    <Image
                      src={model.imageSrc}
                      alt={`${model.brand} ${model.name}`}
                      fill
                      className="object-cover rounded-lg transition-all duration-300 group-hover:scale-110"
                      sizes="(max-width: 768px) 160px 160px, (max-width: 1024px) 224px 224px, 288px 288px"
                      priority={true}
                      quality={95}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                    />
                    {/* Overlay for better text readability */}
                    <div className="absolute inset-0 bg-black/30 rounded-lg" />
                  </div>
                </div>
                
                {/* Car Model Info */}
                <div className="text-center">
                  <h3 className="text-lg md:text-xl font-semibold text-white transition-all duration-300 group-hover:text-red-400 mb-2">
                    {model.name}
                  </h3>
                  <p className="text-sm md:text-base text-gray-300 transition-all duration-300 group-hover:text-white mb-2">
                    {model.brand} • {model.year}
                  </p>
                  {model.price && (
                    <p className="text-red-400 font-semibold text-base md:text-lg transition-all duration-300 group-hover:text-red-300">
                      {model.price}
                    </p>
                  )}
                  {model.description && (
                    <p className="text-xs md:text-sm text-gray-400 mt-2 max-w-xs transition-all duration-300 group-hover:text-gray-300">
                      {model.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 