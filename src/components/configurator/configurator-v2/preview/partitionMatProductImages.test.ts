import { describe, expect, it } from "vitest"
import {
  isModelTemplateImage,
  partitionMatProductImages,
} from "./partitionMatProductImages"

const templateImage = {
  id: 1,
  car_brand_slug: "bmw",
  car_model_slug: "3-e36-compact",
  generation: "3 gen",
  year: 1994,
  body_type: "hatchback",
  image_url:
    "/images/product_mat_images/BMW/3_E36_Compact/template.png",
  alt_text: "Schemat dywaników BMW 3 Compact",
  sort_order: 0,
  is_active: true,
}

const inCarImage = {
  id: 2,
  car_brand_slug: "bmw",
  car_model_slug: "3-e36-compact",
  generation: "3 gen",
  year: 1994,
  body_type: "hatchback",
  image_url: "/images/product_mat_images/BMW/3_E36_Compact/in_car_1.jpg",
  alt_text: "Dywaniki w BMW 3 Compact",
  sort_order: 1,
  is_active: true,
}

describe("partitionMatProductImages", () => {
  it("treats lowest sort_order image as model template", () => {
    const result = partitionMatProductImages([inCarImage, templateImage])

    expect(result.modelTemplate?.id).toBe(1)
    expect(result.inCarPhotos.map((image) => image.id)).toEqual([2])
  })

  it("detects template images by filename even with higher sort_order", () => {
    const misplacedTemplate = {
      ...templateImage,
      id: 3,
      sort_order: 5,
    }

    const result = partitionMatProductImages([
      inCarImage,
      misplacedTemplate,
    ])

    expect(result.modelTemplate?.id).toBe(3)
    expect(result.inCarPhotos.map((image) => image.id)).toEqual([2])
  })

  it("returns empty partitions when no images exist", () => {
    expect(partitionMatProductImages([])).toEqual({
      modelTemplate: null,
      inCarPhotos: [],
    })
  })
})

describe("isModelTemplateImage", () => {
  it("matches template filenames", () => {
    expect(isModelTemplateImage(templateImage)).toBe(true)
    expect(isModelTemplateImage(inCarImage)).toBe(false)
  })
})
