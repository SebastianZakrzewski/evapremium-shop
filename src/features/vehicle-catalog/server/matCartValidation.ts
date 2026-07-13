import "server-only"
import { resolveVehiclePricing } from "./pricingService"
import {
  CatalogMatConfigurationSchema,
  type CatalogMatConfiguration,
  type MatConfiguration,
} from "../model/matConfiguration"
import { resolveBitrixSnapshots } from "./bitrixMappingService"

const PRICE_TOLERANCE_PLN = 0.01

const toPricingMatType = (
  setType: MatConfiguration["setType"],
): "classic" | "3d-with-rims" | "single" => {
  if (setType === "classic") return "classic"
  if (setType === "single") return "single"
  return "3d-with-rims"
}

export class MatCartValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "MatCartValidationError"
  }
}

export const revalidateMatItemPrice = async (
  configuration: unknown,
  clientUnitPrice: number,
): Promise<CatalogMatConfiguration> => {
  const parsed = CatalogMatConfigurationSchema.safeParse(configuration)
  if (!parsed.success) {
    throw new MatCartValidationError(
      "Niekompletna konfiguracja pojazdu — wybierz pojazd ponownie w konfiguratorze",
    )
  }

  const config = parsed.data
  const pricing = await resolveVehiclePricing({
    recordKey: config.carDetails.recordKey,
    year: Number(config.carDetails.year),
    bodyTypeKey: config.carDetails.bodyTypeKey,
    matType: toPricingMatType(config.setType),
    variantKey: config.setVariant,
  })

  const selectedVariant = pricing.selectedVariant
  if (!selectedVariant) {
    throw new MatCartValidationError(
      "Wybrany wariant nie jest dostępny w aktualnym cenniku",
    )
  }

  const serverPrice = selectedVariant.priceAfterDiscount
  if (Math.abs(serverPrice - clientUnitPrice) > PRICE_TOLERANCE_PLN) {
    throw new MatCartValidationError(
      `Cena uległa zmianie (${clientUnitPrice} → ${serverPrice} PLN). Odśwież konfigurację.`,
    )
  }

  const bitrix = await resolveBitrixSnapshots({
    pricingCategoryKey: pricing.pricingCategoryKey,
    setType: config.setType,
    variantKey: config.setVariant,
  })

  return {
    ...config,
    pricing: {
      pricingCategoryKey: pricing.pricingCategoryKey,
      catalogVersionCode: pricing.catalogVersionCode,
      basePrice: selectedVariant.basePrice,
      priceAfterDiscount: selectedVariant.priceAfterDiscount,
      totalPrice: selectedVariant.priceAfterDiscount,
    },
    bitrix,
  }
}
