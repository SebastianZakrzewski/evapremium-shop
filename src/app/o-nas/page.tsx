import React from 'react';
import { Metadata } from 'next';
import AboutUsSection from '@/components/about-us-section';

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
  return <AboutUsSection />;
}
