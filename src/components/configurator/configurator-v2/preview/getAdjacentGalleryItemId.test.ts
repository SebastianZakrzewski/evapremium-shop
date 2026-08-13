import { describe, expect, it } from "vitest"
import { getAdjacentGalleryItemId } from "./getAdjacentGalleryItemId"
import type { PreviewGalleryItem } from "./buildConfiguratorV2PreviewGallery"

const items: PreviewGalleryItem[] = [
  { id: "a", imageUrl: "/a.png", altText: "A", kind: "dynamic" },
  { id: "b", imageUrl: "/b.png", altText: "B", kind: "in-car-photo" },
  { id: "c", imageUrl: "/c.png", altText: "C", kind: "in-car-photo" },
]

describe("getAdjacentGalleryItemId", () => {
  it("returns next gallery item id", () => {
    expect(getAdjacentGalleryItemId(items, "a", "next")).toBe("b")
  })

  it("wraps to first item from last", () => {
    expect(getAdjacentGalleryItemId(items, "c", "next")).toBe("a")
  })

  it("returns previous gallery item id", () => {
    expect(getAdjacentGalleryItemId(items, "b", "previous")).toBe("a")
  })
})
