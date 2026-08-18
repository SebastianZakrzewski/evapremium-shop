import { describe, expect, it } from "vitest"
import { buildShopTemplateOffer, withRequiredTrunkMatKey } from "./shopTemplateOffer"

describe("buildShopTemplateOffer", () => {
  it("merges dual prices per set and skips unavailable rows", () => {
    const offer = buildShopTemplateOffer("rdx", {
      shopHandle: "acura-rdx",
      variants: [
        {
          matType: "3D BEZ RANTÓW",
          setName: "Przód",
          price: 290,
          available: true,
        },
        {
          matType: "3D Z RANTAMI",
          setName: "Przód",
          price: 550,
          available: true,
        },
        {
          matType: "3D BEZ RANTÓW",
          setName: "Przód + tył + bagażnik",
          price: 710,
          available: false,
        },
      ],
    })

    expect(offer?.axis).toBe("dual")
    expect(offer?.sets).toEqual([
      {
        key: "front",
        label: "Przód",
        prices: { classic: 290, "3d-with-rims": 550 },
      },
    ])
  })

  it("keeps shop set order for 3-row SUV without premium", () => {
    const offer = buildShopTemplateOffer("xc90", {
      shopHandle: "volvo-xc90",
      variants: [
        { matType: "3D BEZ RANTÓW", setName: "Przód + tył", price: 510, available: true },
        {
          matType: "3D BEZ RANTÓW",
          setName: "Przód + tył + Duży bagażnik",
          price: 710,
          available: true,
        },
      ],
    })

    expect(offer?.sets.map((set) => set.key)).toEqual([
      "basic",
      "front_rear_two_trunks",
    ])
  })

  it("exposes trunk mat on 3d-with-rims at the classic shop price", () => {
    const offer = buildShopTemplateOffer("golf", {
      shopHandle: "vw-golf",
      variants: [
        {
          matType: "3D BEZ RANTÓW",
          setName: "Przód",
          price: 290,
          available: true,
        },
        {
          matType: "3D Z RANTAMI",
          setName: "Przód",
          price: 550,
          available: true,
        },
        {
          matType: "3D BEZ RANTÓW",
          setName: "Mata do bagażnika",
          price: 350,
          available: true,
        },
      ],
    })

    expect(offer?.sets.find((set) => set.key === "complete")?.prices).toEqual({
      classic: 350,
      "3d-with-rims": 350,
    })
  })

  it("does not inject complete when shop offer omits it", () => {
    expect(withRequiredTrunkMatKey(["front", "basic"], "dual_mat_type")).toEqual([
      "front",
      "basic",
    ])
  })

  it("places mata do bagażnika after przód + tył + bagażnik", () => {
    const offer = buildShopTemplateOffer("octavia", {
      shopHandle: "skoda-octavia",
      variants: [
        {
          matType: "3D BEZ RANTÓW",
          setName: "Mata do bagażnika",
          price: 350,
          available: true,
        },
        {
          matType: "3D BEZ RANTÓW",
          setName: "Przód",
          price: 290,
          available: true,
        },
        {
          matType: "3D BEZ RANTÓW",
          setName: "Przód + tył",
          price: 510,
          available: true,
        },
        {
          matType: "3D BEZ RANTÓW",
          setName: "Przód + tył + bagażnik",
          price: 710,
          available: true,
        },
      ],
    })

    expect(offer?.sets.map((set) => set.key)).toEqual([
      "front",
      "basic",
      "premium",
      "complete",
    ])
  })
})
