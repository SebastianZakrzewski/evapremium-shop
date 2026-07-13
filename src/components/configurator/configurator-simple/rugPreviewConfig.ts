import type { ConfiguratorState } from "@/features/car-configurator/utils/configuratorState"

export const RUG_PREVIEW_CONFIG_KEYS = [
  "matType",
  "variant",
  "structure",
  "color",
  "edgeColor",
  "heelPad",
] as const satisfies readonly (keyof ConfiguratorState)[]

export const hasRugPreviewConfigChange = (
  updates: Partial<ConfiguratorState>
): boolean =>
  RUG_PREVIEW_CONFIG_KEYS.some((key) => updates[key] !== undefined)

/** Minivan / single-price vehicles only offer bez rantów dynamic preview */
export const usesClassicOnlyDynamicPreview = (
  matType: ConfiguratorState["matType"] | undefined,
  pricingCategoryKey?: string,
): boolean =>
  matType === "single" || pricingCategoryKey === "minivan"

export const isMatTypeSelected = (
  matType: ConfiguratorState["matType"] | undefined
): matType is ConfiguratorState["matType"] =>
  matType === "classic" ||
  matType === "3d-with-rims" ||
  matType === "single"

export const canShowRugSidebarPreview = (
  activeStep: number,
  matType: ConfiguratorState["matType"] | undefined
): boolean => activeStep >= 2 && isMatTypeSelected(matType)

export const getMatTypeForDynamicPreview = (
  matType: ConfiguratorState["matType"] | undefined,
  pricingCategoryKey?: string,
): "3d" | "classic" => {
  if (usesClassicOnlyDynamicPreview(matType, pricingCategoryKey)) {
    return "classic"
  }
  if (matType === "classic") return "classic"
  return "3d"
}
