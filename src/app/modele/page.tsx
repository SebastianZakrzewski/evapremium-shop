"use client";

import { Suspense } from "react";
import CarModelsSection from "@/components/car-models-section";
// import Footer from "@/components/footer";

export default function ModelePage() {
  return (
    <div className="min-h-screen bg-neutral-950">
      <Suspense fallback={<div className="min-h-screen bg-neutral-950 flex items-center justify-center"><div className="text-white text-xl">Ładowanie modeli...</div></div>}>
        <CarModelsSection />
      </Suspense>
      {/* <Footer /> */}
    </div>
  );
} 