import type { Metadata } from "next"
import { Suspense } from "react"
import ConfiguratorV2 from "@/components/configurator/configurator-v2/ConfiguratorV2"
import { ConfiguratorLoader } from "@/components/configurator/configurator-simple/ConfiguratorLoader"

export const metadata: Metadata = {
  title: "Konfigurator V2 (beta) | EvaPremium",
  description:
    "Nowy konfigurator dywaników EVA — layout inspirowany UX Tesli, pełna logika biznesowa EvaPremium.",
  robots: { index: false, follow: false },
}

export default function Page() {
  return (
    <Suspense fallback={<ConfiguratorLoader />}>
      <ConfiguratorV2 />
    </Suspense>
  )
}
