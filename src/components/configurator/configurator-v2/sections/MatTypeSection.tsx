"use client"

import type { SectionReadiness } from "@/features/car-configurator/adapters/configuratorV2SectionMapper"
import { TeslaTrimOption } from "../ui/TeslaTrimOption"
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

const compareLinkClass =
  "text-xs text-gray-400 hover:text-white underline-offset-2 hover:underline whitespace-nowrap transition-colors"

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
        readiness={{ ...readiness, isDisabled: false }}
      >
        <p className="text-sm text-gray-400">
          Komplet pojedynczy — przejdź do wyboru wariantu.
        </p>
      </ConfiguratorV2SectionShell>
    )
  }

  const selectedType = matTypes.find((t) => t.id === config.matType)

  return (
    <ConfiguratorV2SectionShell
      id="section-matType"
      title="Typ dywanika"
      selectedLabel={selectedType?.name}
      readiness={readiness}
      headerAction={
        onCompareClick ? (
          <button type="button" onClick={onCompareClick} className={compareLinkClass}>
            Wyświetl i porównaj funkcje
          </button>
        ) : undefined
      }
    >
      <div className="space-y-2">
        {matTypes.map((type) => (
          <TeslaTrimOption
            key={type.id}
            selected={config.matType === type.id}
            title={type.name}
            subtitle={type.description}
            onSelect={() => onUpdate({ matType: type.id, variant: "" })}
          />
        ))}
      </div>
    </ConfiguratorV2SectionShell>
  )
}
