import React from 'react';
import { Metadata } from 'next';
import { AboutUsSection } from '@/features/marketing';
import PageHeroBanner from '@/components/page-hero-banner';

export const metadata: Metadata = {
  title: 'O Nas - EvaPremium | Najwyższej Jakości Dywaniki Samochodowe EVA',
  description: 'Poznaj EvaPremium — polską firmę, która zajmuje się sprzedażą innowacyjnych dywaników samochodowych EVA. Precyzyjne dopasowanie, nowoczesne materiały i obsługa od 2018 roku.',
  keywords: 'o nas, evapremium, historia firmy, dywaniki eva, polska firma, sprzedaż dywaników, jakość',
  openGraph: {
    title: 'O Nas - EvaPremium',
    description: 'Poznaj EvaPremium — polską firmę, która zajmuje się sprzedażą innowacyjnych dywaników samochodowych EVA.',
    type: 'website',
  },
};

export default function AboutUsPage() {
  return (
    <>
      <PageHeroBanner
        breadcrumb="O nas"
        kicker="Firma"
        title="O nas"
        description="Polska firma, która od 2018 roku dobiera dywaniki EVA do konkretnego auta."
      />
      <AboutUsSection />
    </>
  );
}
