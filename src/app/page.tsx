"use client";

import Image from "next/image";
import HeroSection from "@/components/hero-section";
import AdvantagesSection from "@/components/advantages-section";
import ThreeDMatsSection from "@/components/3d-mats-section";
import WhyUsSection from "@/components/why-us-section";
import ProductGallerySection from "@/components/product-gallery-section";
import ProductSelection from "@/components/product-selection";

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <AdvantagesSection />
      <ThreeDMatsSection />
      <ProductGallerySection />
      <WhyUsSection />
      <ProductSelection />
    </div>
  );
} 