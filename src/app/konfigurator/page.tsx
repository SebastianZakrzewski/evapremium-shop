import type { Metadata } from "next";
import { Suspense } from "react";
import ConfiguratorV2 from "@/components/configurator/configurator-v2/ConfiguratorV2";
import { ConfiguratorLoader } from "@/components/configurator/configurator-simple/ConfiguratorLoader";

export const metadata: Metadata = {
  title: "Konfigurator Dywaników | EvaPremium",
  description:
    "Skonfiguruj dywaniki samochodowe EVA Premium: typ, wariant, kolor, obszycie i dodatki.",
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
    <Suspense fallback={<ConfiguratorLoader />}>
      <ConfiguratorV2 />
    </Suspense>
  );
}


