"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface BrandPageProps {
  params: Promise<{
    brand: string;
  }>;
}

export default function BrandPage({ params }: BrandPageProps) {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    const redirectToQueryParam = async () => {
      const resolvedParams = await params;
      const brandName = resolvedParams.brand;
      // Przekieruj do /modele?brand=... żeby użyć CarModelsSection z query parameter
      router.replace(`/modele?brand=${encodeURIComponent(brandName)}`);
      setIsRedirecting(false);
    };
    redirectToQueryParam();
  }, [params, router]);

  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-white text-xl">Przekierowywanie...</div>
      </div>
    );
  }

  return null;
}
