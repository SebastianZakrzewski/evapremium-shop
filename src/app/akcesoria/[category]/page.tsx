"use client";

import { Suspense } from "react";
import AccessoriesSection from "@/components/accessories-section";

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export default function CategoryPage({ params }: CategoryPageProps) {
  return (
    <div className="min-h-screen bg-black">
      <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><div className="text-white text-xl">Ładowanie akcesoriów...</div></div>}>
        <AccessoriesSection />
      </Suspense>
    </div>
  );
}
