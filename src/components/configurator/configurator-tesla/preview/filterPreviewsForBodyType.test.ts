import { describe, expect, it } from "vitest"
import { filterPreviewsForBodyType } from "./filterPreviewsForBodyType"

const sedan = {
  body_type_key: "sedan",
  image_url: "/sedan.webp",
  is_primary: true,
  sort_order: 0,
}
const hatch = {
  body_type_key: "hatchback",
  image_url: "/hatch.webp",
  is_primary: false,
  sort_order: 1,
}
const generic = {
  body_type_key: null,
  image_url: "/generic.webp",
  is_primary: false,
  sort_order: 2,
}

describe("filterPreviewsForBodyType", () => {
  it("keeps only the selected body and ignores a sedan photo for a hatchback", () => {
    expect(filterPreviewsForBodyType([sedan, hatch, generic], "hatchback")).toEqual([hatch])
  })

  it("falls back to a body-agnostic photo when the body has no own image", () => {
    expect(filterPreviewsForBodyType([sedan, generic], "hatchback")).toEqual([generic])
  })
})
