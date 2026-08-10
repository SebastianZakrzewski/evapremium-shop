import { beforeEach, describe, expect, it, vi } from "vitest"
import { CartService } from "../CartService"
import type { Cart } from "../../types/cart-new"

const getAccessoryById = vi.fn()

vi.mock("../AccessoryService", () => ({
  AccessoryService: vi.fn().mockImplementation(() => ({
    getAccessoryById,
  })),
}))

vi.mock("../MatService", () => ({
  MatService: vi.fn().mockImplementation(() => ({})),
}))

vi.mock("../PricingService", () => ({
  PricingService: vi.fn().mockImplementation(() => ({})),
}))

describe("CartService accessory mounting surcharge", () => {
  let cartService: CartService
  let emptyCart: Cart

  beforeEach(() => {
    vi.clearAllMocks()
    cartService = new CartService()
    emptyCart = {
      items: [],
      subtotal: 0,
      shippingCost: 0,
      tax: 0,
      discount: 0,
      total: 0,
      itemCount: 0,
    }
    getAccessoryById.mockResolvedValue({
      id: "podpietka-1",
      name: "Podpiętka gumowa",
      sku: "POD-GUM",
      price: 50,
      imageSrc: "/pod.webp",
      inStock: true,
    })
  })

  it("adds 10 zł when accessory configuration has professional mounting", async () => {
    const cart = await cartService.addToCart(emptyCart, {
      productType: "accessory",
      productId: "podpietka-1",
      quantity: 1,
      configuration: {
        color: "Czarny",
        mounting: "professional",
      },
    })

    expect(cart.items).toHaveLength(1)
    expect(cart.items[0].unitPrice).toBe(60)
    expect(cart.items[0].subtotal).toBe(60)
    expect(cart.items[0].configuration).toEqual({
      color: "Czarny",
      mounting: "professional",
    })
  })

  it("keeps base price for self mounting", async () => {
    const cart = await cartService.addToCart(emptyCart, {
      productType: "accessory",
      productId: "podpietka-1",
      quantity: 1,
      configuration: {
        mounting: "self",
      },
    })

    expect(cart.items[0].unitPrice).toBe(50)
  })

  it("ignores client unitPrice and uses DB price plus mounting fee", async () => {
    const cart = await cartService.addToCart(emptyCart, {
      productType: "accessory",
      productId: "podpietka-1",
      quantity: 1,
      unitPrice: 999,
      configuration: {
        mounting: "professional",
      },
    })

    expect(cart.items[0].unitPrice).toBe(60)
  })
})
