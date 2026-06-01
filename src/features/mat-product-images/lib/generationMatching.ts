/**
 * Warianty generacji do wyszukiwania w mat_product_images.
 * car_models_extended używa np. "2021-2026", a mat_product_images często "2021+".
 */
export const getGenerationSearchVariants = (generation: string): string[] => {
  const trimmed = generation.trim()
  if (!trimmed) return []

  const variants = new Set<string>([trimmed])

  const rangeMatch = trimmed.match(/^(\d{4})-(\d{4})$/)
  if (rangeMatch) {
    variants.add(`${rangeMatch[1]}+`)
  }

  const openEndedMatch = trimmed.match(/^(\d{4})\+$/)
  if (openEndedMatch) {
    variants.add(`${openEndedMatch[1]}-${openEndedMatch[1]}`)
  }

  return [...variants]
}
