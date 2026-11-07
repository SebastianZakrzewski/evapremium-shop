import { describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

vi.mock("@/features/vehicle-catalog/server/bitrixMappingService", () => ({
  resolveLegacySetTypeEnumId: vi.fn(),
  resolveLegacyVariantEnumId: vi.fn(),
}))

import { mapOrderToDeal } from "@/lib/integrations/bitrix24/mappers/orderToDeal"
import type { Order } from "@/lib/types/order-new"

describe("mapOrderToDeal gearbox", () => {
  it("includes gearbox in deal comments from mat configuration", () => {
    const order = {
      id: "order-1",
      orderNumber: "EVA-2026-000001",
      status: "confirmed",
      paymentStatus: "paid",
      paymentMethod: "paynow",
      customer: {
        name: "Jan Test",
        email: "jan@example.com",
        phone: "+48111111111",
      },
      shippingAddress: {
        street: "Test 1",
        city: "Warszawa",
        postalCode: "00-001",
        country: "Polska",
      },
      billingAddress: null,
      subtotal: 637,
      shippingCost: 0,
      tax: 0,
      discount: 0,
      total: 637,
      notes: null,
      items: [
        {
          id: "item-1",
          orderId: "order-1",
          productType: "mat",
          productId: "mat-1",
          productName: "Dywaniki BMW X5",
          productSku: "MAT-BMW-X5",
          productImage: "/img.webp",
          quantity: 1,
          unitPrice: 637,
          subtotal: 637,
          configuration: {
            carDetails: {
              brand: "BMW",
              model: "X5",
              year: "2020",
              gearbox: "Automatyczna",
              bodyType: "SUV",
            },
            setType: "classic",
            setVariant: "basic",
            cellType: "diamonds",
            materialColor: "black",
            edgeColor: "black",
          },
          createdAt: new Date("2026-08-11T10:00:00.000Z"),
          updatedAt: new Date("2026-08-11T10:00:00.000Z"),
        },
      ],
      createdAt: new Date("2026-08-11T10:00:00.000Z"),
      updatedAt: new Date("2026-08-11T10:00:00.000Z"),
    } as Order

    const deal = mapOrderToDeal(order)

    expect(deal.COMMENTS).toContain("Skrzynia biegów: Automatyczna")
    expect(deal.COMMENTS).toContain("BMW X5 2020 SUV")
    expect(deal.UF_CRM_1757178158864).toBe("Automatyczna")
    expect(deal.UF_CRM_1768256494433).toBe(888)
  })
})
