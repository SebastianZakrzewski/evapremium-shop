"use client"

import { useMemo } from "react"
import {
  getAvailableColors,
  getAvailableMaterialColorsForEdge,
  getColorInfo,
} from "@/lib/color-mapping"
import type { SectionReadiness } from "@/features/car-configurator/adapters/configuratorV2SectionMapper"
import { getEdgeColorIconSrc } from "../edge-color/edgeColorIcons"
import { TeslaSwatchRow } from "../ui/TeslaSwatchRow"
import { ConfiguratorV2SectionShell } from "./ConfiguratorV2SectionShell"

type EdgeColorSectionProps = {
  config: {
    structure: "diamonds" | "honey"
    matType: "3d-with-rims" | "classic" | "single"
    color: string
    edgeColor: string
  }
  readiness: SectionReadiness
  onUpdate: (updates: { edgeColor?: string; color?: string }) => void
}

export const EdgeColorSection = ({
  config,
  readiness,
  onUpdate,
}: EdgeColorSectionProps) => {
  const availableEdgeColors = useMemo(
    () => getAvailableColors(config.structure, "border"),
    [config.structure],
  )

  const handleEdgeSelect = (colorKey: string) => {
    const newAvailable = getAvailableMaterialColorsForEdge(
      config.structure,
      config.matType,
      colorKey,
    )
    const updates: { edgeColor: string; color?: string } = { edgeColor: colorKey }
    if (!newAvailable.includes(config.color)) {
      updates.color = newAvailable[0] || "black"
    }
    onUpdate(updates)
  }

  return (
    <ConfiguratorV2SectionShell
      id="section-edgeColor"
      title="Kolor obszycia"
      selectedLabel={config.edgeColor ? getColorInfo(config.edgeColor).name : undefined}
      included
      readiness={readiness}
    >
      <TeslaSwatchRow
        items={availableEdgeColors.map((colorKey) => ({
          id: colorKey,
          label: getColorInfo(colorKey).name,
          color: getColorInfo(colorKey).color,
          imageSrc: getEdgeColorIconSrc(colorKey),
        }))}
        selectedId={config.edgeColor}
        onSelect={handleEdgeSelect}
      />
    </ConfiguratorV2SectionShell>
  )
}
