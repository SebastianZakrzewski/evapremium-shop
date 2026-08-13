import { brandNameToNavigationSlug } from "@/shared/brands"

export type ConfiguratorEntryParams = {
  brand: string
  model?: string
  generation?: string | null
  bodyType?: string | null
  previewImage?: string | null
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
  previewImage,
}: ConfiguratorEntryParams): string => {
  const params = new URLSearchParams()
  const brandSlug = brandNameToNavigationSlug(brand) || brand.toLowerCase().trim()
  params.set("brand", brandSlug)

  if (model != null && model.length > 0) {
    params.set("model", model)
  }
  if (generation?.trim()) {
    params.set("generation", generation.trim())
  }
  if (bodyType?.trim()) {
    params.set("bodyType", bodyType.trim())
  }
  if (previewImage?.trim()) {
    params.set("previewImage", previewImage.trim())
  }

  return `/konfigurator?${params.toString()}`
}
