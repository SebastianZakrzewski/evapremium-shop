import { unstable_cache } from "next/cache"
import {
  resolveBrandDisplayNameFromDbName,
  resolveBrandLogo,
} from "@/shared/brands"
import {
  extractSearchBrands,
  extractSearchModels,
  groupTemplatesToCarModels,
} from "../domain/catalogGrouping"
import type { CarModelApiResponse } from "@/lib/types/api"
import {
  getDistinctSellableBrandRows,
  getMatTemplates,
  resolveBrandKeyFromParam,
  searchMatTemplates,
} from "./repository"

export type SellableBrand = {
  id: number
  name: string
  logo: string
  description: string
  key: string
}

export type CatalogSearchResult = {
  brands: SellableBrand[]
  models: Array<{
    brand: string
    model: string
    modelFamilyKey: string
    displayLabel: string
    generation: string
    bodyType: string
    bodyTypeDisplay: string
    bodyTypes: string[]
    isCurrentlyProduced: boolean
  }>
  products: Array<{
    id: string
    carBrandSlug: string
    carModelSlug: string
    generation?: string
    bodyType?: string
    basePrice: number
  }>
}

const mapSellableBrands = (
  rows: Array<{ brand_key: string; brand_name: string }>,
): SellableBrand[] =>
  rows
    .map((row) => ({
      key: row.brand_key,
      name: resolveBrandDisplayNameFromDbName(row.brand_name),
      logo: resolveBrandLogo(row.brand_name, null),
      description: `Dywaniki samochodowe dla marki ${row.brand_name}`,
    }))
    .sort((left, right) => left.name.localeCompare(right.name, "pl"))
    .map((brand, index) => ({
      id: index + 1,
      ...brand,
    }))

const loadSellableBrands = async (): Promise<SellableBrand[]> => {
  const rows = await getDistinctSellableBrandRows()
  return mapSellableBrands(rows)
}

export const getSellableBrands = unstable_cache(
  loadSellableBrands,
  ["sellable-brands-v1"],
  {
    revalidate: 300,
    tags: ["sellable-brands"],
  },
)

export const getBrandModelsCatalog = async (
  brandParam: string,
): Promise<CarModelApiResponse[]> => {
  const brandKey = await resolveBrandKeyFromParam(brandParam)
  if (!brandKey) return []

  const rows = await getMatTemplates({ brandKey })
  return groupTemplatesToCarModels(rows).map((model) => ({
    ...model,
    brand: resolveBrandDisplayNameFromDbName(model.brand),
  }))
}

export const searchVehicleCatalog = async (
  query: string,
): Promise<CatalogSearchResult> => {
  const rows = await searchMatTemplates(query)
  const brands = extractSearchBrands(rows).map((brand, index) => ({
    id: index + 1,
    key: brand.key,
    name: resolveBrandDisplayNameFromDbName(brand.name),
    logo: resolveBrandLogo(brand.name, null),
    description: `Dywaniki samochodowe dla marki ${brand.name}`,
  }))
  const models = extractSearchModels(rows).map((model) => ({
    brand: model.brand,
    model: model.model,
    modelFamilyKey: model.modelFamilyKey,
    displayLabel: model.displayLabel,
    generation: model.generation,
    bodyType: model.bodyType,
    bodyTypeDisplay: model.bodyTypeDisplay,
    bodyTypes: model.bodyTypes,
    isCurrentlyProduced: model.isCurrentlyProduced,
  }))

  return {
    brands,
    models,
    products: [],
  }
}
