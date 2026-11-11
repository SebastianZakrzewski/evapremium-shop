export type CarPreviewInput = {
  id: string
  image_url: string
  alt_text?: string | null
  is_primary?: boolean
  sort_order?: number
}

export type CarGallerySlide = {
  id: string
  src: string
  alt: string
  group: "car"
}

const isModelSlide = (slide: CarGallerySlide) =>
  slide.id !== "car-brand" && slide.id !== "car-neutral"

const modelSlidesFrom = (previews: readonly CarPreviewInput[]): CarGallerySlide[] => {
  const ordered = [...previews].sort((left, right) => {
    if (left.is_primary !== right.is_primary) return left.is_primary ? -1 : 1
    return (left.sort_order ?? 0) - (right.sort_order ?? 0)
  })
  const slides: CarGallerySlide[] = []
  const seen = new Set<string>()
  for (const preview of ordered) {
    if (!preview.image_url || seen.has(preview.image_url)) continue
    seen.add(preview.image_url)
    slides.push({
      id: `car-${preview.id}`,
      src: preview.image_url,
      alt: preview.alt_text ?? "Podgląd modelu",
      group: "car",
    })
  }
  return slides
}

/**
 * Year and gearbox refetch the preview query and can return an empty list
 * for one paint. Once a model photo is known, keep it instead of the brand logo.
 */
export const resolveCarGallerySlides = ({
  previews,
  brandName,
  brandLogo,
  neutralSrc,
  modelSelected,
  pending,
  heldModelSlides,
}: {
  previews: readonly CarPreviewInput[]
  brandName: string
  brandLogo: string | null
  neutralSrc: string
  modelSelected: boolean
  pending: boolean
  heldModelSlides: readonly CarGallerySlide[]
}): { slides: CarGallerySlide[]; heldModelSlides: CarGallerySlide[] } => {
  const modelSlides = modelSlidesFrom(previews)
  if (modelSlides.length > 0) {
    return { slides: modelSlides, heldModelSlides: modelSlides }
  }

  const held = heldModelSlides.filter(isModelSlide)
  if (modelSelected && pending && held.length > 0) {
    return { slides: [...held], heldModelSlides: [...held] }
  }

  if (!modelSelected && brandName && brandLogo) {
    return {
      slides: [{ id: "car-brand", src: brandLogo, alt: brandName, group: "car" }],
      heldModelSlides: [],
    }
  }

  return {
    slides: [{ id: "car-neutral", src: neutralSrc, alt: "Dywaniki EVA Premium", group: "car" }],
    heldModelSlides: [],
  }
}
