import { getMatImagePath } from "@/lib/image-mapping"
import {
  getAvailableColors,
  getAvailableMaterialColorsForEdge,
} from "@/lib/color-mapping"
import { getMatTypeForDynamicPreview } from "@/components/configurator/configurator-simple/rugPreviewConfig"
import type { ConfiguratorState } from "@/features/car-configurator/utils/configuratorState"

type MatPreviewPreloadInput = Pick<
  ConfiguratorState,
  "matType" | "pricingCategoryKey" | "structure" | "color" | "edgeColor" | "variant"
>

/** Ścieżki do wstępnego załadowania — kolory materiału i obszycia dla bieżącej konfiguracji */
export const buildMatPreviewPreloadPaths = (
  config: MatPreviewPreloadInput,
): string[] => {
  if (!config.variant || !config.structure) return []

  const matType = getMatTypeForDynamicPreview(
    config.matType,
    config.pricingCategoryKey,
  )
  const edgeColor = config.edgeColor || "black"
  const materialColor = config.color || "black"
  const paths = new Set<string>()

  const addPath = (material: string, edge: string) => {
    paths.add(
      getMatImagePath(matType, config.structure, material, edge),
    )
  }

  addPath(materialColor, edgeColor)

  for (const material of getAvailableMaterialColorsForEdge(
    config.structure,
    config.matType,
    edgeColor,
  )) {
    addPath(material, edgeColor)
  }

  for (const edge of getAvailableColors(config.structure, "border")) {
    const materials = getAvailableMaterialColorsForEdge(
      config.structure,
      config.matType,
      edge,
    )
    if (!materials.includes(materialColor)) continue
    addPath(materialColor, edge)
  }

  return [...paths]
}
