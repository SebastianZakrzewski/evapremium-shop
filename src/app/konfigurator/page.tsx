import type { Metadata } from "next";
import { Suspense } from "react";
import Configurator from "@/components/Configurator";

export const metadata: Metadata = {
  title: "Konfigurator Dywaników | EvaPremium",
  description: "Skonfiguruj swoje dywaniki samochodowe EVA Premium: kolor, obszycie, dodatki.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/konfigurator" },
  openGraph: {
    title: "Konfigurator Dywaników | EvaPremium",
    description: "Zaprojektuj dywaniki EVA dopasowane do Twojego auta.",
    url: "https://evapremium.pl/konfigurator",
    type: "website",
  },
};

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><div className="text-white text-xl">Ładowanie konfiguratora...</div></div>}>
      <Configurator />
    </Suspense>
  );
}


