import type { PricingVariantOption } from "../model/schemas"

export const resolveSelectedPricingVariant = (
  variants: PricingVariantOption[] | undefined,
  variantKey: string | undefined,
): PricingVariantOption | null => {
  if (!variantKey || !variants?.length) return null
  return variants.find((variant) => variant.key === variantKey) ?? null
}
