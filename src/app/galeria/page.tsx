"use client";

import GallerySection from '@/components/gallery-section';
import PageHeroBanner from '@/components/page-hero-banner';

export default function GaleriaPage() {
  return (
    <div className="min-h-screen bg-black">
      <PageHeroBanner
        breadcrumb="Galeria"
        kicker="Kolekcja"
        title="Galeria"
        description="Zdjęcia dywaników EVA Premium. Kolory, faktura i dopasowanie w prawdziwych autach."
        meta="30 zdjęć"
      />
      <GallerySection />
    </div>
  );
}

