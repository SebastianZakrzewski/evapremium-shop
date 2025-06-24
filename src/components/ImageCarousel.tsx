"use client";
import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageCarouselProps {
  images: string[];
  className?: string;
}

export default function ImageCarousel({ images, className = "" }: ImageCarouselProps) {
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  return (
    <div className={`relative bg-black py-16 ${className}`}>
      <Swiper
        effect={'coverflow'}
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={'auto'}
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: false,
        }}
        navigation={{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }}
        modules={[EffectCoverflow, Navigation]}
        className="w-full"
      >
        {images.map((color, index) => (
          <SwiperSlide key={index} className="w-80 h-96 md:w-96 md:h-[28rem]">
            <div 
              className="relative w-full h-full rounded-lg overflow-hidden flex items-center justify-center text-white text-2xl font-bold"
              style={{ backgroundColor: `#${color}` }}
            >
              <span>Produkt {index + 1}</span>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Buttons */}
      <button className="swiper-button-prev absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-[#ff0033] p-3 rounded-full transition-colors">
        <ChevronLeft size={24} />
      </button>
      
      <button className="swiper-button-next absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-[#ff0033] p-3 rounded-full transition-colors">
        <ChevronRight size={24} />
      </button>
    </div>
  );
} 