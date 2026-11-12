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
    className="flex min-h-0 min-w-0 max-w-full flex-1 flex-col"
    panelClassName="flex min-h-0 min-w-0 max-w-full flex-1 flex-col"
  >
    <div
      data-testid="summary-surface"
      className="flex min-h-full w-full min-w-0 max-w-full flex-1 flex-col overflow-x-hidden rounded-2xl bg-[#FFFFFF] p-3 text-neutral-950"
    >
    <SummaryStep
      config={config}
      priceBreakdown={priceBreakdown}
      onPrevious={onPrevious}
      onAddToCart={onAddToCart}
      isAddingToCart={isAddingToCart}
      cartActionError={cartActionError}
      stickyMobileActions={stickyMobileActions}
      vehiclePreviewImage={vehiclePreviewImage}
      surface="light"
    />
    </div>
  </ConfiguratorV2SectionShell>
)
