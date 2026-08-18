"use client"

import { Button } from "@/components/ui/button"
import type { PricingVariantOption } from "@/features/vehicle-catalog/model/schemas"
import { LowestPrice30DaysNotice } from "./LowestPrice30DaysNotice"

import { getVariantPresentation } from "./variantPresentation"
import { VariantOptionCard } from "./VariantOptionCard"

type VariantStepProps = {
  config: { variant: string }
  pricingVariants?: PricingVariantOption[]
  pricingCategoryKey?: string
  bodyTypeKey?: string
  onUpdate: (updates: { variant?: string }) => void
  onNext: () => void
  onPrevious: () => void
  priceBreakdown?: {
    basePrice: number
    priceAfterDiscount: number
    totalPrice: number
  }
}

export const VariantStep = ({
  config,
  pricingVariants = [],
  pricingCategoryKey,
  bodyTypeKey,
  onUpdate,
  onNext,
  onPrevious,
  priceBreakdown,
}: VariantStepProps) => (
  <div className="space-y-3">
    <div className="grid grid-cols-2 items-stretch gap-2 md:grid-cols-3 md:gap-3 xl:grid-cols-4">
      {pricingVariants.map((variant) => {
        const presentation = getVariantPresentation(
          variant.key,
          pricingCategoryKey,
          bodyTypeKey,
          { offeredVariantKeys: pricingVariants.map((item) => item.key) },
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

    <LowestPrice30DaysNotice
      priceAfterDiscount={priceBreakdown?.priceAfterDiscount}
      regularPrice={priceBreakdown?.basePrice}
    />

    <div className="flex flex-col justify-end gap-2 pt-3 sm:flex-row">
      <Button type="button" onClick={onPrevious} variant="outline">
        Wstecz
      </Button>
      <Button
        type="button"
        onClick={onNext}
        disabled={!config.variant}
        className="bg-red-600 hover:bg-red-700"
      >
        Dalej
      </Button>
    </div>
  </div>
)
