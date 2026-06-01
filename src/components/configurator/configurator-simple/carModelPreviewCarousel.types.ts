/**
 * Slajd karuzeli podglądu marki/modelu (krok 1 konfiguratora).
 * W przyszłości mapowanie z rekordów mat_product_images.
 */
export type CarModelPreviewSlide = {
  id: string
  imageUrl: string
  altText?: string
  sortOrder?: number
}

export const PLACEHOLDER_CAR_MODEL_PREVIEW_SLIDES: CarModelPreviewSlide[] = [
  {
    id: "placeholder-1",
    imageUrl: "/dywaniki/3d/diamonds/black/5os-3d-diamonds-black-black.webp",
    altText: "Podgląd dywaników EVA — konfiguracja",
    sortOrder: 0,
  },
  {
    id: "placeholder-2",
    imageUrl: "/bezrantowprodukt/1_-_1.webp",
    altText: "Podgląd dywaników EVA — wariant klasyczny",
    sortOrder: 1,
  },
  {
    id: "placeholder-3",
    imageUrl: "/zrantamiprodukt/5_-_1.webp",
    altText: "Podgląd dywaników EVA — wariant z rantami",
    sortOrder: 2,
  },
]
