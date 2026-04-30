"use client";

import GallerySection from '@/components/gallery-section';
import PageHeroBanner from '@/components/page-hero-banner';

export default function GaleriaPage() {
  return (
    <div className="min-h-screen bg-black">
      <PageHeroBanner
        breadcrumb="Galeria"
        title="GALERIA"
        highlight="PRODUKTÓW"
        description="Odkryj naszą kolekcję najwyższej jakości dywaników samochodowych EVA Premium. Każdy produkt jest precyzyjnie dopasowany do Twojego auta i wykonany z najwyższej jakości materiałów."
      />
      <GallerySection />
    </div>
  );
}

