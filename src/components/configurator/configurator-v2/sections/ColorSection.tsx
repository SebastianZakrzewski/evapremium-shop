"use client"

import { useMemo } from "react"
import { getAvailableMaterialColorsForEdge, getColorInfo } from "@/lib/color-mapping"
import type { SectionReadiness } from "@/features/car-configurator/adapters/configuratorV2SectionMapper"
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
      subtitle={
        config.color
          ? getColorInfo(config.color).name
          : "W zestawie — wybierz kolor dywanika"
      }
      readiness={readiness}
    >
      <div className="flex flex-wrap gap-3">
        {availableColors.map((colorKey) => {
          const colorInfo = getColorInfo(colorKey)
          const isSelected = config.color === colorKey
          return (
            <button
              key={colorKey}
              type="button"
              onClick={() => onUpdate({ color: colorKey })}
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
