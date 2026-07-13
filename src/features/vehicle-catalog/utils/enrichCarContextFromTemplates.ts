import type { VehicleTemplateOption } from "../model/schemas"

export type CarContextEnrichment = {
  generation: string | null
  bodyType: string | null
}

export const enrichCarContextFromTemplates = (
  templates: VehicleTemplateOption[],
): CarContextEnrichment => {
  if (templates.length === 0) {
    return { generation: null, bodyType: null }
  }

  const sorted = [...templates].sort(
    (left, right) => (right.yearFrom ?? 0) - (left.yearFrom ?? 0),
  )
  const latest = sorted[0]
  const referenceYear = latest.yearTo ?? latest.yearFrom ?? new Date().getFullYear()

  const matchingTemplates = templates.filter((template) => {
    const from = template.yearFrom ?? 0
    const to = template.yearTo ?? referenceYear
    return referenceYear >= from && referenceYear <= to
  })

  const bodyTypes = [
    ...new Set(
      matchingTemplates.flatMap((template) =>
        template.bodyTypes.map((bodyType) => bodyType.label),
      ),
    ),
  ]

  return {
    generation: latest.generation,
    bodyType: bodyTypes.length === 1 ? bodyTypes[0] : null,
  }
}
