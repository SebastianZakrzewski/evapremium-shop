"use client"

import { useEffect } from "react"
import Image from "next/image"
import { X } from "lucide-react"
import type { PricingVariantOption } from "@/features/vehicle-catalog/model/schemas"
import { getVariantPresentation } from "@/components/configurator/configurator-simple/variantPresentation"
import { formatPricePln } from "@/lib/utils/formatPrice"

type CompareVariantsModalProps = {
  isOpen: boolean
  onClose: () => void
  pricingVariants: PricingVariantOption[]
  pricingCategoryKey?: string
  bodyTypeKey?: string
  selectedVariantKey?: string
  onSelectVariant?: (key: string) => void
}

export const CompareVariantsModal = ({
  isOpen,
  onClose,
  pricingVariants,
  pricingCategoryKey,
  bodyTypeKey,
  selectedVariantKey,
  onSelectVariant,
}: CompareVariantsModalProps) => {
  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      role="dialog"
      aria-modal="true"
      aria-labelledby="compare-variants-title"
      onClick={onClose}
    >
      <div
        className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-y-auto p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 id="compare-variants-title" className="text-xl font-bold text-white">
            Porównaj warianty zestawu
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg"
            aria-label="Zamknij"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {pricingVariants.length === 0 ? (
          <p className="text-sm text-gray-400">Brak wariantów do porównania.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pricingVariants.map((variant) => {
              const presentation = getVariantPresentation(
                variant.key,
                pricingCategoryKey,
                bodyTypeKey,
                { offeredVariantKeys: pricingVariants.map((item) => item.key) },
              )
              const isSelected = selectedVariantKey === variant.key
              return (
                <button
                  key={variant.key}
                  type="button"
                  onClick={() => {
                    onSelectVariant?.(variant.key)
                    onClose()
                  }}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    isSelected
                      ? "border-red-500 bg-red-500/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="relative w-full aspect-square mb-3 rounded-lg overflow-hidden bg-black/30">
                    <Image
                      src={presentation.image}
                      alt=""
                      fill
                      className="object-contain p-2"
                      sizes="120px"
                    />
                  </div>
                  <h3 className="font-semibold text-white text-sm">
                    {presentation.name ?? variant.label}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">{presentation.description}</p>
                  <p className="text-sm font-bold text-green-400 mt-2">
                    {formatPricePln(variant.priceAfterDiscount)}
                  </p>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
