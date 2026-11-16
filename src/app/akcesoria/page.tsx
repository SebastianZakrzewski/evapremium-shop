"use client";

import { Suspense } from "react";
import AccessoriesSection from "@/components/products/accessories/accessories-section";

export default function AkcesoriaPage() {
  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      <Suspense fallback={<div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center"><div className="text-white text-xl">Ładowanie akcesoriów...</div></div>}>
        <AccessoriesSection />
      </Suspense>
    </div>
  );
}
