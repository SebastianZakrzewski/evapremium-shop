import type { CarModelApiResponse } from "@/lib/types/api"
import {
  resolveBrandDisplayNameFromDbName,
  resolveBrandLogo,
} from "@/shared/brands"
import {
  collectUniqueBrandsFromRows,
  extractSearchBrands,
  extractSearchModels,
  groupTemplatesToCarModels,
} from "../domain/catalogGrouping"
import {
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

export const getSellableBrands = async (): Promise<SellableBrand[]> => {
  const rows = await getMatTemplates()

  return collectUniqueBrandsFromRows(rows)
    .sort((left, right) => left.name.localeCompare(right.name, "pl"))
    .map((brand, index) => ({
      id: index + 1,
      key: brand.key,
      name: resolveBrandDisplayNameFromDbName(brand.name),
      logo: resolveBrandLogo(brand.name, null),
      description: `Dywaniki samochodowe dla marki ${brand.name}`,
    }))
}

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
