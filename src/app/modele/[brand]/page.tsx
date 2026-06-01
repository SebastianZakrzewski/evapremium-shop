"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { brandNameToNavigationSlug, parseBrandFromUrl } from "@/shared/brands/brandParam";

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
      const brandSlug = brandNameToNavigationSlug(parseBrandFromUrl(resolvedParams.brand));
      router.replace(`/modele?brand=${encodeURIComponent(brandSlug)}`);
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

  return null;
}
