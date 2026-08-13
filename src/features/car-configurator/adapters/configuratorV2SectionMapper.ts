import type { ConfiguratorState } from "../utils/configuratorState"
import { getMatSetVariantLabel, getMatTypeLabel } from "@/shared/mat-set-labels"
import { formatPriceValue } from "@/lib/utils/formatPrice"

export type ConfiguratorV2SectionId =
  | "vehicle"
  | "matType"
  | "variant"
  | "structure"
  | "color"
  | "edgeColor"
  | "accessories"

export type SectionReadiness = {
  isComplete: boolean
  isDisabled: boolean
  disabledReason?: string
}

export type ConfiguratorV2Metric = {
  label: string
  value: string
}

export type ConfiguratorV2SectionMapperInput = {
  config: ConfiguratorState
  skipMatTypeStep: boolean
  totalPrice: number
  variantPricingLabel?: string
}

export type ConfiguratorV2SectionMapperResult = {
  sections: Record<ConfiguratorV2SectionId, SectionReadiness>
  metrics: ConfiguratorV2Metric[]
  contextLine: string
  isReadyForCart: boolean
}

const isVehicleComplete = (config: ConfiguratorState): boolean =>
  !!(config.brand && config.model && config.year && config.bodyType)

const isMatTypeComplete = (
  config: ConfiguratorState,
  skipMatTypeStep: boolean,
): boolean => (skipMatTypeStep ? true : !!config.matType)

export const mapConfiguratorV2Sections = ({
  config,
  skipMatTypeStep,
  totalPrice,
  variantPricingLabel,
}: ConfiguratorV2SectionMapperInput): ConfiguratorV2SectionMapperResult => {
  const vehicleComplete = isVehicleComplete(config)
  const matTypeComplete = isMatTypeComplete(config, skipMatTypeStep)
  const variantComplete = !!config.variant
  const structureComplete = !!config.structure
  const colorComplete = !!(config.color && config.edgeColor)

  const sections: Record<ConfiguratorV2SectionId, SectionReadiness> = {
    vehicle: {
      isComplete: vehicleComplete,
      isDisabled: false,
    },
    matType: {
      isComplete: matTypeComplete,
      isDisabled: !vehicleComplete,
      disabledReason: vehicleComplete
        ? undefined
        : "Najpierw wybierz pojazd",
    },
    variant: {
      isComplete: variantComplete,
      isDisabled: !vehicleComplete || !matTypeComplete,
      disabledReason: !vehicleComplete
        ? "Najpierw wybierz pojazd"
        : !matTypeComplete
          ? "Najpierw wybierz typ dywanika"
          : undefined,
    },
    structure: {
      isComplete: structureComplete,
      isDisabled: !variantComplete,
      disabledReason: !variantComplete
        ? "Najpierw wybierz wariant zestawu"
        : undefined,
    },
    color: {
      isComplete: !!config.color,
      isDisabled: !structureComplete,
      disabledReason: !structureComplete
        ? "Najpierw wybierz strukturę komórek"
        : undefined,
    },
    edgeColor: {
      isComplete: !!config.edgeColor,
      isDisabled: !structureComplete,
      disabledReason: !structureComplete
        ? "Najpierw wybierz strukturę komórek"
        : undefined,
    },
    accessories: {
      isComplete: true,
      isDisabled: !colorComplete,
      disabledReason: !colorComplete
        ? "Najpierw wybierz kolory"
        : undefined,
    },
  }

  const matTypeLabel = getMatTypeLabel(config.matType) || "—"
  const variantLabel =
    getMatSetVariantLabel({
      setType: config.matType,
      setVariant: config.variant,
      pricingCategoryKey: config.pricingCategoryKey,
      bodyTypeKey: config.bodyTypeKey,
      pricingLabel: variantPricingLabel,
    }) || "—"

  const priceMetric =
    totalPrice > 0 ? `${formatPriceValue(totalPrice)} zł` : "—"

  const metrics: ConfiguratorV2Metric[] = [
    {
      label: "Pojazd",
      value: vehicleComplete
        ? `${config.brand} ${config.model}`
        : "Wybierz auto",
    },
    {
      label: "Zestaw",
      value: variantComplete ? variantLabel : matTypeLabel,
    },
    {
      label: "Cena",
      value: priceMetric,
    },
  ]

  const contextParts: string[] = []
  if (matTypeLabel && matTypeLabel !== "—") {
    contextParts.push(matTypeLabel)
  }
  if (variantLabel && variantLabel !== "—") {
    contextParts.push(`Zestaw: ${variantLabel}`)
  }
  if (config.structure) {
    contextParts.push(
      config.structure === "diamonds" ? "Struktura: Romby" : "Struktura: Plaster miodu",
    )
  }

  const catalogVehicleComplete = !!(
    config.recordKey?.trim() && config.bodyTypeKey?.trim()
  )

  const isReadyForCart =
    vehicleComplete &&
    catalogVehicleComplete &&
    matTypeComplete &&
    variantComplete &&
    structureComplete &&
    colorComplete &&
    totalPrice > 0

  return {
    sections,
    metrics,
    contextLine: contextParts.join(" · "),
    isReadyForCart,
  }
}
