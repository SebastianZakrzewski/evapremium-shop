"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import BrandSelectionGrid from '@/components/brands/brand-selection-grid';
import PageHeroBanner from '@/components/page-hero-banner';
import CarModelsSection from '@/components/car-models-section';

// Disable static generation for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function DywanikiPageContent() {
  const searchParams = useSearchParams();
  const brandParam = searchParams.get('brand');

  // JeÅ›li jest parametr brand, pokaÅ¼ CarModelsSection
  if (brandParam) {
    return <CarModelsSection />;
  }

  // W przeciwnym razie pokaÅ¼ wybÃ³r marki
  return (
    <>
      <PageHeroBanner
        breadcrumb="Dywaniki Samochodowe"
        title="DYWANIKI SAMOCHODOWE"
        highlight="PREMIUM"
        description="Wybierz markÄ™ swojego samochodu i znajdÅº precyzyjnie dopasowane dywaniki samochodowe EVA Premium. NajwyÅ¼sza jakoÅ›Ä‡ materiaÅ‚Ã³w, precyzyjne dopasowanie i trwaÅ‚oÅ›Ä‡ na lata."
      />
      <BrandSelectionGrid />
    </>
  );
}

export default function DywanikiPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-white text-xl">Åadowanie...</div>
      </div>
    }>
      <DywanikiPageContent />
    </Suspense>
  );
}
