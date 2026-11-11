"use client";

import { Suspense } from "react";
import CarModelsSection from "@/components/car-models-section";
// import Footer from "@/components/footer";

const brandGridClassName =
  "grid min-h-[70vh] grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5"

const BrandGridFallback = () => (
  <div className="bg-[#FDFDFD] py-8 md:py-12">
    <div className="container mx-auto px-4">
      <div className="mb-8 mt-8 h-28" aria-hidden="true" />
      <div className={brandGridClassName} aria-hidden="true">
        {Array.from({ length: 10 }, (_, index) => (
          <div key={index} className="aspect-square rounded-3xl bg-white/5" />
        ))}
      </div>
    </div>
  </div>
)

export default function ModelePage() {
  return (
    <div className="bg-[#FDFDFD]">
      <Suspense fallback={<BrandGridFallback />}>
        <CarModelsSection />
      </Suspense>
      {/* <Footer /> */}
    </div>
  );
} 
