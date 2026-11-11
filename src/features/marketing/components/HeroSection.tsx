"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronDown } from "lucide-react"
import { useBrands } from "@/features/brands/hooks/useBrands"
import { buildConfiguratorEntryUrl } from "@/features/car-configurator/utils/buildConfiguratorEntryUrl"
import { useQuickSearchCatalog } from "@/features/vehicle-catalog/hooks/useQuickSearchCatalog"
import { enrichCarContextFromTemplates } from "@/features/vehicle-catalog/utils/enrichCarContextFromTemplates"
import {
  HERO_PROMO_IMAGE_ALT,
  HERO_PROMO_IMAGE_SRC,
  HERO_PROMO_NATIVE_HEIGHT,
  HERO_PROMO_NATIVE_WIDTH,
} from "@/features/marketing/lib/heroImage"
import { cn } from "@/lib/utils"
import { formatBrandDisplayName } from "@/shared/vehicle/displayLabels"

const HeroCopy = () => (
  <div className="max-w-xl">
    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-red-600">
      Dywaniki EVA
    </p>
    <h1 className="mt-4 text-[2.35rem] font-bold leading-[1.02] tracking-tight text-neutral-950 sm:text-5xl lg:text-[3.35rem]">
      Dywaniki
      <br />
      samochodowe
      <br />
      <span className="text-red-600">EVA Premium</span>
    </h1>
    <p className="mt-5 max-w-md text-sm leading-relaxed text-neutral-600 sm:text-base">
      Wodoodporne, łatwe w czyszczeniu i precyzyjnie dopasowane do Twojego auta.
    </p>
  </div>
)

const HeroVehicleSearch = () => {
  const router = useRouter()
  const [selectedBrand, setSelectedBrand] = useState("")
  const [selectedModelFamilyKey, setSelectedModelFamilyKey] = useState("")
  const { brands, isLoading: brandsLoading } = useBrands()

  const selectedBrandKey = brands.find((brand) => brand.name === selectedBrand)?.key ?? ""
  const { models, templates, isLoading: modelsLoading } = useQuickSearchCatalog(
    selectedBrandKey,
    selectedModelFamilyKey,
  )

  const handleBrandChange = (brandName: string) => {
    setSelectedBrand(brandName)
    setSelectedModelFamilyKey("")
  }

  const handleSearch = () => {
    if (!selectedBrand) {
      return
    }

    if (!selectedModelFamilyKey) {
      router.push(buildConfiguratorEntryUrl({ brand: selectedBrand }))
      return
    }

    const selectedModel = models.find((model) => model.key === selectedModelFamilyKey)
    const enrichment = enrichCarContextFromTemplates(templates)

    router.push(
      buildConfiguratorEntryUrl({
        brand: selectedBrand,
        model: selectedModel?.name ?? selectedModelFamilyKey,
        generation: enrichment.generation,
        bodyType: enrichment.bodyType,
      }),
    )
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    handleSearch()
  }

  const selectClassName =
    "w-full appearance-none rounded-lg border border-neutral-200 bg-white px-4 py-3 pr-10 text-sm outline-none transition-colors focus-visible:border-red-600 focus-visible:ring-2 focus-visible:ring-red-600/40 disabled:cursor-not-allowed disabled:opacity-60"

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl md:mt-8"
      data-testid="hero-vehicle-search"
      aria-label="Wyszukiwarka dywaników - wybierz markę i model samochodu"
    >
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <label className="block">
          <span className="mb-2 block text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-500">
            Marka
          </span>
          <span className="relative block">
            <select
              value={selectedBrand}
              onChange={(event) => handleBrandChange(event.target.value)}
              aria-label="Wybierz markę samochodu"
              disabled={brandsLoading}
              className={cn(selectClassName, selectedBrand ? "text-neutral-950" : "text-neutral-500")}
            >
              <option value="">Wybierz...</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.name}>
                  {formatBrandDisplayName(brand.name)}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500" aria-hidden="true" />
          </span>
        </label>

        <label className="block">
          <span className="mb-2 block text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-500">
            Model
          </span>
          <span className="relative block">
            <select
              value={selectedModelFamilyKey}
              onChange={(event) => setSelectedModelFamilyKey(event.target.value)}
              aria-label="Wybierz model samochodu"
              disabled={!selectedBrand || modelsLoading}
              className={cn(selectClassName, selectedModelFamilyKey ? "text-neutral-950" : "text-neutral-500")}
            >
              <option value="">
                {!selectedBrand ? "Wybierz markę..." : modelsLoading ? "Ładowanie..." : "Wybierz model..."}
              </option>
              {(selectedBrand ? models : []).map((model) => (
                <option key={model.key} value={model.key}>
                  {model.displayName ?? model.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500" aria-hidden="true" />
          </span>
        </label>
      </div>

      <button
        type="submit"
        className="mt-4 flex min-h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-red-600 to-red-700 px-6 text-base text-white transition-colors hover:from-red-500 hover:to-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FDFDFD]"
        aria-label="Szukaj dywaników dla wybranego samochodu"
      >
        Szukaj
      </button>

      <Link
        href="/dywaniki"
        className="mt-4 inline-flex text-sm text-neutral-500 underline underline-offset-4 transition-colors hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
      >
        Przeglądaj wszystkie marki
      </Link>
    </form>
  )
}

const HeroPromoImage = () => (
  <img
    src={HERO_PROMO_IMAGE_SRC}
    alt={HERO_PROMO_IMAGE_ALT}
    width={HERO_PROMO_NATIVE_WIDTH}
    height={HERO_PROMO_NATIVE_HEIGHT}
    data-testid="hero-promo-image"
    decoding="async"
    className="block h-auto w-full"
  />
)

export default function HeroSection() {
  return (
    <section
      className="bg-[#FDFDFD] text-neutral-950"
      role="region"
      aria-label="Sekcja promocyjna - dywaniki samochodowe"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 md:items-stretch">
        <div className="contents md:flex md:flex-col md:justify-center md:py-12 md:pl-[calc(1.5rem+3.8rem)] md:pr-6 lg:pl-[calc(max(2rem,(100vw-80rem)/2+2rem)+4.75rem)] lg:pr-8">
          <div className="order-3 px-5 pb-12 pt-8 md:order-none md:px-0 md:pb-0 md:pt-0">
            <HeroCopy />
          </div>
          <div className="order-1 px-5 pb-6 pt-6 md:order-none md:px-0 md:pb-0 md:pt-0">
            <HeroVehicleSearch />
          </div>
        </div>
        <div className="order-2 bg-[#FDFDFD] md:order-none md:flex md:items-center">
          <HeroPromoImage />
        </div>
      </div>
    </section>
  )
}
