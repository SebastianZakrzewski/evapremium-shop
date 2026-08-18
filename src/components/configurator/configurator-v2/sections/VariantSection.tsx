"use client"

import type { PricingVariantOption } from "@/features/vehicle-catalog/model/schemas"
import type { SectionReadiness } from "@/features/car-configurator/adapters/configuratorV2SectionMapper"
import { getVariantPresentation } from "@/components/configurator/configurator-simple/variantPresentation"
import { ConfiguratorV2ImageOptionCard, CONFIGURATOR_V2_IMAGE_CARD_MIN_WIDTH } from "../ui/ConfiguratorV2ImageOptionCard"
import { ConfiguratorV2SectionShell } from "./ConfiguratorV2SectionShell"
import { VariantTunnelBonusNotice } from "../variant/VariantTunnelBonusNotice"
import { shouldShowVariantTunnelBonus } from "../variant/variantTunnelBonus"

const compareLinkClass =
  "text-xs text-gray-400 hover:text-white underline-offset-2 hover:underline whitespace-nowrap transition-colors"

type VariantSectionProps = {
  config: { variant: string }
  pricingVariants: PricingVariantOption[]
  pricingCategoryKey?: string
  bodyTypeKey?: string
  readiness: SectionReadiness
  onUpdate: (updates: { variant?: string }) => void
  onCompareClick?: () => void
}

export const VariantSection = ({
  config,
  pricingVariants,
  pricingCategoryKey,
  bodyTypeKey,
  readiness,
  onUpdate,
  onCompareClick,
}: VariantSectionProps) => {
  const selectedVariant = pricingVariants.find((v) => v.key === config.variant)
  const offeredVariantKeys = pricingVariants.map((item) => item.key)
  const selectedPresentation = selectedVariant
    ? getVariantPresentation(
        selectedVariant.key,
        pricingCategoryKey,
        bodyTypeKey,
        { offeredVariantKeys },
      )
    : null
  const showTunnelBonus = shouldShowVariantTunnelBonus(pricingCategoryKey)

  return (
    <ConfiguratorV2SectionShell
      id="section-variant"
      title="Wariant zestawu"
      selectedLabel={selectedPresentation?.name ?? selectedVariant?.label}
      readiness={readiness}
      headerAction={
        onCompareClick ? (
          <button type="button" onClick={onCompareClick} className={compareLinkClass}>
            Porównaj warianty
          </button>
        ) : undefined
      }
    >
      <div
        className="grid gap-2 justify-items-center"
        style={{
          gridTemplateColumns: `repeat(auto-fill, minmax(${CONFIGURATOR_V2_IMAGE_CARD_MIN_WIDTH}, 1fr))`,
        }}
      >
        {pricingVariants.map((variant) => {
          const presentation = getVariantPresentation(
            variant.key,
            pricingCategoryKey,
            bodyTypeKey,
            { offeredVariantKeys },
          )
          return (
            <ConfiguratorV2ImageOptionCard
              key={variant.key}
              selected={config.variant === variant.key}
              title={presentation.name ?? variant.label}
              description={presentation.description}
              imageSrc={presentation.image}
              basePrice={variant.basePrice}
              priceAfterDiscount={variant.priceAfterDiscount}
              discount={variant.discount}
              onSelect={() => onUpdate({ variant: variant.key })}
            />
          )
        })}
      </div>
      {showTunnelBonus && pricingVariants.length > 0 && (
        <VariantTunnelBonusNotice />
      )}
      {pricingVariants.length === 0 && (
        <p role="status" className="text-sm text-gray-400">
          Wybierz typ dywaników, aby zobaczyć dostępne warianty.
        </p>
      )}
    </ConfiguratorV2SectionShell>
  )
}
