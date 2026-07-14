"use client"

import type { SectionReadiness } from "@/features/car-configurator/adapters/configuratorV2SectionMapper"
import { ConfiguratorV2ImageOptionCard } from "../ui/ConfiguratorV2ImageOptionCard"
import { ConfiguratorV2SectionShell } from "./ConfiguratorV2SectionShell"

const structures = [
  {
    id: "diamonds" as const,
    name: "Romby",
    description: "Klasyczny wygląd",
    image: "/images/konfigurator/struktura komorek/romby.png",
  },
  {
    id: "honey" as const,
    name: "Plaster miodu",
    description: "Nowoczesny design",
    image: "/images/konfigurator/struktura komorek/plaster.png",
  },
]

type StructureSectionProps = {
  config: { structure: "diamonds" | "honey" }
  readiness: SectionReadiness
  onUpdate: (updates: { structure?: "diamonds" | "honey" }) => void
}

export const StructureSection = ({
  config,
  readiness,
  onUpdate,
}: StructureSectionProps) => {
  const selected = structures.find((s) => s.id === config.structure)

  return (
    <ConfiguratorV2SectionShell
      id="section-structure"
      title="Struktura komórek"
      selectedLabel={selected?.name}
      included
      readiness={readiness}
    >
      <div
        className="inline-flex max-w-full flex-wrap items-stretch gap-2 rounded-xl border border-white/8 bg-white/[0.02] p-2"
        role="group"
        aria-label="Wybór struktury komórek"
      >
        {structures.map((structure) => (
          <ConfiguratorV2ImageOptionCard
            key={structure.id}
            inline
            selected={config.structure === structure.id}
            title={structure.name}
            description={structure.description}
            imageSrc={structure.image}
            imageAlt={structure.name}
            onSelect={() => onUpdate({ structure: structure.id })}
          />
        ))}
      </div>
    </ConfiguratorV2SectionShell>
  )
}
