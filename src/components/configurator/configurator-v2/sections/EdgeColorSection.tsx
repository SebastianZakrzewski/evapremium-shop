"use client"

import { useMemo } from "react"
import {
  getAvailableColors,
  getAvailableMaterialColorsForEdge,
  getColorInfo,
} from "@/lib/color-mapping"
import type { SectionReadiness } from "@/features/car-configurator/adapters/configuratorV2SectionMapper"
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
      subtitle={
        config.edgeColor
          ? getColorInfo(config.edgeColor).name
          : "Wnętrze — wybierz kolor obrzeża"
      }
      readiness={readiness}
    >
      <div className="flex flex-wrap gap-3">
        {availableEdgeColors.map((colorKey) => {
          const colorInfo = getColorInfo(colorKey)
          const isSelected = config.edgeColor === colorKey
          return (
            <button
              key={colorKey}
              type="button"
              onClick={() => handleEdgeSelect(colorKey)}
              aria-label={colorInfo.name}
              aria-pressed={isSelected}
              title={colorInfo.name}
              className={`w-10 h-10 rounded-full border-2 transition-all ${
                isSelected
                  ? "border-red-500 ring-2 ring-red-500/40 scale-110"
                  : "border-white/20 hover:border-white/40"
              }`}
              style={{ backgroundColor: colorInfo.color }}
            />
          )
        })}
      </div>
    </ConfiguratorV2SectionShell>
  )
}
