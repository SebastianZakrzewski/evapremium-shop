import type { ModelFamilyResolution } from "@/features/vehicle-catalog/domain/catalogKeys"

export type LockedCarGeneration = {
  modelKey: string
  generation: string
  yearFrom: number | null
  yearTo: number | null
}

export type LockedCarTemplate = {
  modelKey: string
  generation: string
  yearFrom: number | null
  yearTo: number | null
}

const normalizeToken = (value: string): string =>
  value.toLowerCase().replace(/[\s_-]+/g, "")

export const yearsInRange = (from: number | null, to: number | null): number[] => {
  if (from == null) return []
  const end = Math.min(to ?? new Date().getFullYear() + 1, 2100)
  return Array.from({ length: end - from + 1 }, (_, index) => from + index).reverse()
}

export const isCatalogResolving = (input: {
  isModelsQueryLoading: boolean
  modelsCount: number
  isTemplatesQueryLoading: boolean
  templatesCount: number
  hasTemplateQuery: boolean
}): boolean => {
  const isResolvingModels = input.isModelsQueryLoading && input.modelsCount === 0
  const isResolvingTemplates =
    input.hasTemplateQuery &&
    input.isTemplatesQueryLoading &&
    input.templatesCount === 0

  return isResolvingModels || isResolvingTemplates
}

export const resolveLockedCarGeneration = (input: {
  generations: LockedCarGeneration[]
  selectedGeneration: LockedCarGeneration | null | undefined
  modelResolution: ModelFamilyResolution
  modelParam: string | null
  generationParam: string | null
}): LockedCarGeneration | null => {
  const { generations, selectedGeneration, modelResolution, modelParam, generationParam } =
    input

  if (selectedGeneration) return selectedGeneration
  if (generations.length === 1) return generations[0]
  if (generations.length === 0 || modelResolution.mode === "none") return null

  const familyToken =
    modelResolution.mode === "single"
      ? normalizeToken(modelResolution.family.key)
      : normalizeToken(modelParam ?? "")

  const modelMatches = generations.filter((item) => {
    const modelToken = normalizeToken(item.modelKey)
    return (
      modelToken === familyToken ||
      modelToken.includes(familyToken) ||
      familyToken.includes(modelToken)
    )
  })

  if (generationParam) {
    const generationToken = normalizeToken(generationParam)
    const generationMatches = (modelMatches.length > 0 ? modelMatches : generations).filter(
      (item) =>
        normalizeToken(item.generation).includes(generationToken) ||
        generationToken.includes(normalizeToken(item.generation)),
    )
    if (generationMatches.length === 1) return generationMatches[0]
  }

  if (modelMatches.length === 1) return modelMatches[0]

  return null
}

export const computeLockedCarAvailableYears = (input: {
  yearParam: string | null
  generationParam: string | null
  resolvedGeneration: LockedCarGeneration | null
  templates: LockedCarTemplate[]
}): number[] => {
  const { yearParam, generationParam, resolvedGeneration, templates } = input

  if (yearParam) {
    const year = Number(yearParam)
    if (!Number.isNaN(year)) return [year]
  }

  if (resolvedGeneration) {
    return yearsInRange(resolvedGeneration.yearFrom, resolvedGeneration.yearTo)
  }

  const scopedTemplates = generationParam
    ? templates.filter((template) => {
        const generationToken = normalizeToken(generationParam)
        const templateToken = normalizeToken(template.generation)
        return (
          templateToken.includes(generationToken) ||
          generationToken.includes(templateToken)
        )
      })
    : templates

  if (scopedTemplates.length > 0) {
    const yearFromValues = scopedTemplates
      .map((template) => template.yearFrom)
      .filter((value): value is number => value != null)
    const yearToValues = scopedTemplates
      .map((template) => template.yearTo)
      .filter((value): value is number => value != null)

    if (yearFromValues.length > 0) {
      return yearsInRange(
        Math.min(...yearFromValues),
        yearToValues.length > 0 ? Math.max(...yearToValues) : null,
      )
    }
  }

  const generationRange = generationParam?.match(/^(\d{4})-(\d{4})$/)
  if (generationRange) {
    return yearsInRange(Number(generationRange[1]), Number(generationRange[2]))
  }

  return []
}
