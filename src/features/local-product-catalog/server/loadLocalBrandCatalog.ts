import { readdir } from "node:fs/promises"
import path from "node:path"
import { parseLocalProductCardFileName } from "../domain/parseLocalProductCard"
import type { LocalProductCard } from "../domain/parseLocalProductCard"

const catalogCache = new Map<string, LocalProductCard[]>()

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif"])

export const loadLocalBrandCatalog = async (
  brandSlug: string,
): Promise<LocalProductCard[]> => {
  const slug = brandSlug.trim().toLowerCase()
  if (!slug) return []

  const cached = catalogCache.get(slug)
  if (cached) return cached

  const directory = path.join(process.cwd(), "public", "images", "products", slug)

  try {
    const entries = await readdir(directory, { withFileTypes: true })
    const cards = entries.flatMap((entry) => {
      if (!entry.isFile()) return []
      const extension = path.extname(entry.name).toLowerCase()
      if (!IMAGE_EXTENSIONS.has(extension)) return []

      const parsed = parseLocalProductCardFileName(entry.name)
      if (!parsed) return []

      return [
        {
          ...parsed,
          fileName: entry.name,
          publicPath: `/images/products/${slug}/${entry.name}`,
        },
      ]
    })

    catalogCache.set(slug, cards)
    return cards
  } catch {
    catalogCache.set(slug, [])
    return []
  }
}
