import { describe, expect, it } from "vitest"
import {
  CELL_STRUCTURE_DIAMONDS_ICON_SRC,
  CELL_STRUCTURE_HONEY_ICON_SRC,
  cellStructureOptions,
  getCellStructureIconSrc,
} from "./cellStructurePresentation"

describe("cellStructurePresentation", () => {
  it("exposes icon paths for both cell structures", () => {
    expect(CELL_STRUCTURE_DIAMONDS_ICON_SRC).toBe(
      "/konfigurator/struktura-komorek/romby.png",
    )
    expect(CELL_STRUCTURE_HONEY_ICON_SRC).toBe(
      "/konfigurator/struktura-komorek/plaster-miodu.png",
    )
  })

  it("maps structure ids to icon sources", () => {
    expect(getCellStructureIconSrc("diamonds")).toBe(
      CELL_STRUCTURE_DIAMONDS_ICON_SRC,
    )
    expect(getCellStructureIconSrc("honey")).toBe(CELL_STRUCTURE_HONEY_ICON_SRC)
  })

  it("lists romby and plaster miodu options", () => {
    expect(cellStructureOptions.map((option) => option.id)).toEqual([
      "diamonds",
      "honey",
    ])
    cellStructureOptions.forEach((option) => {
      expect(option.iconSrc).toMatch(/\.png$/)
      expect(option.iconAlt.length).toBeGreaterThan(0)
    })
  })
})
