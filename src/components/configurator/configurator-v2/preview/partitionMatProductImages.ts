import type { MatProductImage } from "@/features/mat-product-images"

export type PartitionedMatProductImages = {
  modelTemplate: MatProductImage | null
  inCarPhotos: MatProductImage[]
}

export const isModelTemplateImage = (image: MatProductImage): boolean => {
  const url = image.image_url.toLowerCase()
  const alt = image.alt_text?.toLowerCase() ?? ""

  return (
    url.includes("template") ||
    url.includes("podklad") ||
    url.includes("schemat") ||
    alt.includes("szablon") ||
    alt.includes("schemat") ||
    alt.includes("podkład")
  )
}

/**
 * Pierwsze zdjęcie (najniższy sort_order) to grafika podkładowa modelu —
 * ta sama co w sekcji /modele. Kolejne to zdjęcia dywaników w aucie.
 */
export const partitionMatProductImages = (
  images: MatProductImage[],
): PartitionedMatProductImages => {
  if (images.length === 0) {
    return { modelTemplate: null, inCarPhotos: [] }
  }

  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order)
  const explicitTemplate = sorted.find(isModelTemplateImage)

  if (explicitTemplate) {
    return {
      modelTemplate: explicitTemplate,
      inCarPhotos: sorted.filter((image) => image.id !== explicitTemplate.id),
    }
  }

  return {
    modelTemplate: sorted[0] ?? null,
    inCarPhotos: sorted.slice(1),
  }
}
