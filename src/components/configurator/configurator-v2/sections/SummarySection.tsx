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
  cartActionError?: string | null
  onPrevious: () => void
  onAddToCart: () => void
  vehiclePreviewImage?: string | null
}

export const SummarySection = ({
  config,
  priceBreakdown,
  isAddingToCart,
  cartActionError,
  onPrevious,
  onAddToCart,
  vehiclePreviewImage = null,
}: SummarySectionProps) => (
  <ConfiguratorV2SectionShell
    id="section-summary"
    headingId="summary-order-heading"
    title="Podsumowanie zamówienia"
    readiness={{ isComplete: true, isDisabled: false }}
  >
    <SummaryStep
      config={config}
      priceBreakdown={priceBreakdown}
      onPrevious={onPrevious}
      onAddToCart={onAddToCart}
      isAddingToCart={isAddingToCart}
      cartActionError={cartActionError}
      stickyMobileActions
      vehiclePreviewImage={vehiclePreviewImage}
    />
  </ConfiguratorV2SectionShell>
)
