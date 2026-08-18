import { describe, expect, it } from "vitest"
import {
  flattenCatalogRowsForCsv,
  mapShopProductToCatalogRows,
  nestCatalogByBrandAndModel,
  toCsv,
} from "./evamats-shop-catalog-map.mjs"

const audiProduct = {
  id: 8930211070258,
  title: "EVA Dywaniki samochodowe od EVA MATS 3D do Audi 100(C3) 3 gen 1988-1991 rok",
  handle: "dywaniki-samochodowe-evamats-do-audi-100c3-3-gen-1988-1991-rok-sedan",
  body_html:
    "<p>Marka: Audi Generacja: 3 Model: 100(C3) Lata produkcji: 1988-1991</p>",
  tags: ["Audi", "Audi 100"],
  options: [
    { name: "Rodzaj dywaników", position: 1, values: ["3D BEZ RANTÓW"] },
    { name: "Zestaw", position: 2, values: ["Przód + tył"] },
  ],
  variants: [
    {
      id: 1,
      title: "3D BEZ RANTÓW / Przód + tył",
      option1: "3D BEZ RANTÓW",
      option2: "Przód + tył",
      price: "510.00",
      compare_at_price: null,
      available: true,
      sku: "",
    },
    {
      id: 2,
      title: "3D Z RANTAMI / Przód + tył",
      option1: "3D Z RANTAMI",
      option2: "Przód + tył",
      price: "910.00",
      compare_at_price: "999.00",
      available: false,
      inventory_quantity: 0,
      sku: "SKU-2",
    },
  ],
}

describe("mapShopProductToCatalogRows", () => {
  it("uses title parse when HTML has model but no brand", () => {
    const row = mapShopProductToCatalogRows({
      ...audiProduct,
      title:
        "EVA Dywaniki samochodowe od EVA MATS 3D do Chevrolet Captiva 1 gen 2006-2018 rok SUV",
      body_html:
        "<p>Dywaniki EVAMATS do Chevrolet Captiva 1 gen 2006-2018 rok SUV</p>",
      tags: ["Chevrolet", "Chevrolet Captiva"],
    })

    expect(row.parseStatus).toBe("ok")
    expect(row.brandName).toBe("Chevrolet")
    expect(row.modelName).toContain("Captiva")
  })

  it("maps brand, model, variant name, price and availability", () => {
    const row = mapShopProductToCatalogRows(audiProduct)

    expect(row.parseStatus).toBe("ok")
    expect(row.brandName).toBe("Audi")
    expect(row.modelName).toContain("100(C3)")
    expect(row.variantCount).toBe(2)
    expect(row.variants[0]).toMatchObject({
      name: "3D BEZ RANTÓW / Przód + tył",
      matType: "3D BEZ RANTÓW",
      setName: "Przód + tył",
      price: 510,
      available: true,
      inventoryQuantity: null,
    })
    expect(row.variants[1]).toMatchObject({
      price: 910,
      compareAtPrice: 999,
      available: false,
      inventoryQuantity: 0,
      sku: "SKU-2",
    })
  })

  it("falls back to product tags when title has no body type", () => {
    const row = mapShopProductToCatalogRows({
      id: 3,
      title: "EVA Dywaniki samochodowe od EVA MATS 3D do Dacia Duster 3 gen 2024-2029 rok",
      handle: "dacia-duster",
      body_html: "<p>Dywaniki</p>",
      tags: ["Dacia", "Dacia Duster"],
      variants: [
        {
          id: 9,
          title: "3D Z RANTAMI / Przód",
          option1: "3D Z RANTAMI",
          option2: "Przód",
          price: "550.00",
          available: true,
        },
      ],
    })

    expect(row.parseStatus).toBe("fallback")
    expect(row.brandName).toBe("Dacia")
    expect(row.modelName).toBe("Duster")
    expect(row.variants[0].price).toBe(550)
  })

  it("parses brand and model from title when tags are missing", () => {
    const row = mapShopProductToCatalogRows({
      id: 4,
      title:
        "EVA Dywaniki samochodowe od EVA MATS 3D do Ford Transit 6 gen 2013-2027 rok",
      handle: "ford-transit",
      body_html: "<p>Dywaniki</p>",
      tags: [],
      variants: [{ id: 10, title: "Przód", option1: "Przód", price: "290.00", available: true }],
    })

    expect(row.parseStatus).toBe("fallback")
    expect(row.brandName).toBe("Ford")
    expect(row.modelName).toContain("Transit")
  })
})

describe("nestCatalogByBrandAndModel", () => {
  it("groups models under brand with variant counts", () => {
    const nested = nestCatalogByBrandAndModel([
      mapShopProductToCatalogRows(audiProduct),
    ])

    expect(nested).toHaveLength(1)
    expect(nested[0].brandName).toBe("Audi")
    expect(nested[0].modelCount).toBe(1)
    expect(nested[0].variantCount).toBe(2)
    expect(nested[0].models[0].variants).toHaveLength(2)
  })
})

describe("toCsv", () => {
  it("escapes commas and quotes in titles", () => {
    const csv = toCsv(
      flattenCatalogRowsForCsv([mapShopProductToCatalogRows(audiProduct)]),
    )

    expect(csv).toContain("brand_name,model_name")
    expect(csv).toContain("510")
    expect(csv.split("\n")).toHaveLength(3)
  })
})
