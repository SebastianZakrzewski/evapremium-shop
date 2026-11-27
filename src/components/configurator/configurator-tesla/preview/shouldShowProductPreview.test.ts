import { describe, expect, it } from "vitest"
import { shouldShowProductPreview } from "./shouldShowProductPreview"

describe("shouldShowProductPreview", () => {
  it("keeps the model photo when the product section is only beside the image", () => {
    expect(
      shouldShowProductPreview({
        productSectionInView: true,
        productSectionPinned: false,
        appearanceTouched: false,
        scrolled: false,
      }),
    ).toBe(false)
  })

  it("shows the product photo after the visitor scrolls to that section", () => {
    expect(
      shouldShowProductPreview({
        productSectionInView: true,
        productSectionPinned: false,
        appearanceTouched: false,
        scrolled: true,
      }),
    ).toBe(true)
  })

  it("shows the product photo when a mat type or colour is chosen", () => {
    expect(
      shouldShowProductPreview({
        productSectionInView: false,
        productSectionPinned: true,
        appearanceTouched: false,
        scrolled: false,
      }),
    ).toBe(true)
    expect(
      shouldShowProductPreview({
        productSectionInView: false,
        productSectionPinned: false,
        appearanceTouched: true,
        scrolled: false,
      }),
    ).toBe(true)
  })
})
