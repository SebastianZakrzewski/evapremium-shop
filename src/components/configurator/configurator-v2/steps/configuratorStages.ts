import type { ConfiguratorV2SectionId, SectionReadiness } from "@/features/car-configurator/adapters/configuratorV2SectionMapper"
import type { ConfiguratorState } from "@/features/car-configurator/utils/configuratorState"

export const CONFIGURATOR_STAGE_PARAM = "etap"

export const CONFIGURATOR_STAGES = [
  { id: 1, name: "Samochód" },
  { id: 2, name: "Dywaniki i zestaw" },
  { id: 3, name: "Wygląd" },
  { id: 4, name: "Akcesoria" },
  { id: 5, name: "Podsumowanie" },
] as const

export type ConfiguratorStageId = (typeof CONFIGURATOR_STAGES)[number]["id"]

export const configuratorProgressLabel = (
  stage: number,
  stageCount: number = CONFIGURATOR_STAGES.length,
): string => `Krok ${stage} z ${stageCount}`

export type StageStatus = "current" | "completed" | "available" | "locked"

export type StageRequirementInput = {
  vehicleComplete: boolean
  matTypeComplete: boolean
  variantComplete: boolean
  appearanceComplete: boolean
}

export type StageSnapshot = {
  id: ConfiguratorStageId
  name: string
  status: StageStatus
  canOpen: boolean
}

const SECTION_STAGE: Record<ConfiguratorV2SectionId | "summary", ConfiguratorStageId> = {
  vehicle: 1,
  matType: 2,
  variant: 2,
  structure: 3,
  color: 3,
  edgeColor: 3,
  accessories: 4,
  summary: 5,
}

export const stageRequirementsFromSections = (
  sections: Record<ConfiguratorV2SectionId, SectionReadiness>,
): StageRequirementInput => ({
  vehicleComplete: sections.vehicle.isComplete,
  matTypeComplete: sections.matType.isComplete,
  variantComplete: sections.variant.isComplete,
  appearanceComplete:
    sections.structure.isComplete &&
    sections.color.isComplete &&
    sections.edgeColor.isComplete,
})

export const isConfiguratorStageId = (value: number): value is ConfiguratorStageId =>
  CONFIGURATOR_STAGES.some((stage) => stage.id === value)

export const parseEtapParam = (value: string | null | undefined): ConfiguratorStageId | null => {
  if (!value || !/^[1-5]$/.test(value)) return null
  const stage = Number(value)
  return isConfiguratorStageId(stage) ? stage : null
}

export const withEtapParam = (
  search: string,
  stage: ConfiguratorStageId,
): string => {
  const params = new URLSearchParams(search)
  params.set(CONFIGURATOR_STAGE_PARAM, String(stage))
  return params.toString()
}

const requirementsMet = (
  stage: ConfiguratorStageId,
  input: StageRequirementInput,
): boolean => {
  if (stage === 1) return input.vehicleComplete
  if (stage === 2) {
    return input.vehicleComplete && input.matTypeComplete && input.variantComplete
  }
  if (stage === 3) {
    return requirementsMet(2, input) && input.appearanceComplete
  }
  return requirementsMet(3, input)
}

export const canEnterStage = (
  stage: ConfiguratorStageId,
  input: StageRequirementInput,
): boolean => {
  if (stage === 1) return true
  const previous = (stage - 1) as ConfiguratorStageId
  return requirementsMet(previous, input)
}

export const highestEnterableStage = (
  input: StageRequirementInput,
): ConfiguratorStageId => {
  let highest: ConfiguratorStageId = 1
  for (const stage of CONFIGURATOR_STAGES) {
    if (canEnterStage(stage.id, input)) highest = stage.id
  }
  return highest
}

export const resolveConfiguratorStage = (
  requested: number | null,
  input: StageRequirementInput,
): ConfiguratorStageId => {
  const highest = highestEnterableStage(input)
  if (requested == null || !isConfiguratorStageId(requested)) return 1
  if (!canEnterStage(requested, input)) return highest
  return requested
}

export const stageStatusLabel = (status: StageStatus): string => {
  if (status === "current") return "teraz"
  if (status === "completed") return "gotowe"
  if (status === "available") return "dostępny"
  return "zablokowany"
}

export const buildStageSnapshots = (
  current: ConfiguratorStageId,
  input: StageRequirementInput,
): StageSnapshot[] =>
  CONFIGURATOR_STAGES.map((stage) => {
    const canOpen = canEnterStage(stage.id, input)
    let status: StageStatus = "locked"
    if (stage.id === current) status = "current"
    else if (!canOpen) status = "locked"
    else if (stage.id < CONFIGURATOR_STAGES.length && requirementsMet(stage.id, input)) status = "completed"
    else status = "available"
    return { id: stage.id, name: stage.name, status, canOpen }
  })

const joinLabels = (labels: string[]): string => {
  if (labels.length <= 1) return labels[0] ?? ""
  return `${labels.slice(0, -1).join(", ")} i ${labels[labels.length - 1]}`
}

export const forwardDisabledReason = (
  stage: ConfiguratorStageId,
  config: Pick<
    ConfiguratorState,
    "brand" | "model" | "year" | "gearbox" | "bodyType" | "variant" | "structure" | "color" | "edgeColor"
  >,
  input: StageRequirementInput,
): string | null => {
  if (stage >= CONFIGURATOR_STAGES.length) return null
  const next = (stage + 1) as ConfiguratorStageId
  if (canEnterStage(next, input)) return null

  const missing: string[] = []
  if (stage === 1) {
    if (!config.brand.trim()) missing.push("markę")
    if (!config.model.trim()) missing.push("model")
    if (!config.year.trim()) missing.push("rok produkcji")
    if (!config.gearbox) missing.push("skrzynię biegów")
    if (!config.bodyType.trim()) missing.push("typ nadwozia")
  } else if (stage === 2) {
    if (!input.matTypeComplete) missing.push("typ dywanika")
    if (!config.variant.trim()) missing.push("zestaw")
  } else if (!input.appearanceComplete) {
    if (!config.structure) missing.push("strukturę komórek")
    if (!config.color.trim()) missing.push("kolor materiału")
    if (!config.edgeColor.trim()) missing.push("kolor obszycia")
  }

  if (missing.length === 0) {
    return "Aby przejść dalej, uzupełnij wymagane pola tego etapu."
  }
  return `Aby przejść dalej, wybierz: ${joinLabels(missing)}.`
}

export const sectionIdForStage = (
  section: ConfiguratorV2SectionId | "summary",
): ConfiguratorStageId => SECTION_STAGE[section]

export const isSectionVisibleForStage = ({
  section,
  stage,
  searchActive,
  input,
}: {
  section: ConfiguratorV2SectionId | "summary"
  stage: ConfiguratorStageId
  searchActive: boolean
  input: StageRequirementInput
}): boolean => {
  const owner = sectionIdForStage(section)
  if (searchActive) return canEnterStage(owner, input)
  return owner === stage
}
