import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { CartItemSchema, UpdateCartItemSchema } from "@/lib/validators/cart"
import { CustomerDataSchema } from "@/lib/validators/order"
import { paynowWebhookNotificationSchema } from "@/lib/types/paynow"

function installedVersion(name: string) {
  const manifest = JSON.parse(
    readFileSync(`${process.cwd()}/node_modules/${name}/package.json`, "utf8")
  ) as { version: string }
  return manifest.version
}

function versionAtLeast(actual: string, minimum: string) {
  const parse = (value: string) => value.split(".").map((part) => Number.parseInt(part, 10))
  const left = parse(actual)
  const right = parse(minimum)
  const length = Math.max(left.length, right.length)
  for (let index = 0; index < length; index += 1) {
    const difference = (left[index] ?? 0) - (right[index] ?? 0)
    if (difference !== 0) return difference > 0
  }
  return true
}

describe("patched runtime dependency contracts", () => {
  it("keeps Next and sharp on the versions that close the verified advisories", () => {
    const next = installedVersion("next")
    const sharp = installedVersion("sharp")
    const postcss = installedVersion("postcss")

    expect(versionAtLeast(next, "16.4.1")).toBe(true)
    expect(next.startsWith("16.")).toBe(true)
    expect(versionAtLeast(sharp, "0.35.5")).toBe(true)
    expect(versionAtLeast(postcss, "8.5.23")).toBe(true)
  })

  it("keeps Zod on the release that closes GHSA-mrhx-c7xc-m3w5", () => {
    const zod = installedVersion("zod")
    expect(zod.startsWith("4.")).toBe(true)
    expect(versionAtLeast(zod, "4.6.6")).toBe(true)
  })

  it("keeps cart, customer and Paynow webhook validation semantics", () => {
    const badType = CartItemSchema.safeParse({
      id: "item-1",
      quantity: 1,
      unitPrice: 559,
      subtotal: 559,
      productType: "other",
      productId: "prod-1",
      productName: "Tucson",
    })
    expect(badType.success).toBe(false)
    if (!badType.success) {
      expect(badType.error.issues.some((issue) => issue.message === 'Typ produktu musi być "accessory" lub "mat"')).toBe(true)
    }

    expect(UpdateCartItemSchema.safeParse({ itemId: "item-1", quantity: 0 }).success).toBe(false)
    expect(UpdateCartItemSchema.safeParse({ itemId: "item-1", quantity: 2 }).success).toBe(true)

    const email = CustomerDataSchema.safeParse({
      name: "Anna Nowak",
      email: "nie-email",
      phone: "123456789",
    })
    expect(email.success).toBe(false)
    if (!email.success) {
      expect(email.error.issues.some((issue) => issue.message === "Nieprawidłowy adres email")).toBe(true)
    }

    expect(
      paynowWebhookNotificationSchema.safeParse({
        paymentId: "pay-1",
        externalId: "order-1",
        status: "CONFIRMED",
        modifiedAt: "2026-11-07T00:00:00.000Z",
      }).success
    ).toBe(true)
    expect(
      paynowWebhookNotificationSchema.safeParse({
        paymentId: "pay-1",
        externalId: "order-1",
        status: "PAID",
        modifiedAt: "2026-11-07T00:00:00.000Z",
      }).success
    ).toBe(false)
  })
})
