import { describe, expect, it } from "vitest"
import { chooseGenerationModelImage } from "./chooseGenerationModelImage"

const preview = "products/bmw/3-e90-wide.webp?v=20261110c"
const local = "/images/products/bmw/3-e90.png"

describe("chooseGenerationModelImage", () => {
  it("prefers the database primary preview over a local file", () => {
    expect(chooseGenerationModelImage(preview, local)).toBe(preview)
  })

  it("falls back to the local file when the database has no preview", () => {
    expect(chooseGenerationModelImage(null, local)).toBe(local)
    expect(chooseGenerationModelImage("  ", local)).toBe(local)
  })

  it("returns null when neither source has an image", () => {
    expect(chooseGenerationModelImage(null, null)).toBeNull()
    expect(chooseGenerationModelImage(undefined, "  ")).toBeNull()
  })
})
