import { describe, expect, it } from "vitest"
import { resolvePerColorMatImage, resolvePinnedMatImage } from "./resolvePinnedMatImage"

const base = {
  variantImage: "/variant.png",
  typeImage: "/type.webp",
  defaultImage: "/default.webp",
  focus: "variant" as const,
}

describe("resolvePinnedMatImage", () => {
  it("uses the variant preview as the main mat image", () => {
    expect(resolvePinnedMatImage(base)).toEqual({
      url: "/variant.png",
      source: "variant-preview",
    })
  })

  it("switches to the type photo when that card was selected", () => {
    expect(resolvePinnedMatImage({ ...base, focus: "type" }).source).toBe("type-preview")
  })

  it("lets an in-car photo outrank the variant preview", () => {
    expect(
      resolvePinnedMatImage({ ...base, inCarUrl: "/incar.webp" }),
    ).toEqual({ url: "/incar.webp", source: "in-car" })
  })

  it("uses a supplied per-color asset above the variant diagram", () => {
    expect(
      resolvePinnedMatImage({ ...base, focus: "color", perColorUrl: "/red.webp" }).source,
    ).toBe("per-color")
  })

  it("keeps the variant image when no per-color file is mapped", () => {
    expect(
      resolvePerColorMatImage({
        matType: "3d-with-rims",
        structure: "diamonds",
        color: "red",
        edgeColor: "black",
      }),
    ).toBeNull()
    expect(resolvePinnedMatImage({ ...base, focus: "color" }).source).toBe("variant-preview")
  })
})
