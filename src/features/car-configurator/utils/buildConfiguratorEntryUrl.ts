import { brandNameToNavigationSlug } from "@/shared/brands"

export type ConfiguratorEntryParams = {
  brand: string
  model?: string
  generation?: string | null
  bodyType?: string | null
}

/**
 * Buduje URL wejścia do konfiguratora.
 * Rok produkcji NIE jest przekazywany — klient wybiera go w kroku 1 z listy roczników.
 */
export const buildConfiguratorEntryUrl = ({
  brand,
  model,
  generation,
  bodyType,
}: ConfiguratorEntryParams): string => {
  const params = new URLSearchParams()
  const brandSlug = brandNameToNavigationSlug(brand) || brand.toLowerCase().trim()
  params.set("brand", brandSlug)

  if (model?.trim()) {
    params.set("model", model.trim())
  }
  if (generation?.trim()) {
    params.set("generation", generation.trim())
  }
  if (bodyType?.trim()) {
    params.set("bodyType", bodyType.trim())
  }

  return `/konfigurator?${params.toString()}`
}
