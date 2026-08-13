import { describe, expect, it } from "vitest"
import { resolvePrimaryPreviewImageUrl } from "./resolvePrimaryPreviewImageUrl"

describe("resolvePrimaryPreviewImageUrl", () => {
  const previews = [
    {
      matTemplateId: "tmpl-1",
      bodyTypeKey: "sedan",
      imageUrl: "/previews/sedan.png",
    },
    {
      matTemplateId: "tmpl-1",
      bodyTypeKey: "wagon",
      imageUrl: "/previews/wagon.png",
    },
    {
      matTemplateId: "tmpl-1",
      bodyTypeKey: null,
      imageUrl: "/previews/generic.png",
    },
    {
      matTemplateId: "tmpl-2",
      bodyTypeKey: null,
      imageUrl: "/previews/other.png",
    },
  ]

  it("prefers exact body_type_key match", () => {
    expect(
      resolvePrimaryPreviewImageUrl(previews, "tmpl-1", "wagon"),
    ).toBe("/previews/wagon.png")
  })

  it("falls back to generic NULL body type", () => {
    expect(
      resolvePrimaryPreviewImageUrl(previews, "tmpl-1", "hatchback"),
    ).toBe("/previews/generic.png")
  })

  it("does not reuse another body type image when no match exists", () => {
    const scopedOnly = previews.filter((preview) => preview.bodyTypeKey)
    expect(
      resolvePrimaryPreviewImageUrl(scopedOnly, "tmpl-1", "hatchback"),
    ).toBeNull()
  })

  it("returns null when template has no previews", () => {
    expect(resolvePrimaryPreviewImageUrl(previews, "missing", "suv")).toBe(
      null,
    )
  })
})
