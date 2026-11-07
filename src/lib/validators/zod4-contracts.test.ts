import { describe, expect, it } from "vitest"
import { z } from "zod"
import { CartActionSchema, CartItemSchema } from "@/lib/validators/cart"
import { AddressDataSchema, CustomerDataSchema, OrderItemSchema } from "@/lib/validators/order"
import {
  abandonedCartRecordSchema,
  abandonedCartUpsertInputSchema,
} from "@/lib/validators/abandonedCart"
import { paynowCreatePaymentResponseSchema, paynowWebhookNotificationSchema } from "@/lib/types/paynow"
import { checkoutSchema } from "@/features/checkout/model/checkoutSchema"
import { MatConfigurationSchema } from "@/features/vehicle-catalog/model/matConfiguration"
import { CatalogQuerySchema } from "@/features/vehicle-catalog/model/schemas"

const messages = (result: { success: boolean; error?: z.ZodError }) =>
  result.success ? [] : result.error.issues.map((issue) => issue.message)

const validMat = {
  carDetails: {
    brand: "Hyundai",
    model: "Tucson",
    year: "2024",
    bodyType: "SUV",
  },
  setType: "3d-with-rims",
  setVariant: "basic",
  cellType: "diamonds",
  materialColor: "black",
  edgeColor: "red",
}

