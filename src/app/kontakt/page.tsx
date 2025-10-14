import React from 'react';
import { Metadata } from 'next';
import ContactSection from '@/components/contact-section';

export const metadata: Metadata = {
  title: 'Kontakt - EvaPremium | Skontaktuj się z nami',
  description: 'Skontaktuj się z EvaPremium - polskim producentem dywaników samochodowych EVA. Telefon, email, formularz kontaktowy. Jesteśmy do Twojej dyspozycji!',
  keywords: 'kontakt, evapremium, dywaniki eva, formularz kontaktowy, telefon, email, adres',
  openGraph: {
    title: 'Kontakt - EvaPremium',
    description: 'Skontaktuj się z EvaPremium - polskim producentem dywaników samochodowych EVA.',
    type: 'website',
  },
};

export default function ContactPage() {
  return <ContactSection />;
}
