import { HeroSection } from "@/features/marketing";
import QuickSearchBar from "@/components/quick-search-bar";
import { ProductGallerySection, ProductSelection } from "@/features/products";
import CustomFitSection from "@/components/custom-fit-section";
import InteractiveFeaturesSection from "@/components/interactive-features-section";
import RoznorodnaKolorystykaSection from "@/components/roznorodna-kolorystyka-section";
import GlebokaStrukturaKomorekSection from "@/components/gleboka-struktura-komorek-section";
import CustomerReviews from "@/components/CustomerReviews";
import FAQSection from "@/components/FAQSection";
import MatComparisonSection from "@/components/mat-comparison-section";

export default function Home() {
  return (
    <div className="min-h-screen home-page">
      <HeroSection />
      <QuickSearchBar />
      <ProductGallerySection />
      <InteractiveFeaturesSection />
      <MatComparisonSection />
      <ProductSelection />
      <CustomFitSection />
      <RoznorodnaKolorystykaSection />
      <GlebokaStrukturaKomorekSection />
      {/* PopularProductsSection — tymczasowo ukryte */}
      <CustomerReviews />
      <FAQSection />
    </div>
  );
} 