describe("Zod 4 checkout and payment contracts", () => {
  it("rejects an oversized invalid array without throwing", () => {
    const input = Array.from({ length: 200 }, () => "not-a-number")
    const result = z.array(z.number()).safeParse(input)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0)
      expect(result.error.issues.length).toBeLessThanOrEqual(input.length)
    }
  })

  it("keeps the Polish product-type message for cart and order items", () => {
    const cart = CartItemSchema.safeParse({
      id: "item-1",
      quantity: 1,
      unitPrice: 559,
      subtotal: 559,
      productType: "other",
      productId: "prod-1",
      productName: "Tucson",
    })
    expect(messages(cart)).toContain('Typ produktu musi być "accessory" lub "mat"')

    const action = CartActionSchema.safeParse({
      action: "buy",
      cart: {
        items: [],
        subtotal: 0,
        shippingCost: 0,
        tax: 0,
        discount: 0,
        total: 0,
        itemCount: 0,
      },
    })
    expect(messages(action)).toContain("Akcja musi być: add, remove, update, lub clear")
  })

  it("keeps customer, postal code and accessory product id rules", () => {
    const customer = CustomerDataSchema.safeParse({
      name: "",
      email: "nie-email",
      phone: "123",
    })
    expect(messages(customer)).toEqual(expect.arrayContaining([
      "Imię i nazwisko jest wymagane",
      "Nieprawidłowy adres email",
      "Numer telefonu musi mieć co najmniej 9 cyfr",
    ]))

    const address = AddressDataSchema.safeParse({
      street: "Testowa 1",
      city: "Warszawa",
      postalCode: "00001",
      country: "Polska",
    })
    expect(messages(address)).toContain("Nieprawidłowy kod pocztowy (format: XX-XXX)")

    const accepted = AddressDataSchema.safeParse({
      street: "Testowa 1",
      city: "Warszawa",
      postalCode: "00-001",
      country: "Polska",
    })
    expect(accepted.success).toBe(true)

    const accessory = OrderItemSchema.safeParse({
      id: "11111111-1111-4111-8111-111111111111",
      quantity: 1,
      unitPrice: 100,
      subtotal: 100,
      productType: "accessory",
      productName: "Organizer",
      orderId: "22222222-2222-4222-8222-222222222222",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    expect(messages(accessory)).toContain("productId jest wymagany dla akcesoriów")
  })

  it("keeps Paynow status enums and rejects an unknown status", () => {
    expect(paynowWebhookNotificationSchema.safeParse({
      paymentId: "pay-1",
      externalId: "order-1",
      status: "CONFIRMED",
      modifiedAt: "2026-11-07T00:00:00.000Z",
    }).success).toBe(true)
    expect(paynowWebhookNotificationSchema.safeParse({
      paymentId: "pay-1",
      externalId: "order-1",
      status: "PAID",
      modifiedAt: "2026-11-07T00:00:00.000Z",
    }).success).toBe(false)
    expect(paynowCreatePaymentResponseSchema.safeParse({
      redirectUrl: "https://api.sandbox.paynow.pl/pay",
      paymentId: "pay-1",
      status: "NEW",
    }).success).toBe(true)
  })

  it("keeps checkout messages, NIP cleaning and optional payment fields", () => {
    const missingPayment = checkoutSchema.safeParse({
      firstName: "Anna",
      lastName: "Nowak",
      email: "anna@example.com",
      phone: "500600700",
      street: "Testowa 1",
      postalCode: "00-001",
      city: "Warszawa",
      country: "Polska",
      sameAsShipping: true,
      termsAccepted: true,
      marketingAccepted: false,
    })
    expect(messages(missingPayment)).toContain("Wybierz metodę płatności")

    const cleaned = checkoutSchema.safeParse({
      firstName: "Anna",
      lastName: "Nowak",
      email: "anna@example.com",
      phone: "500600700",
      street: "Testowa 1",
      postalCode: "00-001",
      city: "Warszawa",
      country: "Polska",
      sameAsShipping: true,
      nip: "123-456-32-18",
      paymentMethod: "paynow",
      termsAccepted: true,
      marketingAccepted: false,
      notes: undefined,
      discountCode: undefined,
    })
    expect(cleaned.success).toBe(true)
    if (cleaned.success) {
      expect(cleaned.data.nip).toBe("1234563218")
      expect(cleaned.data.paymentMethod).toBe("paynow")
    }

    const badNip = checkoutSchema.safeParse({
      firstName: "Anna",
      lastName: "Nowak",
      email: "anna@example.com",
      phone: "500600700",
      street: "Testowa 1",
      postalCode: "00-001",
      city: "Warszawa",
      country: "Polska",
      sameAsShipping: true,
      nip: "123",
      paymentMethod: "paynow",
      termsAccepted: false,
      marketingAccepted: false,
    })
    expect(messages(badNip)).toEqual(expect.arrayContaining([
      "NIP musi składać się z 10 cyfr",
      "Musisz zaakceptować regulamin",
    ]))
  })

  it("keeps abandoned-cart defaults, coercion and empty gearbox handling", () => {
    expect(abandonedCartUpsertInputSchema.safeParse({
      sessionId: "short",
      stage: "checkout_step2",
      cartHasItems: true,
    }).success).toBe(false)

    const upsert = abandonedCartUpsertInputSchema.safeParse({
      sessionId: "session-s2",
      stage: "checkout_step2",
      cartHasItems: true,
      totalAmount: 100,
      utm: { source: "ads" },
    })
    expect(upsert.success).toBe(true)
    if (upsert.success) expect(upsert.data.utm).toEqual({ source: "ads" })

    const record = abandonedCartRecordSchema.safeParse({
      id: "33333333-3333-4333-8333-333333333333",
      session_id: "session-s2",
      status: "pending",
      created_at: "2026-11-07T00:00:00.000Z",
      updated_at: "2026-11-07T00:00:00.000Z",
      last_activity_at: "2026-11-07T00:00:00.000Z",
      expire_at: "2026-11-07T00:15:00.000Z",
      utm: {},
      currency: "PLN",
      total_amount: 0,
    })
    expect(record.success).toBe(true)
    if (record.success) {
      expect(record.data.items).toEqual([])
      expect(record.data.metadata).toEqual({})
    }

    const config = MatConfigurationSchema.safeParse({
      ...validMat,
      carDetails: { ...validMat.carDetails, gearbox: "" },
    })
    expect(config.success).toBe(true)
    if (config.success) expect(config.data.carDetails.gearbox).toBeUndefined()

    const year = CatalogQuerySchema.safeParse({ year: "2024" })
    expect(year.success).toBe(true)
    if (year.success) expect(year.data.year).toBe(2024)
    expect(CatalogQuerySchema.safeParse({ year: "abc" }).success).toBe(false)
  })
})
