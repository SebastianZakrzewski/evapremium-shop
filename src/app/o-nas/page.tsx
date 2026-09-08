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
        breadcrumb="O Nas"
        title="O NAS"
        highlight="EVAPREMIUM"
        description="EvaPremium to polska firma, która zajmuje się sprzedażą innowacyjnych dywaników samochodowych. Od 2018 roku pomagamy dobrać precyzyjnie spasowane komplety EVA — z dbałością o materiał, dopasowanie i wygląd wnętrza."
      />
      <AboutUsSection />
    </>
  );
}
