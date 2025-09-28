"use client";

import { Suspense } from "react";
import AccessoriesSection from "@/components/accessories-section";

export default function AkcesoriaPage() {
  return (
    <div className="min-h-screen bg-black">
      <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><div className="text-white text-xl">Ładowanie akcesoriów...</div></div>}>
        <AccessoriesSection />
      </Suspense>
    </div>
  );
}
