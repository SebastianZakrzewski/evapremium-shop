import { describe, expect, it } from "vitest"
import { resolveCarGallerySlides, type CarGallerySlide } from "./resolveCarGallerySlides"

const modelSlide: CarGallerySlide = {
  id: "car-1",
  src: "/images/cars/bmw-3.webp",
  alt: "BMW 3",
  group: "car",
}

describe("resolveCarGallerySlides", () => {
  it("shows the brand logo before a model is selected", () => {
    const result = resolveCarGallerySlides({
      previews: [],
      brandName: "BMW",
      brandLogo: "/modele/bmw.webp",
      neutralSrc: "/mat.webp",
      modelSelected: false,
      pending: false,
      heldModelSlides: [],
    })
    expect(result.slides.map((slide) => slide.id)).toEqual(["car-brand"])
  })

  it("keeps the model photo when the preview list is empty during a refetch", () => {
    const result = resolveCarGallerySlides({
      previews: [],
      brandName: "BMW",
      brandLogo: "/modele/bmw.webp",
      neutralSrc: "/mat.webp",
      modelSelected: true,
      pending: true,
      heldModelSlides: [modelSlide],
    })
    expect(result.slides).toEqual([modelSlide])
    expect(result.slides.some((slide) => slide.id === "car-brand")).toBe(false)
  })

  it("replaces the held photo when a new model preview arrives", () => {
    const result = resolveCarGallerySlides({
      previews: [
        { id: "2", image_url: "/images/cars/bmw-3-sedan.webp", alt_text: "Sedan", is_primary: true, sort_order: 0 },
      ],
      brandName: "BMW",
      brandLogo: "/modele/bmw.webp",
      neutralSrc: "/mat.webp",
      modelSelected: true,
      pending: false,
      heldModelSlides: [modelSlide],
    })
    expect(result.slides[0]?.src).toBe("/images/cars/bmw-3-sedan.webp")
  })

  it("drops the held model photo when the model is cleared", () => {
    const result = resolveCarGallerySlides({
      previews: [],
      brandName: "BMW",
      brandLogo: "/modele/bmw.webp",
      neutralSrc: "/mat.webp",
      modelSelected: false,
      pending: false,
      heldModelSlides: [modelSlide],
    })
    expect(result.slides[0]?.id).toBe("car-brand")
    expect(result.heldModelSlides).toEqual([])
  })
})
