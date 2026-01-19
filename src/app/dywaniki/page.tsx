"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import BrandSelectionGrid from '@/components/brands/brand-selection-grid';
import PageHeroBanner from '@/components/page-hero-banner';
import CarModelsSection from '@/components/car-models-section';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

function DywanikiPageContent() {
  const searchParams = useSearchParams();
  const brandParam = searchParams.get('brand');

  // Jeśli jest parametr brand, pokaż CarModelsSection
  if (brandParam) {
    return <CarModelsSection />;
  }

  // W przeciwnym razie pokaż wybór marki
  return (
    <>
      <PageHeroBanner
        breadcrumb="Dywaniki Samochodowe"
        title="DYWANIKI SAMOCHODOWE"
        highlight="PREMIUM"
        description="Wybierz markę swojego samochodu i znajdź precyzyjnie dopasowane dywaniki samochodowe EVA Premium. Najwyższa jakość materiałów, precyzyjne dopasowanie i trwałość na lata."
      />
      <BrandSelectionGrid />
    </>
  );
}

export default function DywanikiPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-white text-xl">Ładowanie...</div>
      </div>
    }>
      <DywanikiPageContent />
    </Suspense>
  );
}
