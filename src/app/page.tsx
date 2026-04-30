"use client";

import { HeroSection, AdvantagesSection } from "@/features/marketing";
import QuickSearchBar from "@/components/quick-search-bar";
import ThreeDMatsSection from "@/components/3d-mats-section";
import { ProductGallerySection, ProductSelection } from "@/features/products";
import CustomFitSection from "@/components/custom-fit-section";
import RoznorodnaKolorystykaSection from "@/components/roznorodna-kolorystyka-section";
import GlebokaStrukturaKomorekSection from "@/components/gleboka-struktura-komorek-section";
import CustomerReviews from "@/components/CustomerReviews";
import FAQSection from "@/components/FAQSection";

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <QuickSearchBar />
      <ProductGallerySection />
      <AdvantagesSection />
      <ProductSelection />
      <ThreeDMatsSection />
      <CustomFitSection />
      <RoznorodnaKolorystykaSection />
      <GlebokaStrukturaKomorekSection />
      <CustomerReviews />
      <FAQSection />
    </div>
  );
} 
