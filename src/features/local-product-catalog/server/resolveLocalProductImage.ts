import { matchLocalProductImage } from "../domain/matchLocalProductImage"
import type { LocalProductImageQuery } from "../domain/matchLocalProductImage"
import { loadLocalBrandCatalog } from "./loadLocalBrandCatalog"

const brandNameToSlug = (brandName: string): string =>
  brandName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")

export const resolveLocalProductImage = async (
  query: LocalProductImageQuery,
): Promise<string | null> => {
  const brandSlug = brandNameToSlug(query.brand)
  if (!brandSlug) return null

  const catalog = await loadLocalBrandCatalog(brandSlug)
  if (catalog.length === 0) return null

  return matchLocalProductImage(catalog, query)?.publicPath ?? null
}
