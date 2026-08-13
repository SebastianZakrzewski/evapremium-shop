import { describe, expect, it } from "vitest"
import {
  getMaterialColorIconSrc,
  materialColorIconMap,
} from "./materialColorIcons"

describe("materialColorIcons", () => {
  it("maps known material colors to icon paths", () => {
    expect(getMaterialColorIconSrc("red")).toBe(
      "/konfigurator/kolor-materialu/red.png",
    )
    expect(getMaterialColorIconSrc("unknown")).toBeUndefined()
  })

  it("covers all diamond material palette colors", () => {
    const diamondColors = [
      "beige",
      "black",
      "blue",
      "brown",
      "darkblue",
      "darkgreen",
      "darkgrey",
      "ivory",
      "lightbeige",
      "lime",
      "maroon",
      "orange",
      "pink",
      "purple",
      "red",
      "white",
      "yellow",
    ]

    diamondColors.forEach((colorKey) => {
      expect(materialColorIconMap).toHaveProperty(colorKey)
      expect(getMaterialColorIconSrc(colorKey)).toContain(`${colorKey}.png`)
    })
  })
})
