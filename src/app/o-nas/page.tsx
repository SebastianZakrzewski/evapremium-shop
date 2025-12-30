import React from 'react';
import { Metadata } from 'next';
import AboutUsSection from '@/components/marketing/about-us-section';
import PageHeroBanner from '@/components/page-hero-banner';

export const metadata: Metadata = {
  title: 'O Nas - EvaPremium | Najwyższej Jakości Dywaniki Samochodowe EVA',
  description: 'Poznaj historię EvaPremium - polskiego producenta dywaników samochodowych EVA. Najwyższa jakość, innowacyjne rozwiązania i zadowoleni klienci od 2010 roku.',
  keywords: 'o nas, evapremium, historia firmy, dywaniki eva, producent, polska firma, jakość',
  openGraph: {
    title: 'O Nas - EvaPremium',
    description: 'Poznaj historię EvaPremium - polskiego producenta dywaników samochodowych EVA.',
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
        description="EvaPremium to polski producent innowacyjnych dywaników samochodowych. Łączymy technologię z rzemieślniczą precyzją, dostarczając produkty najwyższej jakości od 2010 roku."
      />
      <AboutUsSection />
    </>
  );
}
