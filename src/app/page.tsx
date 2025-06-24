import Image from "next/image";
import HeroSection from "@/components/hero-section";
import ProductSelection from "@/components/product-selection";

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <ProductSelection />
    </div>
  );
}
