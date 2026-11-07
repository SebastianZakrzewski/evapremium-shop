import type { ConfiguratorState } from "@/features/car-configurator/utils/configuratorState"
import type { AddToCartDTO } from "@/lib/types/cart-new"
import { formatBrandDisplayName } from "@/shared/vehicle/displayLabels"

export type MatCartPrice = {
  basePrice: number
  priceAfterDiscount: number
  totalPrice: number
}

export const buildMatCartPayload = ({
  config,
  price,
  productId,
  productImage,
  setVariantLabel,
}: {
  config: ConfiguratorState
  price: MatCartPrice
  productId: string
  productImage: string
  setVariantLabel: string
}): AddToCartDTO => ({
  productType: "mat",
  productId,
  quantity: 1,
  unitPrice: price.totalPrice,
  productName: `Dywaniki ${formatBrandDisplayName(config.brand)} ${config.model}`,
  productSku: `MAT-${config.brand.toUpperCase()}-${config.model.toUpperCase()}`,
  productImage,
  configuration: {
    carDetails: {
      brand: config.brand,
      brandKey: config.brandKey,
      model: config.model,
      modelFamilyKey: config.modelFamilyKey,
      modelKey: config.modelKey,
      generation: config.generation,
      year: config.year,
      gearbox: config.gearbox || undefined,
      bodyType: config.bodyType,
      bodyTypeKey: config.bodyTypeKey,
      recordKey: config.recordKey,
      templateId: config.templateId,
    },
    pricing: {
      pricingCategoryKey: config.pricingCategoryKey,
      catalogVersionCode: config.catalogVersionCode,
      basePrice: price.basePrice,
      priceAfterDiscount: price.priceAfterDiscount,
      totalPrice: price.totalPrice,
    },
    setType: config.matType,
    setVariant: config.variant,
    setVariantLabel,
    cellType: config.structure,
    materialColor: config.color,
    edgeColor: config.edgeColor,
  },
})
