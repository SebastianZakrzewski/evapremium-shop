"use client";

import Image from "next/image";
import HeroSection from "@/components/hero-section";
import AdvantagesSection from "@/components/advantages-section";
import WhyUsSection from "@/components/why-us-section";
import ProductSelection from "@/components/product-selection";

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <AdvantagesSection />
      <WhyUsSection />
      <ProductSelection />
    </div>
  );
} 