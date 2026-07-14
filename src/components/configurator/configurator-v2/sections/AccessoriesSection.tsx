"use client"

import type { ConfiguratorState } from "@/features/car-configurator/utils/configuratorState"
import type { SectionReadiness } from "@/features/car-configurator/adapters/configuratorV2SectionMapper"
import { AccessoriesStep } from "@/components/configurator/configurator-simple/AccessoriesStep"
import { ConfiguratorV2SectionShell } from "./ConfiguratorV2SectionShell"

type AccessoriesSectionProps = {
  config: ConfiguratorState
  readiness: SectionReadiness
  onUpdate: (updates: Partial<ConfiguratorState>) => void
  onProductModalOpenChange?: (isOpen: boolean) => void
}

const noop = () => {}

export const AccessoriesSection = ({
  config,
  readiness,
  onUpdate,
  onProductModalOpenChange,
}: AccessoriesSectionProps) => (
  <ConfiguratorV2SectionShell
    id="section-accessories"
    title="Akcesoria"
    subtitle="Opcjonalne podpiętki i dodatki"
    readiness={readiness}
  >
    <AccessoriesStep
      config={config}
      onUpdate={onUpdate}
      onNext={noop}
      onPrevious={noop}
      onProductModalOpenChange={onProductModalOpenChange}
    />
  </ConfiguratorV2SectionShell>
)
