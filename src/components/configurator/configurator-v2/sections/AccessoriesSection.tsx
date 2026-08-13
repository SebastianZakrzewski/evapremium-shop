"use client"

import type { ConfiguratorState } from "@/features/car-configurator/utils/configuratorState"
import type { SectionReadiness } from "@/features/car-configurator/adapters/configuratorV2SectionMapper"
import { AccessoriesStep } from "@/components/configurator/configurator-simple/AccessoriesStep"
import { ConfiguratorV2SectionShell } from "./ConfiguratorV2SectionShell"

type AccessoriesSectionProps = {
  config: ConfiguratorState
  readiness: SectionReadiness
  onUpdate: (updates: Partial<ConfiguratorState>) => void
  onNext: () => void
  onPrevious: () => void
  canProceedToSummary?: boolean
  onProductModalOpenChange?: (isOpen: boolean) => void
}

export const AccessoriesSection = ({
  config,
  readiness,
  onUpdate,
  onNext,
  onPrevious,
  canProceedToSummary = true,
  onProductModalOpenChange,
}: AccessoriesSectionProps) => (
  <ConfiguratorV2SectionShell
    id="section-accessories"
    title="Akcesoria"
    readiness={readiness}
  >
    <AccessoriesStep
      config={config}
      onUpdate={onUpdate}
      onNext={onNext}
      onPrevious={onPrevious}
      canProceedToSummary={canProceedToSummary}
      nextLabel="Podsumowanie zamówienia"
      onProductModalOpenChange={onProductModalOpenChange}
    />
  </ConfiguratorV2SectionShell>
)
