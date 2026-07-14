"use client"

import type { ConfiguratorState } from "@/features/car-configurator/utils/configuratorState"
import type { ProductEntryLock } from "@/features/car-configurator/utils/productEntryContext"
import type { SectionReadiness } from "@/features/car-configurator/adapters/configuratorV2SectionMapper"
import { CarSelectionStep } from "@/components/configurator/configurator-simple/CarSelectionStep"
import { LockedCarContextStep } from "@/components/configurator/configurator-simple/LockedCarContextStep"
import { ConfiguratorV2SectionShell } from "./ConfiguratorV2SectionShell"

type VehicleContextSectionProps = {
  config: ConfiguratorState
  productEntry: ProductEntryLock
  readiness: SectionReadiness
  onUpdate: (updates: Partial<ConfiguratorState>) => void
}

const noop = () => {}

export const VehicleContextSection = ({
  config,
  productEntry,
  readiness,
  onUpdate,
}: VehicleContextSectionProps) => (
  <ConfiguratorV2SectionShell
    id="section-vehicle"
    title={productEntry.isLocked ? "Twój samochód" : "Wybór samochodu"}
    readiness={readiness}
  >
    {productEntry.isLocked ? (
      <LockedCarContextStep
        config={config}
        productEntry={productEntry}
        onUpdate={onUpdate}
        onNext={noop}
        hideNextButton
      />
    ) : (
      <CarSelectionStep
        config={config}
        onUpdate={onUpdate}
        onNext={noop}
        hideNextButton
      />
    )}
  </ConfiguratorV2SectionShell>
)
