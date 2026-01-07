import type { Metadata } from "next";
import { Suspense } from "react";
import ConfiguratorSimple from "@/components/configurator/configurator-simple/ConfiguratorSimple";

export const metadata: Metadata = {
  title: "Nowy Konfigurator Dywaników | EvaPremium",
  description: "Nowy prosty konfigurator dywaników samochodowych EVA Premium - testowa wersja.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-white text-xl">Ładowanie konfiguratora...</div>
      </div>
    }>
      <ConfiguratorSimple />
    </Suspense>
  );
}

