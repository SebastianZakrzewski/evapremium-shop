import type { ConfiguratorState } from "@/features/car-configurator/utils/configuratorState"
import type { VehicleBodyTypeOption, VehicleTemplateOption } from "@/features/vehicle-catalog/model/schemas"

export const templateBodyOptions = (template: VehicleTemplateOption): VehicleBodyTypeOption[] => {
  if (template.bodyTypes.length > 0) return template.bodyTypes
  if (!template.bodyTypeKey) return []
  const label = template.bodyTypeDisplay ?? template.bodyTypeKey
  return [{ key: template.bodyTypeKey, label, displayLabel: label }]
}

export const uniqueBodyOptions = (templates: readonly VehicleTemplateOption[]): VehicleBodyTypeOption[] => {
  const bodies = new Map<string, VehicleBodyTypeOption>()
  for (const template of templates) {
    for (const body of templateBodyOptions(template)) {
      if (!body.key || bodies.has(body.key)) continue
      bodies.set(body.key, body)
    }
  }
  return [...bodies.values()].sort((left, right) =>
    (left.displayLabel || left.label).localeCompare(right.displayLabel || right.label, "pl"),
  )
}

export const templateMatchesBody = (template: VehicleTemplateOption, bodyTypeKey: string) =>
  templateBodyOptions(template).some((body) => body.key === bodyTypeKey)

export const templatesForBody = (
  templates: readonly VehicleTemplateOption[],
  bodyTypeKey: string,
) => templates.filter((template) => templateMatchesBody(template, bodyTypeKey))

export type GenerationChoice = {
  value: string
  modelKey: string
  generation: string
  generationDisplay: string
  yearFrom: number | null
  yearTo: number | null
}

export const generationsForBody = (
  templates: readonly VehicleTemplateOption[],
  bodyTypeKey: string,
): GenerationChoice[] => {
  const source = bodyTypeKey ? templatesForBody(templates, bodyTypeKey) : templates
  return [
    ...new Map(
      source.map((template) => [
        `${template.modelKey}|${template.generation}`,
        {
          value: `${template.modelKey}|${template.generation}`,
          modelKey: template.modelKey,
          generation: template.generation,
          generationDisplay: template.generationDisplay || template.generation,
          yearFrom: template.yearFrom,
          yearTo: template.yearTo,
        },
      ]),
    ).values(),
  ].sort((left, right) => (right.yearFrom ?? 0) - (left.yearFrom ?? 0))
}

const yearsInRange = (from: number | null, to: number | null): number[] => {
  if (from == null) return []
  const end = Math.min(to ?? new Date().getFullYear() + 1, 2100)
  return Array.from({ length: end - from + 1 }, (_, index) => from + index)
}

export const yearsForBodyGeneration = (
  templates: readonly VehicleTemplateOption[],
  bodyTypeKey: string,
  modelKey: string,
  generation: string,
): number[] => {
  const years = new Set<number>()
  for (const template of templatesForBody(templates, bodyTypeKey)) {
    if (template.modelKey !== modelKey || template.generation !== generation) continue
    for (const year of yearsInRange(template.yearFrom, template.yearTo)) years.add(year)
  }
  return [...years].sort((left, right) => right - left)
}

const yearFitsTemplate = (template: VehicleTemplateOption, year: string) => {
  const value = Number(year)
  if (!Number.isInteger(value)) return false
  return (
    (template.yearFrom == null || value >= template.yearFrom) &&
    (template.yearTo == null || value <= template.yearTo)
  )
}

export const resolveTemplateForSelection = (
  templates: readonly VehicleTemplateOption[],
  input: { modelKey: string; generation: string; bodyTypeKey: string; year: string },
): VehicleTemplateOption | null => {
  const matches = templates.filter(
    (template) =>
      template.modelKey === input.modelKey &&
      template.generation === input.generation &&
      templateMatchesBody(template, input.bodyTypeKey) &&
      yearFitsTemplate(template, input.year),
  )
  return matches.find((template) => template.bodyTypeKey === input.bodyTypeKey) ?? matches[0] ?? null
}

export const selectionAfterBodyType = (
  config: Pick<ConfiguratorState, "modelKey" | "generation" | "year">,
  templates: readonly VehicleTemplateOption[],
  body: VehicleBodyTypeOption,
): Pick<
  ConfiguratorState,
  "bodyType" | "bodyTypeKey" | "modelKey" | "generation" | "year" | "recordKey" | "templateId" | "pricingCategoryKey"
> => {
  const matching = templatesForBody(templates, body.key)
  const generations = generationsForBody(matching, body.key)
  const currentStillValid = generations.some(
    (item) => item.modelKey === config.modelKey && item.generation === config.generation,
  )
  const generation = currentStillValid
    ? generations.find((item) => item.modelKey === config.modelKey && item.generation === config.generation)
    : generations.length === 1
      ? generations[0]
      : undefined
  const modelKey = generation?.modelKey ?? ""
  const generationName = generation?.generation ?? ""
  const years = generation ? yearsForBodyGeneration(templates, body.key, modelKey, generationName) : []
  const year = years.some((item) => String(item) === config.year) ? config.year : ""
  const template = year
    ? resolveTemplateForSelection(templates, {
        modelKey,
        generation: generationName,
        bodyTypeKey: body.key,
        year,
      })
    : null
  return {
    bodyType: body.displayLabel || body.label,
    bodyTypeKey: body.key,
    modelKey,
    generation: generationName,
    year,
    recordKey: template?.recordKey ?? "",
    templateId: template?.id ?? "",
    pricingCategoryKey: template?.pricingCategoryKey ?? "",
  }
}

/** Newest generation of this body, used only to fetch its photo before a generation is chosen. */
export const previewModelKeyForBody = (
  templates: readonly VehicleTemplateOption[],
  bodyTypeKey: string,
  selectedModelKey: string,
) => {
  if (selectedModelKey) return selectedModelKey
  if (!bodyTypeKey) return ""
  return [...templatesForBody(templates, bodyTypeKey)].sort(
    (left, right) => (right.yearFrom ?? 0) - (left.yearFrom ?? 0),
  )[0]?.modelKey ?? ""
}
