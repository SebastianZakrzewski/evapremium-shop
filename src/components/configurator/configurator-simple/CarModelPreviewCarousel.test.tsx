import { describe, it, expect } from "vitest"
import { PLACEHOLDER_CAR_MODEL_PREVIEW_SLIDES } from "./carModelPreviewCarousel.types"

describe("PLACEHOLDER_CAR_MODEL_PREVIEW_SLIDES", () => {
  it("provides at least three placeholder slides for step 1 carousel", () => {
    expect(PLACEHOLDER_CAR_MODEL_PREVIEW_SLIDES.length).toBeGreaterThanOrEqual(3)
    expect(PLACEHOLDER_CAR_MODEL_PREVIEW_SLIDES[0].imageUrl).toBeTruthy()
  })
})
