"use client"

import type { ConfiguratorState } from "@/features/car-configurator/utils/configuratorState"
import { SummaryStep } from "@/components/configurator/configurator-simple/SummaryStep"
import { ConfiguratorV2SectionShell } from "./ConfiguratorV2SectionShell"

type SummaryPriceBreakdown = {
  basePrice: number
  discount: number
  shippingCost: number
  totalPrice: number
}

type SummarySectionProps = {
  config: ConfiguratorState
  priceBreakdown: SummaryPriceBreakdown
  isAddingToCart: boolean
  onPrevious: () => void
  onAddToCart: () => void
}

export const SummarySection = ({
  config,
  priceBreakdown,
  isAddingToCart,
  onPrevious,
  onAddToCart,
}: SummarySectionProps) => (
  <ConfiguratorV2SectionShell
    id="section-summary"
    title="Podsumowanie zamówienia"
    readiness={{ isComplete: true, isDisabled: false }}
  >
    <SummaryStep
      config={config}
      priceBreakdown={priceBreakdown}
      onPrevious={onPrevious}
      onAddToCart={onAddToCart}
      isAddingToCart={isAddingToCart}
    />
  </ConfiguratorV2SectionShell>
)
