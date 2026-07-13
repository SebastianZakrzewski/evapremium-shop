"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { PricingVariantOption } from "@/features/vehicle-catalog/model/schemas"
import { LowestPrice30DaysNotice } from "./LowestPrice30DaysNotice"

import { getVariantPresentation } from "./variantPresentation"
import { VariantOptionCard } from "./VariantOptionCard"

type MatTypeVariantStepProps = {
  config: {
    matType: "3d-with-rims" | "classic" | "single"
    variant: string
  }
  pricingVariants?: PricingVariantOption[]
  pricingCategoryKey?: string
  bodyTypeKey?: string
  skipMatTypeStep?: boolean
  onUpdate: (updates: {
    matType?: "3d-with-rims" | "classic" | "single"
    variant?: string
  }) => void
  onNext: () => void
  onPrevious: () => void
  priceBreakdown?: {
    basePrice: number
    priceAfterDiscount: number
    totalPrice: number
  }
}

const matTypes = [
  {
    id: "3d-with-rims" as const,
    name: "3D z rantami",
    description: "Wysokie ranty chroniące przed brudem",
  },
  {
    id: "classic" as const,
    name: "3D bez rantów",
    description: "Standardowe bez wysokich rantów",
  },
]

export function MatTypeVariantStep({
  config,
  pricingVariants = [],
  pricingCategoryKey,
  bodyTypeKey,
  skipMatTypeStep = false,
  onUpdate,
  onNext,
  onPrevious,
  priceBreakdown,
}: MatTypeVariantStepProps) {
  const canProceed = Boolean(
    (skipMatTypeStep || config.matType) && config.variant,
  )

  return (
    <div className="space-y-3">
      {!skipMatTypeStep && (
        <div>
          <h3 className="mb-1.5 text-sm font-semibold text-white">Typ dywaników</h3>
          <div className="grid grid-cols-1 items-stretch gap-2 md:grid-cols-2 md:gap-3">
            {matTypes.map((type) => (
              <Card
                key={type.id}
                onClick={() => onUpdate({ matType: type.id, variant: "" })}
                className={`flex min-h-[72px] cursor-pointer flex-col justify-center rounded-xl p-2.5 transition-all duration-300 active:scale-[0.98] md:min-h-[80px] md:p-3 ${
                  config.matType === type.id
                    ? "scale-[1.01] border-red-500 bg-red-500/10 shadow-md shadow-red-500/10 ring-2 ring-red-500/30"
                    : "border-white/10 bg-[#111] hover:border-white/20 hover:bg-white/5"
                }`}
              >
                <h4 className="text-sm font-semibold leading-snug text-white">
                  {type.name}
                </h4>
                <p className="mt-1 text-xs leading-snug text-gray-200">
                  {type.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {skipMatTypeStep && (
        <p className="text-sm text-gray-400">
          Dla tego pojazdu obowiązuje jeden typ kompletu — przejdź do wyboru wariantu.
        </p>
      )}

      {(skipMatTypeStep || config.matType) && (
        <div>
          <h3 className="mb-1.5 text-sm font-semibold text-white/90">
            Wariant zestawu
          </h3>
          <div className="grid grid-cols-2 items-stretch gap-2 md:grid-cols-3 md:gap-3 xl:grid-cols-4">
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
              Ładowanie wariantów cenowych…
            </p>
          )}

          <LowestPrice30DaysNotice
            priceAfterDiscount={priceBreakdown?.priceAfterDiscount}
            regularPrice={priceBreakdown?.basePrice}
          />
        </div>
      )}

      <div className="flex flex-col justify-end gap-3 pt-4 sm:flex-row">
        <Button
          type="button"
          onClick={onPrevious}
          variant="outline"
          className="flex-1 border-white/10 hover:bg-white/5 sm:flex-initial"
        >
          Wstecz
        </Button>
        <Button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 sm:w-auto"
        >
          Dalej
        </Button>
      </div>
    </div>
  )
}
