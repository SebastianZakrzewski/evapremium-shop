"use client";

import ProductSelectionSection from "@/components/product-selection-section";

interface BrandPageProps {
  params: Promise<{
    brand: string;
  }>;
}

export default function BrandPage({ params }: BrandPageProps) {
  return (
    <div className="min-h-screen bg-neutral-950">
      <ProductSelectionSection params={params} />
    </div>
  );
}
