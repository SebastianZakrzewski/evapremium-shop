import { describe, expect, it } from "vitest"
import { resolveConfiguratorEntryImageSrc } from "./resolveConfiguratorEntryImageSrc"

describe("resolveConfiguratorEntryImageSrc", () => {
  it("prefers a local preview path over the brand logo", () => {
    expect(
      resolveConfiguratorEntryImageSrc("audi", "/images/products/audi.jpg"),
    ).toBe("/images/products/audi.jpg")
  })

  it("uses the brand logo when preview is missing", () => {
    expect(resolveConfiguratorEntryImageSrc("audi", undefined)).toBe(
      "/modele/audi.avif",
    )
  })

  it("rejects remote preview urls", () => {
    expect(
      resolveConfiguratorEntryImageSrc("audi", "https://evil.example/a.png"),
    ).toBe("/modele/audi.avif")
    expect(resolveConfiguratorEntryImageSrc("audi", "//evil.example/a.png")).toBe(
      "/modele/audi.avif",
    )
  })

  it("returns null without a brand or a local preview", () => {
    expect(resolveConfiguratorEntryImageSrc(undefined, undefined)).toBeNull()
  })
})
