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
  stickyMobileActions?: boolean
}

export const SummarySection = ({
  config,
  priceBreakdown,
  isAddingToCart,
  cartActionError,
  onPrevious,
  onAddToCart,
  vehiclePreviewImage = null,
  stickyMobileActions = true,
}: SummarySectionProps) => (
  <ConfiguratorV2SectionShell
    id="section-summary"
    headingId="summary-order-heading"
    title="Podsumowanie zamówienia"
    readiness={{ isComplete: true, isDisabled: false }}
  >
    <div className="rounded-2xl bg-black p-3 text-white">
    <SummaryStep
      config={config}
      priceBreakdown={priceBreakdown}
      onPrevious={onPrevious}
      onAddToCart={onAddToCart}
      isAddingToCart={isAddingToCart}
      cartActionError={cartActionError}
      stickyMobileActions={stickyMobileActions}
      vehiclePreviewImage={vehiclePreviewImage}
    />
    </div>
  </ConfiguratorV2SectionShell>
)
