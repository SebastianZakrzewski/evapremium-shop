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
import { getPrimaryModelPreviewsByTemplateIds } from "@/features/mat-model-previews/server/repository"
import { resolvePrimaryPreviewImageUrl } from "@/features/mat-model-previews/lib/resolvePrimaryPreviewImageUrl"
import {
  getDistinctSellableBrandRows,
  getMatTemplates,
  resolveBrandKeyFromParam,
  searchMatTemplates,
} from "./repository"

const attachModelPreviewImages = async (
  models: CarModelApiResponse[],
): Promise<CarModelApiResponse[]> => {
  const templateIds = models.flatMap((model) =>
    model.generations
      .map((generation) => generation.matTemplateId)
      .filter((id): id is string => Boolean(id)),
  )

  const primaryPreviews =
    await getPrimaryModelPreviewsByTemplateIds(templateIds)

  return models.map((model) => {
    const generations = model.generations.map((generation) => {
      const modelImage = resolvePrimaryPreviewImageUrl(
        primaryPreviews,
        generation.matTemplateId,
        generation.bodyType,
      )
      return {
        ...generation,
        modelImage,
      }
    })

    // Family-level image only when every generation shares the same URL.
    // Never promote a body-type-specific preview onto other body types.
    const distinctImages = [
      ...new Set(
        generations
          .map((generation) => generation.modelImage)
          .filter((url): url is string => Boolean(url)),
      ),
    ]
    const modelImage =
      distinctImages.length === 1 &&
      generations.every((generation) => generation.modelImage === distinctImages[0])
        ? distinctImages[0]
        : null

    return {
      ...model,
      generations,
      modelImage,
    }
  })
}

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
  const models = groupTemplatesToCarModels(rows).map((model) => ({
    ...model,
    brand: resolveBrandDisplayNameFromDbName(model.brand),
  }))
  return attachModelPreviewImages(models)
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
