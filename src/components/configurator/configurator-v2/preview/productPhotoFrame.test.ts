import { describe, expect, it } from "vitest"
import { isProductPhotoFramedToWindowWidth } from "./productPhotoFrame"

describe("isProductPhotoFramedToWindowWidth", () => {
  it("frames model and product-set photos inside the preview window", () => {
    expect(isProductPhotoFramedToWindowWidth("model-template")).toBe(true)
    expect(isProductPhotoFramedToWindowWidth("product-set")).toBe(true)
  })

  it("keeps dynamic and in-car previews at their current frame", () => {
    expect(isProductPhotoFramedToWindowWidth("dynamic")).toBe(false)
    expect(isProductPhotoFramedToWindowWidth("in-car-photo")).toBe(false)
    expect(isProductPhotoFramedToWindowWidth("brand-placeholder")).toBe(false)
    expect(isProductPhotoFramedToWindowWidth(null)).toBe(false)
  })
})
