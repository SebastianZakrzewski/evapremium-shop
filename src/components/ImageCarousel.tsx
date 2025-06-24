"use client";
import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

const images = [
  "/images/slide1.jpg",
  "/images/slide2.jpg",
  "/images/slide3.jpg",
  "/images/slide4.jpg",
  "/images/slide5.jpg"
];

export default function ImageCarousel() {
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="w-full bg-black py-12 flex justify-center items-center">
      <div className="relative w-full max-w-4xl">
        {/* Nawigacja */}
        <button
          ref={prevRef}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 rounded-full p-2 text-[#ff0033]"
        >
          <ChevronLeft size={36} />
        </button>
        <button
          ref={nextRef}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 rounded-full p-2 text-[#ff0033]"
        >
          <ChevronRight size={36} />
        </button>
        <Swiper
          modules={[EffectCoverflow, Navigation]}
          effect="coverflow"
          grabCursor
          centeredSlides
          slidesPerView={"auto"}
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 120,
            modifier: 2.5,
            slideShadows: false
          }}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current
          }}
          onInit={(swiper) => {
            // @ts-ignore
            swiper.params.navigation.prevEl = prevRef.current;
            // @ts-ignore
            swiper.params.navigation.nextEl = nextRef.current;
            swiper.navigation.init();
            swiper.navigation.update();
          }}
          className="w-full h-[420px] md:h-[520px]"
        >
          {images.map((src, idx) => (
            <SwiperSlide
              key={idx}
              className="flex justify-center items-center w-[220px] h-[360px] md:w-[320px] md:h-[480px] rounded-xl overflow-hidden shadow-lg bg-black"
            >
              <img
                src={src}
                alt={`slide-${idx}`}
                className="w-full h-full object-cover select-none pointer-events-none"
                draggable={false}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
} 