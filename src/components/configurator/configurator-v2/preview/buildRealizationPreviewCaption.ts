import { getMatTypeLabel } from "@/shared/mat-set-labels"
import type { MatRealizationMatType } from "@/features/mat-realization-photos"

export type RealizationPreviewCaptionInput = {
  matType: MatRealizationMatType
  brand: string
  model: string
  generation?: string | null
}

/**
 * Podpis pod podglądem przy zdjęciach realizacji.
 * Szablon: „Są to realne zdjęcia realizacji dywaników {typ} do {Marka} {Model} {Generacja}”
 */
export const buildRealizationPreviewCaption = ({
  matType,
  brand,
  model,
  generation,
}: RealizationPreviewCaptionInput): string | null => {
  const typeLabel = getMatTypeLabel(matType)
  const brandLabel = brand.trim()
  const modelLabel = model.trim()
  if (!typeLabel || !brandLabel || !modelLabel) return null

  const vehicleParts = [brandLabel, modelLabel]
  const generationLabel = generation?.trim() ?? ""
  if (
    generationLabel &&
    !modelLabel.toLowerCase().includes(generationLabel.toLowerCase())
  ) {
    vehicleParts.push(generationLabel)
  }

  return `Są to realne zdjęcia realizacji dywaników ${typeLabel} do ${vehicleParts.join(" ")}`
}
