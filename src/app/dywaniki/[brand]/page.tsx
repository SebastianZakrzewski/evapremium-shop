"use client";

import { Suspense } from "react";
import ProductSelectionSection from "@/components/product-selection-section";

export default function BrandProductsPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  return (
    <div className="min-h-screen bg-neutral-950">
      <Suspense
        fallback={
          <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
            <div className="text-white text-xl">Ładowanie produktów...</div>
          </div>
        }
      >
        <ProductSelectionSection params={params} />
      </Suspense>
    </div>
  );
}

