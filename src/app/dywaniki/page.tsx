"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import BrandSelectionGrid from '@/components/brands/brand-selection-grid';
import CarModelsSection from '@/components/car-models-section';

export const dynamic = 'force-dynamic';

function DywanikiPageContent() {
  const searchParams = useSearchParams();
  const brandParam = searchParams.get('brand');

  if (brandParam) {
    return <CarModelsSection />;
  }

  return <BrandSelectionGrid />;
}

export default function DywanikiPage() {
  return (
    <div className="min-h-screen bg-black">
      <Suspense fallback={
        <div className="flex min-h-screen items-center justify-center bg-black">
          <div className="text-xl text-white">Ładowanie...</div>
        </div>
      }>
        <DywanikiPageContent />
      </Suspense>
    </div>
  );
}
