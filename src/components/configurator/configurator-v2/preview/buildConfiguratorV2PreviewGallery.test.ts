import { describe, expect, it } from "vitest"
import {
  buildConfiguratorV2PreviewGallery,
  resolveDefaultGalleryItemId,
  resolveVehiclePreviewImageSrc,
} from "./buildConfiguratorV2PreviewGallery"

const templateImage = {
  id: 1,
  car_brand_slug: "bmw",
  car_model_slug: "3-e36-compact",
  generation: "3 gen",
  year: 1994,
  body_type: "hatchback",
  image_url: "/mat/template.webp",
  alt_text: "Schemat BMW 3 Compact",
  sort_order: 0,
  is_active: true,
}

const inCarImages = [
  {
    id: 2,
    car_brand_slug: "bmw",
    car_model_slug: "3-e36-compact",
    generation: "3 gen",
    year: 1994,
    body_type: "hatchback",
    image_url: "/mat/in-car-1.webp",
    alt_text: "Dywaniki w aucie 1",
    sort_order: 1,
    is_active: true,
  },
  {
    id: 3,
    car_brand_slug: "bmw",
    car_model_slug: "3-e36-compact",
    generation: "3 gen",
    year: 1994,
    body_type: "hatchback",
    image_url: "/mat/in-car-2.webp",
    alt_text: "Dywaniki w aucie 2",
    sort_order: 2,
    is_active: true,
  },
]

describe("buildConfiguratorV2PreviewGallery", () => {
  it("orders vehicle gallery as model template first, then in-car photos", () => {
    const items = buildConfiguratorV2PreviewGallery({
      dynamicPreviewPath: "/dywaniki/test.webp",
      hasFullDynamicPreview: false,
      isVehiclePreviewReady: true,
      matProductImages: [...inCarImages, templateImage],
      productGalleryImages: [],
      showProductGallery: false,
      defaultAlt: "Podgląd",
    })

    expect(items.map((item) => item.kind)).toEqual([
      "model-template",
      "in-car-photo",
      "in-car-photo",
    ])
    expect(items[0]?.imageUrl).toBe("/mat/template.webp")
  })

  it("places dynamic preview before vehicle photos when config is complete", () => {
    const items = buildConfiguratorV2PreviewGallery({
      dynamicPreviewPath: "/dywaniki/test.webp",
      hasFullDynamicPreview: true,
      isVehiclePreviewReady: true,
      matProductImages: [templateImage, ...inCarImages],
      productGalleryImages: [],
      showProductGallery: false,
      defaultAlt: "Podgląd",
    })

    expect(items.map((item) => item.kind)).toEqual([
      "dynamic",
      "model-template",
      "in-car-photo",
      "in-car-photo",
    ])
  })

  it("skips vehicle photos until vehicle context is complete", () => {
    const items = buildConfiguratorV2PreviewGallery({
      dynamicPreviewPath: "/dywaniki/fallback.webp",
      hasFullDynamicPreview: false,
      isVehiclePreviewReady: false,
      matProductImages: [templateImage, ...inCarImages],
      productGalleryImages: [],
      showProductGallery: false,
      defaultAlt: "Podgląd",
    })

    expect(items).toEqual([])
  })

  it("appends product-set gallery when enabled", () => {
    const items = buildConfiguratorV2PreviewGallery({
      dynamicPreviewPath: "/dywaniki/test.webp",
      hasFullDynamicPreview: true,
      isVehiclePreviewReady: true,
      matProductImages: [templateImage],
      productGalleryImages: ["/set/1.webp", "/set/2.webp"],
      showProductGallery: true,
      defaultAlt: "Podgląd",
    })

    expect(items.map((item) => item.kind)).toEqual([
      "dynamic",
      "model-template",
      "product-set",
      "product-set",
    ])
  })

  it("uses entry preview image before mat_product_images load", () => {
    const items = buildConfiguratorV2PreviewGallery({
      dynamicPreviewPath: "/dywaniki/fallback.webp",
      hasFullDynamicPreview: false,
      isVehiclePreviewReady: true,
      matProductImages: [],
      productGalleryImages: [],
      showProductGallery: false,
      defaultAlt: "Podgląd",
      entryPreviewImage: "/mat/from-card.webp",
    })

    expect(items).toHaveLength(1)
    expect(items[0]?.kind).toBe("model-template")
    expect(items[0]?.imageUrl).toBe("/mat/from-card.webp")
  })
})

describe("resolveDefaultGalleryItemId", () => {
  it("matches auto image src when present in gallery", () => {
    const items = buildConfiguratorV2PreviewGallery({
      dynamicPreviewPath: "/dywaniki/test.webp",
      hasFullDynamicPreview: false,
      isVehiclePreviewReady: true,
      matProductImages: [templateImage, ...inCarImages],
      productGalleryImages: [],
      showProductGallery: false,
      defaultAlt: "Podgląd",
    })

    expect(resolveDefaultGalleryItemId(items, "/mat/template.webp")).toBe(
      "model-template-1",
    )
  })
})

describe("resolveVehiclePreviewImageSrc", () => {
  it("uses model template after vehicle context is complete", () => {
    expect(
      resolveVehiclePreviewImageSrc({
        hasFullDynamicPreview: false,
        isVehiclePreviewReady: true,
        modelTemplateUrl: "/mat/template.webp",
        dynamicPreviewPath: "/dywaniki/fallback.webp",
      }),
    ).toBe("/mat/template.webp")
  })

  it("uses dynamic preview when mat configuration is complete", () => {
    expect(
      resolveVehiclePreviewImageSrc({
        hasFullDynamicPreview: true,
        isVehiclePreviewReady: true,
        modelTemplateUrl: "/mat/template.webp",
        dynamicPreviewPath: "/dywaniki/test.webp",
      }),
    ).toBe("/dywaniki/test.webp")
  })

  it("uses brand logo fallback on locked vehicle entry without template", () => {
    expect(
      resolveVehiclePreviewImageSrc({
        hasFullDynamicPreview: false,
        isVehiclePreviewReady: true,
        modelTemplateUrl: null,
        dynamicPreviewPath: "/dywaniki/fallback.webp",
        suppressDynamicFallback: true,
        brandLogoFallback: "/modele/bmw.jpg",
      }),
    ).toBe("/modele/bmw.jpg")
  })

  it("avoids generic mat fallback on locked vehicle entry without any preview", () => {
    expect(
      resolveVehiclePreviewImageSrc({
        hasFullDynamicPreview: false,
        isVehiclePreviewReady: true,
        modelTemplateUrl: null,
        dynamicPreviewPath: "/dywaniki/fallback.webp",
        suppressDynamicFallback: true,
      }),
    ).toBe("")
  })
})
