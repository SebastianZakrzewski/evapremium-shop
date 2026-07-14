"use client"

import { Card } from "@/components/ui/card"
import type { SectionReadiness } from "@/features/car-configurator/adapters/configuratorV2SectionMapper"
import { ConfiguratorV2SectionShell } from "./ConfiguratorV2SectionShell"

const matTypes = [
  {
    id: "3d-with-rims" as const,
    name: "3D z rantami",
    description: "Wysokie ranty chroniące przed brudem",
  },
  {
    id: "classic" as const,
    name: "3D bez rantów",
    description: "Standardowe dywaniki bez wysokich rantów",
  },
]

type MatTypeSectionProps = {
  config: { matType: "3d-with-rims" | "classic" | "single" }
  skipMatTypeStep: boolean
  readiness: SectionReadiness
  onUpdate: (updates: {
    matType?: "3d-with-rims" | "classic" | "single"
    variant?: string
  }) => void
  onCompareClick?: () => void
}

export const MatTypeSection = ({
  config,
  skipMatTypeStep,
  readiness,
  onUpdate,
  onCompareClick,
}: MatTypeSectionProps) => {
  if (skipMatTypeStep) {
    return (
      <ConfiguratorV2SectionShell
        id="section-matType"
        title="Typ dywanika"
        subtitle="Dla tego pojazdu dostępny jest jeden typ kompletu"
        readiness={{ ...readiness, isDisabled: false }}
      >
        <p className="text-sm text-gray-400">Komplet pojedynczy — przejdź do wyboru wariantu.</p>
      </ConfiguratorV2SectionShell>
    )
  }

  return (
    <ConfiguratorV2SectionShell
      id="section-matType"
      title="Typ dywanika"
      subtitle="Wybierz wersję dopasowaną do Twoich potrzeb"
      readiness={readiness}
      headerAction={
        onCompareClick ? (
          <button
            type="button"
            onClick={onCompareClick}
            className="text-xs text-red-400 hover:text-red-300 underline-offset-2 hover:underline whitespace-nowrap"
          >
            Wyświetl i porównaj funkcje
          </button>
        ) : undefined
      }
    >
      <div className="space-y-2">
        {matTypes.map((type) => {
          const isSelected = config.matType === type.id
          return (
            <Card
              key={type.id}
              onClick={() => onUpdate({ matType: type.id, variant: "" })}
              className={`p-4 cursor-pointer transition-all duration-200 border ${
                isSelected
                  ? "border-red-500 bg-red-500/10 ring-1 ring-red-500/40"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-white">{type.name}</h3>
                  <p className="text-sm text-gray-400 mt-0.5">{type.description}</p>
                </div>
                {isSelected && (
                  <span className="text-xs text-red-400 font-medium shrink-0">Wybrane</span>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </ConfiguratorV2SectionShell>
  )
}
