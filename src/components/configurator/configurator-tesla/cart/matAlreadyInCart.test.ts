import { describe, expect, it } from "vitest"
import type { ConfiguratorState } from "@/features/car-configurator/utils/configuratorState"
import type { CartItem } from "@/lib/types/cart-new"
import { findMatchingMatInCart } from "./matAlreadyInCart"

const config = {
  brand: "Toyota",
  model: "Corolla",
  year: "2020",
  bodyTypeKey: "hatchback",
  matType: "3d-with-rims",
  variant: "premium",
  structure: "diamonds",
  color: "black",
  edgeColor: "black",
} as ConfiguratorState

const mat = (productId: string): CartItem => ({
  id: "line-1",
  quantity: 1,
  unitPrice: 100,
  subtotal: 100,
  productType: "mat",
  productId,
  productName: "Dywaniki",
  configuration: {
    carDetails: {
      brand: "Toyota",
      model: "Corolla",
      year: "2020",
      bodyType: "Hatchback",
      bodyTypeKey: "hatchback",
    },
    setType: "3d-with-rims",
    setVariant: "premium",
    cellType: "diamonds",
    materialColor: "black",
    edgeColor: "black",
    pricing: {
      pricingCategoryKey: "passenger_car",
      catalogVersionCode: "v1",
      basePrice: 100,
      priceAfterDiscount: 100,
      totalPrice: 100,
    },
  },
})

describe("findMatchingMatInCart", () => {
  it("matches an existing mat even when the product id is new", () => {
    expect(findMatchingMatInCart([mat("old-id")], config)?.productId).toBe("old-id")
  })

  it("does not match a different variant", () => {
    expect(findMatchingMatInCart([mat("old-id")], { ...config, variant: "basic" })).toBeNull()
  })
})
