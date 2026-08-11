import dynamic from "next/dynamic"
import { HeroSection } from "@/features/marketing"
import QuickSearchBar from "@/components/quick-search-bar"
import { ProductGallerySection, ProductSelection } from "@/features/products"

const ProductVideoCarouselSection = dynamic(
  () => import("@/features/products/components/ProductVideoCarouselSection"),
  {
    loading: () => (
      <section
        className="w-full bg-black py-10 md:py-14"
        aria-label="Ładowanie sekcji Premium w akcji"
      />
    ),
  },
)

const InteractiveFeaturesSection = dynamic(
  () => import("@/components/interactive-features-section"),
)

const MatComparisonSection = dynamic(
  () => import("@/components/mat-comparison-section"),
)

const CustomFitSection = dynamic(() => import("@/components/custom-fit-section"))

const RoznorodnaKolorystykaSection = dynamic(
  () => import("@/components/roznorodna-kolorystyka-section"),
)

const GlebokaStrukturaKomorekSection = dynamic(
  () => import("@/components/gleboka-struktura-komorek-section"),
)

const CustomerReviews = dynamic(() => import("@/components/CustomerReviews"))

const FAQSection = dynamic(() => import("@/components/FAQSection"))

export default function Home() {
  return (
    <div className="min-h-screen home-page">
      <HeroSection />
      <QuickSearchBar />
      <ProductGallerySection />
      <ProductVideoCarouselSection />
      <InteractiveFeaturesSection />
      <MatComparisonSection />
      <ProductSelection />
      <CustomFitSection />
      <RoznorodnaKolorystykaSection />
      <GlebokaStrukturaKomorekSection />
      <CustomerReviews />
      <FAQSection />
    </div>
  )
}
