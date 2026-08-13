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
  it("shows brand placeholder before vehicle context is ready", () => {
    const items = buildConfiguratorV2PreviewGallery({
      dynamicPreviewPath: "/dywaniki/fallback.webp",
      hasFullDynamicPreview: false,
      isVehiclePreviewReady: false,
      matProductImages: [templateImage, ...inCarImages],
      productGalleryImages: [],
      showProductGallery: false,
      defaultAlt: "Podgląd",
      brandPlaceholderUrl: "/modele/bmw.png",
    })

    expect(items).toEqual([
      {
        id: "brand-placeholder",
        imageUrl: "/modele/bmw.png",
        altText: "Podgląd",
        kind: "brand-placeholder",
      },
    ])
  })

  it("prefers realization photos over mat_product_images in-car photos", () => {
    const items = buildConfiguratorV2PreviewGallery({
      dynamicPreviewPath: "/dywaniki/fallback.webp",
      hasFullDynamicPreview: false,
      isVehiclePreviewReady: true,
      matProductImages: [templateImage, ...inCarImages],
      realizationPhotos: [
        {
          id: "11111111-1111-1111-1111-111111111111",
          mat_template_id: "22222222-2222-2222-2222-222222222222",
          mat_type: "3d-with-rims",
          image_url: "/realization/qashqai-1.png",
          alt_text: "Realizacja Qashqai 1",
          caption: "Kierowca",
          sort_order: 0,
          is_primary: true,
          is_active: true,
        },
        {
          id: "33333333-3333-3333-3333-333333333333",
          mat_template_id: "22222222-2222-2222-2222-222222222222",
          mat_type: "3d-with-rims",
          image_url: "/realization/qashqai-2.png",
          alt_text: "Realizacja Qashqai 2",
          caption: "Tył",
          sort_order: 1,
          is_primary: false,
          is_active: true,
        },
      ],
      productGalleryImages: [],
      showProductGallery: false,
      defaultAlt: "Podgląd",
      brandPlaceholderUrl: "/modele/nissan.png",
    })

    expect(items.map((item) => item.kind)).toEqual([
      "model-template",
      "in-car-photo",
      "in-car-photo",
    ])
    expect(items[1]?.imageUrl).toBe("/realization/qashqai-1.png")
    expect(items[2]?.imageUrl).toBe("/realization/qashqai-2.png")
  })

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

  it("places product-set gallery right after dynamic preview when enabled", () => {
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
      "product-set",
      "product-set",
      "model-template",
    ])
    expect(items[1]?.imageUrl).toBe("/set/1.webp")
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

  it("prefers mat_model_previews over mat_product_images model template", () => {
    const items = buildConfiguratorV2PreviewGallery({
      dynamicPreviewPath: "/dywaniki/fallback.webp",
      hasFullDynamicPreview: false,
      isVehiclePreviewReady: true,
      matProductImages: [templateImage, ...inCarImages],
      modelPreviews: [
        {
          id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
          mat_template_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
          body_type_key: "suv",
          image_url: "/dywaniki/previews/opel-mokka-1-gen.png",
          alt_text: "Opel Mokka I",
          caption: "Opel Mokka I",
          sort_order: 0,
          is_primary: true,
          is_active: true,
        },
        {
          id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
          mat_template_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
          body_type_key: null,
          image_url: "/dywaniki/previews/opel-mokka-1-gen-2.png",
          alt_text: "Opel Mokka I side",
          caption: null,
          sort_order: 1,
          is_primary: false,
          is_active: true,
        },
      ],
      productGalleryImages: [],
      showProductGallery: false,
      defaultAlt: "Podgląd",
    })

    expect(items.map((item) => item.kind)).toEqual([
      "model-template",
      "model-template",
      "in-car-photo",
      "in-car-photo",
    ])
    expect(items[0]?.imageUrl).toBe("/dywaniki/previews/opel-mokka-1-gen.png")
    expect(items[1]?.imageUrl).toBe("/dywaniki/previews/opel-mokka-1-gen-2.png")
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
  it("uses brand placeholder before dynamic preview is ready", () => {
    expect(
      resolveVehiclePreviewImageSrc({
        hasFullDynamicPreview: false,
        brandPlaceholderUrl: "/modele/bmw.png",
        modelTemplateUrl: "/mat/template.webp",
        dynamicPreviewPath: "/dywaniki/fallback.webp",
      }),
    ).toBe("/modele/bmw.png")
  })

  it("uses model template when brand placeholder is unavailable", () => {
    expect(
      resolveVehiclePreviewImageSrc({
        hasFullDynamicPreview: false,
        modelTemplateUrl: "/mat/template.webp",
        dynamicPreviewPath: "/dywaniki/fallback.webp",
      }),
    ).toBe("/mat/template.webp")
  })

  it("uses dynamic preview when mat configuration is complete", () => {
    expect(
      resolveVehiclePreviewImageSrc({
        hasFullDynamicPreview: true,
        brandPlaceholderUrl: "/modele/bmw.png",
        modelTemplateUrl: "/mat/template.webp",
        dynamicPreviewPath: "/dywaniki/test.webp",
      }),
    ).toBe("/dywaniki/test.webp")
  })

  it("falls back to dynamic preview when no brand or template exists", () => {
    expect(
      resolveVehiclePreviewImageSrc({
        hasFullDynamicPreview: false,
        modelTemplateUrl: null,
        dynamicPreviewPath: "/dywaniki/fallback.webp",
      }),
    ).toBe("/dywaniki/fallback.webp")
  })
})
