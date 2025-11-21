import React from 'react';
import { Metadata } from 'next';
import BrandSelectionGrid from '@/components/brand-selection-grid';
import PageHeroBanner from '@/components/page-hero-banner';

export const metadata: Metadata = {
  title: 'Dywaniki Samochodowe - EvaPremium | Wybierz Markę',
  description: 'Wybierz markę swojego samochodu i znajdź precyzyjnie dopasowane dywaniki samochodowe EVA Premium. Dostępne marki: BMW, Mercedes, Audi, Tesla, Porsche i więcej.',
  keywords: 'dywaniki samochodowe, wybór marki, BMW, Mercedes, Audi, Tesla, Porsche, dywaniki EVA',
  openGraph: {
    title: 'Dywaniki Samochodowe - Wybierz Markę',
    description: 'Wybierz markę swojego samochodu i znajdź precyzyjnie dopasowane dywaniki samochodowe EVA Premium.',
    type: 'website',
  },
};

export default function DywanikiPage() {
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

