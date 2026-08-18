import { describe, expect, it } from "vitest"
import {
  isDualShopProduct,
  mapShopVariant,
  shopKeyFromLabel,
} from "./shopSetMapping"

describe("shopSetMapping", () => {
  it("maps dual XC90 set names including large-trunk 2-row", () => {
    expect(
      mapShopVariant(
        {
          matType: "3D BEZ RANTÓW",
          setName: "Przód + tył + Duży bagażnik",
          price: 710,
          available: true,
        },
        true,
      ),
    ).toMatchObject({
      key: "front_rear_two_trunks",
      matType: "classic",
      label: "Przód + tył + Duży bagażnik",
      price: 710,
    })
  })

  it("does not map Przód + tył + bagażnik to front_rear_two_trunks", () => {
    expect(
      mapShopVariant(
        {
          matType: "3D Z RANTAMI",
          setName: "Przód + tył + bagażnik",
          price: 1210,
          available: true,
        },
        true,
      )?.key,
    ).toBe("premium")
  })

  it("maps single-axis minivan set names from matType", () => {
    expect(
      mapShopVariant(
        {
          matType: "3 rzędy + bagażnik DUŻY",
          setName: "",
          price: 1810,
          available: true,
        },
        false,
      ),
    ).toMatchObject({
      key: "row_3_large_trunk_folded",
      matType: "single",
      price: 1810,
    })
  })

  it("detects dual products from construction mat types", () => {
    expect(
      isDualShopProduct([
        { matType: "3D BEZ RANTÓW", setName: "Przód", price: 290, available: true },
      ]),
    ).toBe(true)
    expect(
      isDualShopProduct([
        { matType: "Przód", setName: "", price: 550, available: true },
      ]),
    ).toBe(false)
  })

  it("keeps unknown shop labels as shop keys", () => {
    expect(shopKeyFromLabel("Przód + tył + 3 bagażniki")).toBe(
      "shop:przod_tyl_3_bagazniki",
    )
  })
})
