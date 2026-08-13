import { describe, expect, it } from "vitest"
import { edgeColorIconMap, getEdgeColorIconSrc } from "./edgeColorIcons"

describe("edgeColorIcons", () => {
  it("maps known edge colors to icon paths", () => {
    expect(getEdgeColorIconSrc("red")).toBe(
      "/konfigurator/kolor-obszycia/red.png",
    )
    expect(getEdgeColorIconSrc("unknown")).toBeUndefined()
  })

  it("covers all border palette colors", () => {
    const borderColors = [
      "beige",
      "black",
      "blue",
      "brown",
      "darkblue",
      "darkgrey",
      "green",
      "lightgrey",
      "maroon",
      "orange",
      "pink",
      "purple",
      "red",
      "yellow",
    ]

    borderColors.forEach((colorKey) => {
      expect(edgeColorIconMap).toHaveProperty(colorKey)
      expect(getEdgeColorIconSrc(colorKey)).toContain(`${colorKey}.png`)
    })
  })
})
