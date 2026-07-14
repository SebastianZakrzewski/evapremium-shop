"use client"

import { useMemo } from "react"
import { getAvailableMaterialColorsForEdge, getColorInfo } from "@/lib/color-mapping"
import type { SectionReadiness } from "@/features/car-configurator/adapters/configuratorV2SectionMapper"
import { TeslaSwatchRow } from "../ui/TeslaSwatchRow"
import { ConfiguratorV2SectionShell } from "./ConfiguratorV2SectionShell"

type ColorSectionProps = {
  config: {
    structure: "diamonds" | "honey"
    matType: "3d-with-rims" | "classic" | "single"
    color: string
    edgeColor: string
  }
  readiness: SectionReadiness
  onUpdate: (updates: { color?: string }) => void
}

export const ColorSection = ({
  config,
  readiness,
  onUpdate,
}: ColorSectionProps) => {
  const availableColors = useMemo(
    () =>
      getAvailableMaterialColorsForEdge(
        config.structure,
        config.matType,
        config.edgeColor || "black",
      ),
    [config.structure, config.matType, config.edgeColor],
  )

  return (
    <ConfiguratorV2SectionShell
      id="section-color"
      title="Kolor materiału"
      selectedLabel={config.color ? getColorInfo(config.color).name : undefined}
      included
      readiness={readiness}
    >
      <TeslaSwatchRow
        items={availableColors.map((colorKey) => ({
          id: colorKey,
          label: getColorInfo(colorKey).name,
          color: getColorInfo(colorKey).color,
        }))}
        selectedId={config.color}
        onSelect={(colorKey) => onUpdate({ color: colorKey })}
      />
    </ConfiguratorV2SectionShell>
  )
}
