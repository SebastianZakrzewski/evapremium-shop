import { describe, expect, it } from "vitest"
import {
  addressesDiffer,
  buildCustomerRows,
  buildOrderMetaRows,
  buildPaymentPriceLines,
  formatAddressLines,
  getOrderItemLineTotal,
  getOrderItemTitle,
  getPaymentHeadline,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
} from "./paymentSuccessPresentation"

describe("payment success presentation", () => {
  it("uses Polish labels for payment method and status", () => {
    expect(getPaymentMethodLabel("blik")).toBe("BLIK")
    expect(getPaymentMethodLabel("paynow")).toBe("Paynow (mBank)")
    expect(getPaymentStatusLabel("paid")).toBe("Opłacone")
    expect(getPaymentHeadline("paid")).toBe("Dziękujemy za zamówienie")
  })

  it("builds a stable order meta list without technical identifiers", () => {
    const rows = buildOrderMetaRows({
      status: "paid",
      orderNumber: "ORD-2026-000361",
      createdAt: "2026-09-22T10:15:00.000Z",
      orderStatus: "confirmed",
      paymentStatus: "paid",
      paymentMethod: "przelewy24",
      trackingNumber: "TRACK-1",
      orderId: "f48bb62d-d448-4741-a8a6-6aea5c51528a",
      p24OrderId: "999",
    })

    expect(rows.map((row) => row.label)).toEqual([
      "Numer zamówienia",
      "Data",
      "Realizacja",
      "Płatność",
      "Metoda płatności",
      "Numer śledzenia",
    ])
    expect(rows.find((row) => row.label === "Realizacja")?.value).toBe("Potwierdzone")
    expect(rows.some((row) => row.value.includes("f48bb62d"))).toBe(false)
  })

  it("formats addresses and shows billing only when it differs", () => {
    const shipping = {
      street: "Prosta 1",
      postalCode: "00-001",
      city: "Warszawa",
      country: "Polska",
    }

    expect(formatAddressLines(shipping)).toEqual([
      "Prosta 1",
      "00-001 Warszawa",
      "Polska",
    ])
    expect(addressesDiffer(shipping, { ...shipping })).toBe(false)
    expect(addressesDiffer(shipping, { ...shipping, street: "Długa 2" })).toBe(true)
  })

  it("structures customer rows and price lines", () => {
    expect(
      buildCustomerRows({
        name: "Anna Nowak",
        company: "Eva",
        email: "anna@example.com",
        phone: "500600700",
      }).map((row) => row.label)
    ).toEqual(["Imię i nazwisko", "Firma", "E-mail", "Telefon"])

    const lines = buildPaymentPriceLines({
      subtotal: 400,
      shippingCost: 0,
      tax: 0,
      discount: 20,
      total: 380,
    })

    expect(lines.map((line) => line.label)).toEqual([
      "Wartość produktów",
      "Rabat",
      "Razem",
    ])
    expect(lines.find((line) => line.label === "Rabat")?.tone).toBe("discount")
    expect(lines.find((line) => line.label === "Razem")?.tone).toBe("total")
  })

  it("normalizes product titles and line totals", () => {
    expect(getOrderItemTitle({ productType: "mat", productName: "Zestaw" })).toBe(
      "Dywaniki samochodowe"
    )
    expect(getOrderItemTitle({ productType: "accessory", productName: "Zapach" })).toBe(
      "Zapach"
    )
    expect(getOrderItemLineTotal({ subtotal: 199 })).toBe("199,00 zł")
    expect(getOrderItemLineTotal({ unitPrice: 10, quantity: 2 })).toBe("20,00 zł")
    expect(getOrderItemLineTotal({})).toBe("—")
  })
})
