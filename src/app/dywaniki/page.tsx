"use client";

import { useSearchParams } from "next/navigation";
import BrandSelectionGrid from '@/components/brands/brand-selection-grid';
import PageHeroBanner from '@/components/page-hero-banner';
import CarModelsSection from '@/components/car-models-section';

export default function DywanikiPage() {
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

