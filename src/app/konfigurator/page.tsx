import type { Metadata } from "next"
import dynamic from "next/dynamic"
import { Suspense } from "react"
import { ConfiguratorLoader } from "@/components/configurator/configurator-simple/ConfiguratorLoader"
import { resolveConfiguratorEntryImageSrc } from "@/features/car-configurator/utils/resolveConfiguratorEntryImageSrc"

const ConfiguratorV2 = dynamic(
  () => import("@/components/configurator/configurator-v2/ConfiguratorV2"),
  {
    loading: () => <ConfiguratorLoader />,
  },
)

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
}

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const firstQueryValue = (
  value: string | string[] | undefined,
): string | undefined => (Array.isArray(value) ? value[0] : value)

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams
  const entryImageSrc = resolveConfiguratorEntryImageSrc(
    firstQueryValue(params.brand),
    firstQueryValue(params.previewImage),
  )

  return (
    <>
      {entryImageSrc ? (
        <link
          rel="preload"
          as="image"
          href={entryImageSrc}
          fetchPriority="high"
        />
      ) : null}
      <Suspense fallback={<ConfiguratorLoader entryImageSrc={entryImageSrc} />}>
        <ConfiguratorV2 />
      </Suspense>
    </>
  )
}
