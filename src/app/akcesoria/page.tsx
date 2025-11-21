"use client";

import { Suspense } from "react";
import AccessoriesSection from "@/components/accessories-section";

export default function AkcesoriaPage() {
  return (
    <div className="min-h-screen bg-neutral-950">
      <Suspense fallback={<div className="min-h-screen bg-neutral-950 flex items-center justify-center"><div className="text-white text-xl">Ładowanie akcesoriów...</div></div>}>
        <AccessoriesSection />
      </Suspense>
    </div>
  );
}
