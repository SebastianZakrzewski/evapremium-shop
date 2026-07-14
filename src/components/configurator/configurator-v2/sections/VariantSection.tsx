"use client"

import type { PricingVariantOption } from "@/features/vehicle-catalog/model/schemas"
import type { SectionReadiness } from "@/features/car-configurator/adapters/configuratorV2SectionMapper"
import { VariantOptionCard } from "@/components/configurator/configurator-simple/VariantOptionCard"
import { getVariantPresentation } from "@/components/configurator/configurator-simple/variantPresentation"
import { ConfiguratorV2SectionShell } from "./ConfiguratorV2SectionShell"

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
}: VariantSectionProps) => (
  <ConfiguratorV2SectionShell
    id="section-variant"
    title="Wariant zestawu"
    subtitle="Wybierz rozmiar kompletu dywaników"
    readiness={readiness}
    headerAction={
      onCompareClick ? (
        <button
          type="button"
          onClick={onCompareClick}
          className="text-xs text-red-400 hover:text-red-300 underline-offset-2 hover:underline whitespace-nowrap"
        >
          Porównaj warianty
        </button>
      ) : undefined
    }
  >
    <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3">
      {pricingVariants.map((variant) => {
        const presentation = getVariantPresentation(
          variant.key,
          pricingCategoryKey,
          bodyTypeKey,
        )
        return (
          <VariantOptionCard
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
    {pricingVariants.length === 0 && (
      <p role="status" className="text-sm text-gray-400">
        Wybierz typ dywaników, aby zobaczyć dostępne warianty.
      </p>
    )}
  </ConfiguratorV2SectionShell>
)
