"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CarModelsSection from "@/components/car-models-section";

export default function BrandProductsPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    const redirectToQueryParam = async () => {
      const resolvedParams = await params;
      const brandName = resolvedParams.brand;
      // Przekieruj do /dywaniki?brand=... żeby użyć CarModelsSection z query parameter
      router.replace(`/dywaniki?brand=${encodeURIComponent(brandName)}`);
      setIsRedirecting(false);
    };
    redirectToQueryParam();
  }, [params, router]);

  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Przekierowywanie...</div>
      </div>
    );
  }

  return <CarModelsSection />;
}

