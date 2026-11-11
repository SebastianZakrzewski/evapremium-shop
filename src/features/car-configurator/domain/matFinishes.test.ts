import { describe, expect, it } from "vitest"
import type { Accessory } from "@/entities/product"
import {
  isShopAccessory,
  matFinishTotal,
  selectedMatFinishes,
} from "./matFinishes"

const accessory = (overrides: Partial<Accessory>): Accessory => ({
  id: "id",
  name: "Produkt",
  slug: "produkt",
  price: 10,
  sku: "SKU",
  features: [],
  inStock: true,
  isActive: true,
  reviewCount: 0,
  categoryId: 1,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  ...overrides,
})

describe("mat finishes", () => {
  const seams = accessory({
    id: "seams",
    name: "Wzmocnione szwy premium",
    price: 29,
    productType: "wykonczenie",
  })
  const coating = accessory({
    id: "coating",
    name: "Powłoka anti-dirt",
    price: 39,
    productType: "wykonczenie",
  })
  const heelPad = accessory({
    id: "heel",
    productType: "podpietka",
    price: 50,
  })

  it("keeps organizers and heel pads in the shop catalog", () => {
    expect(isShopAccessory(heelPad)).toBe(true)
    expect(isShopAccessory(accessory({ productType: "organizer" }))).toBe(true)
    expect(isShopAccessory(seams)).toBe(false)
  })

  it("returns only the finishes selected in the configurator", () => {
    expect(selectedMatFinishes([seams, coating, heelPad], ["coating"])).toEqual([
      coating,
    ])
    expect(matFinishTotal([seams, coating])).toBe(68)
  })
})
