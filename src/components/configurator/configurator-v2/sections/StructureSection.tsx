"use client"

import Image from "next/image"
import type { SectionReadiness } from "@/features/car-configurator/adapters/configuratorV2SectionMapper"
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
}: StructureSectionProps) => (
  <ConfiguratorV2SectionShell
    id="section-structure"
    title="Struktura komórek"
    subtitle="W zestawie — wybierz wzór powierzchni"
    readiness={readiness}
  >
    <div className="flex gap-4">
      {structures.map((structure) => {
        const isSelected = config.structure === structure.id
        return (
          <button
            key={structure.id}
            type="button"
            onClick={() => onUpdate({ structure: structure.id })}
            aria-label={structure.name}
            aria-pressed={isSelected}
            className={`flex flex-col items-center gap-2 p-3 rounded-full border-2 transition-all ${
              isSelected
                ? "border-red-500 ring-2 ring-red-500/30"
                : "border-white/20 hover:border-white/40"
            }`}
          >
            <div className="w-14 h-14 rounded-full overflow-hidden bg-white/5">
              <Image
                src={structure.image}
                alt=""
                width={56}
                height={56}
                className="object-cover w-full h-full"
              />
            </div>
            <span className="text-xs text-gray-300 text-center max-w-[80px]">
              {structure.name}
            </span>
          </button>
        )
      })}
    </div>
  </ConfiguratorV2SectionShell>
)
