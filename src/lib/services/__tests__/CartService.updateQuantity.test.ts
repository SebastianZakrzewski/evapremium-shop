import { describe, expect, it } from "vitest"
import { CartService } from "../CartService"
import type { Cart } from "../../types/cart-new"

describe("CartService.updateQuantity", () => {
  it("returns a new cart so a quantity change can be saved", async () => {
    const service = new CartService()
    const cart: Cart = {
      items: [
        {
          id: "line-1",
          productType: "mat",
          productId: "p1",
          productName: "Dywaniki Hyundai Tucson",
          quantity: 1,
          unitPrice: 559,
          subtotal: 559,
          configuration: { setVariant: "basic" },
        },
      ],
      subtotal: 559,
      shippingCost: 27,
      tax: 0,
      discount: 0,
      total: 586,
      itemCount: 1,
    }

    const next = await service.updateQuantity(cart, "line-1", 2)

    expect(next).not.toBe(cart)
    expect(next.items[0]?.quantity).toBe(2)
    expect(next.itemCount).toBe(2)
    expect(cart.items[0]?.quantity).toBe(1)
  })
})
