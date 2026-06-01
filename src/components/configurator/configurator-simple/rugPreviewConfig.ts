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

export const isMatTypeSelected = (
  matType: ConfiguratorState["matType"] | undefined
): matType is ConfiguratorState["matType"] =>
  matType === "classic" || matType === "3d-with-rims"

export const canShowRugSidebarPreview = (
  activeStep: number,
  matType: ConfiguratorState["matType"] | undefined
): boolean => activeStep >= 2 && isMatTypeSelected(matType)
