"use client";

import { useEffect, useState } from "react";
import BrandProductsSection from "@/components/brand-products-section";

export default function BrandProductsPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const [brand, setBrand] = useState<string>("");

  // Pobierz brand z params
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setBrand(resolvedParams.brand);
    };
    getParams();
  }, [params]);

  if (!brand) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-white text-xl">Ładowanie produktów...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <BrandProductsSection brandSlug={brand} />
    </div>
  );
}

