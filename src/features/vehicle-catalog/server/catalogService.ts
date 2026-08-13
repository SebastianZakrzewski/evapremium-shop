import type {
  CatalogQuery,
  VehicleCatalogBrand,
  VehicleModelFamily,
} from "../model/schemas"
import { getSellableBrands } from "./brandCatalogService"
import { getMatTemplates, resolveBrandKeyFromParam } from "./repository"
import { toModelFamily, toTemplateOption } from "./catalogMappers"

const uniqueByKey = <T extends { key: string }>(items: T[]): T[] =>
  [...new Map(items.map((item) => [item.key, item])).values()]

export const getVehicleCatalog = async (query: CatalogQuery) => {
  const brandKey = query.brandKey
    ? await resolveBrandKeyFromParam(query.brandKey, query.modelParam)
    : null

  if (query.brandKey && !brandKey) {
    if (!query.modelFamilyKey) {
      return { level: "brands" as const, brands: [] as VehicleCatalogBrand[] }
    }

    return {
      level: "models" as const,
      brandKey: query.brandKey,
      models: [] as VehicleModelFamily[],
    }
  }

  const resolvedQuery = brandKey ? { ...query, brandKey } : query

  if (!resolvedQuery.brandKey) {
    const sellable = await getSellableBrands()
    const brands: VehicleCatalogBrand[] = sellable.map((brand) => ({
      key: brand.key,
      name: brand.name,
      displayName: brand.name,
    }))
    return { level: "brands" as const, brands }
  }

  const rows = await getMatTemplates(resolvedQuery)

  if (!resolvedQuery.modelFamilyKey && !resolvedQuery.modelFamilyPrefix) {
    const models: VehicleModelFamily[] = uniqueByKey(rows.map(toModelFamily))
    return {
      level: "models" as const,
      brandKey: resolvedQuery.brandKey,
      models,
    }
  }

  if (resolvedQuery.modelFamilyPrefix) {
    const prefixRows = await getMatTemplates({
      brandKey: resolvedQuery.brandKey,
      modelFamilyPrefix: resolvedQuery.modelFamilyPrefix,
    })

    return {
      level: "templates" as const,
      brandKey: resolvedQuery.brandKey,
      modelFamilyPrefix: resolvedQuery.modelFamilyPrefix,
      templates: prefixRows.map(toTemplateOption),
    }
  }

  return {
    level: "templates" as const,
    brandKey: resolvedQuery.brandKey,
    modelFamilyKey: resolvedQuery.modelFamilyKey,
    templates: rows.map(toTemplateOption),
  }
}
