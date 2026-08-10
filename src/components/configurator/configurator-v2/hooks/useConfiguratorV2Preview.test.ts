import { renderHook, act } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import type { ConfiguratorState } from "@/features/car-configurator/utils/configuratorState"
import type { ProductEntryLock } from "@/features/car-configurator/utils/productEntryContext"
import { useConfiguratorV2Preview } from "./useConfiguratorV2Preview"

const baseConfig: ConfiguratorState = {
  brand: "BMW",
  brandKey: "bmw",
  model: "3 Compact",
  modelFamilyKey: "3-compact",
  modelKey: "3-e36-compact",
  generation: "3 gen",
  year: "1994",
  bodyType: "Hatchback",
  bodyTypeKey: "hatchback",
  recordKey: "bmw-3-compact",
  templateId: "",
  matType: "single",
  pricingCategoryKey: "minivan",
  catalogVersionCode: "v1",
  variant: "",
  structure: "",
  color: "",
  edgeColor: "",
  selectedPodpietka: null,
  podpietkaColor: "",
  heelPad: false,
}

const unlockedEntry: ProductEntryLock = {
  isLocked: false,
  brandParam: null,
  modelParam: null,
  yearParam: null,
  bodyTypeParam: null,
  generationParam: null,
  previewImageParam: null,
}

const lockedEntry = (
  overrides: Partial<ProductEntryLock> = {},
): ProductEntryLock => ({
  isLocked: true,
  brandParam: "bmw",
  modelParam: "3 Compact",
  yearParam: null,
  bodyTypeParam: "Hatchback",
  generationParam: "3 gen",
  previewImageParam: null,
  ...overrides,
})

const matImages = [
  {
    id: 10,
    car_brand_slug: "bmw",
    car_model_slug: "3-e36-compact",
    generation: "3 gen",
    year: 1994,
    body_type: "hatchback",
    image_url: "/mat/template.webp",
    alt_text: "Schemat BMW 3 Compact",
    sort_order: 0,
    is_active: true,
  },
  {
    id: 11,
    car_brand_slug: "bmw",
    car_model_slug: "3-e36-compact",
    generation: "3 gen",
    year: 1994,
    body_type: "hatchback",
    image_url: "/mat/in-car.webp",
    alt_text: "Dywaniki w BMW 3 Compact",
    sort_order: 1,
    is_active: true,
  },
]

describe("useConfiguratorV2Preview", () => {
  it("shows vehicle gallery in stage 1 after vehicle context is ready", () => {
    const { result } = renderHook(() =>
      useConfiguratorV2Preview(baseConfig, matImages, unlockedEntry),
    )

    expect(result.current.imageSrc).toBe("/mat/template.webp")
    expect(result.current.galleryItems.map((item) => item.kind)).toEqual([
      "model-template",
      "in-car-photo",
    ])
    expect(result.current.showGallery).toBe(true)
    expect(result.current.showEmptyInCarSlot).toBe(false)
  })

  it("shows brand placeholder before vehicle context is ready", () => {
    const { result } = renderHook(() =>
      useConfiguratorV2Preview(
        {
          ...baseConfig,
          model: "",
          modelKey: "",
          generation: "",
          year: "",
          bodyType: "",
          bodyTypeKey: "",
        },
        matImages,
        unlockedEntry,
      ),
    )

    expect(result.current.imageSrc).toBe("/modele/bmw.png")
    expect(result.current.galleryItems.map((item) => item.kind)).toEqual([
      "brand-placeholder",
    ])
  })

  it("shows realization photos before year when mat type photos are provided", () => {
    const realizationPhotos = [
      {
        id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        mat_template_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        mat_type: "3d-with-rims" as const,
        image_url: "/realization/1.png",
        alt_text: "Realizacja 1",
        caption: null,
        sort_order: 0,
        is_primary: true,
        is_active: true,
      },
    ]

    const { result } = renderHook(() =>
      useConfiguratorV2Preview(
        {
          ...baseConfig,
          year: "",
          bodyType: "",
          bodyTypeKey: "",
          recordKey: "",
          matType: "3d-with-rims",
        },
        [],
        unlockedEntry,
        realizationPhotos,
      ),
    )

    expect(result.current.galleryItems.map((item) => item.kind)).toEqual([
      "in-car-photo",
    ])
    expect(result.current.imageSrc).toBe("/realization/1.png")
    expect(result.current.showEmptyInCarSlot).toBe(false)
  })

  it("renders realization photos for selected mat type in preview gallery", () => {
    const realizationPhotos = [
      {
        id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        mat_template_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        mat_type: "3d-with-rims" as const,
        image_url: "/realization/1.png",
        alt_text: "Realizacja 1",
        caption: null,
        sort_order: 0,
        is_primary: true,
        is_active: true,
      },
      {
        id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
        mat_template_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        mat_type: "3d-with-rims" as const,
        image_url: "/realization/2.png",
        alt_text: "Realizacja 2",
        caption: null,
        sort_order: 1,
        is_primary: false,
        is_active: true,
      },
    ]

    const { result } = renderHook(() =>
      useConfiguratorV2Preview(
        {
          ...baseConfig,
          matType: "3d-with-rims",
        },
        [matImages[0]!],
        unlockedEntry,
        realizationPhotos,
      ),
    )

    expect(result.current.galleryItems.map((item) => item.kind)).toEqual([
      "model-template",
      "in-car-photo",
      "in-car-photo",
    ])
    expect(result.current.galleryItems[1]?.imageUrl).toBe("/realization/1.png")
    expect(result.current.showEmptyInCarSlot).toBe(false)
  })

  it("does not show realization photos when parent passes empty list", () => {
    const { result } = renderHook(() =>
      useConfiguratorV2Preview(
        {
          ...baseConfig,
          matType: "classic",
        },
        [matImages[0]!],
        unlockedEntry,
        [],
      ),
    )

    expect(
      result.current.galleryItems.every((item) => item.kind !== "in-car-photo"),
    ).toBe(true)
  })

  it("keeps manual gallery selection when gallery items update without config change", () => {
    const config = {
      ...baseConfig,
      matType: "3d-with-rims" as const,
      pricingCategoryKey: "standard",
      variant: "",
      structure: "diamonds",
      color: "black",
      edgeColor: "black",
    }

    const { result, rerender } = renderHook(
      ({ config, images, entry }) =>
        useConfiguratorV2Preview(config, images, entry),
      {
        initialProps: {
          config,
          images: matImages,
          entry: unlockedEntry,
        },
      },
    )

    act(() => {
      result.current.selectGalleryItem("in-car-photo-11")
    })

    expect(result.current.activeGalleryId).toBe("in-car-photo-11")
    expect(result.current.imageSrc).toBe("/mat/in-car.webp")

    rerender({
      config,
      images: [...matImages],
      entry: unlockedEntry,
    })

    expect(result.current.activeGalleryId).toBe("in-car-photo-11")
    expect(result.current.imageSrc).toBe("/mat/in-car.webp")
  })

  it("switches gallery selection manually after dynamic preview is active", () => {
    const { result } = renderHook(() =>
      useConfiguratorV2Preview(
        {
          ...baseConfig,
          matType: "3d-with-rims",
          pricingCategoryKey: "standard",
          variant: "",
          structure: "diamonds",
          color: "black",
          edgeColor: "black",
        },
        matImages,
        unlockedEntry,
      ),
    )

    act(() => {
      result.current.selectGalleryItem("in-car-photo-11")
    })

    expect(result.current.imageSrc).toBe("/mat/in-car.webp")
    expect(result.current.activeGalleryId).toBe("in-car-photo-11")
  })

  it("shows entry preview on locked card entry before year is selected", () => {
    const { result } = renderHook(() =>
      useConfiguratorV2Preview(
        { ...baseConfig, year: "" },
        [],
        lockedEntry({ previewImageParam: "/mat/from-card.webp" }),
      ),
    )

    expect(result.current.imageSrc).toBe("/mat/from-card.webp")
    expect(result.current.galleryItems[0]?.kind).toBe("model-template")
    expect(result.current.showGallery).toBe(true)
    expect(result.current.showEmptyInCarSlot).toBe(true)
  })

  it("uses entry preview image before mat images are loaded", () => {
    const { result } = renderHook(() =>
      useConfiguratorV2Preview(
        baseConfig,
        [],
        lockedEntry({ previewImageParam: "/mat/from-card.webp" }),
      ),
    )

    expect(result.current.imageSrc).toBe("/mat/from-card.webp")
    expect(result.current.galleryItems[0]?.kind).toBe("model-template")
  })

  it("does not show product-set gallery until variant is selected", () => {
    const { result } = renderHook(() =>
      useConfiguratorV2Preview(
        {
          ...baseConfig,
          matType: "3d-with-rims",
          pricingCategoryKey: "standard",
          variant: "",
        },
        matImages,
        lockedEntry({ previewImageParam: "/mat/from-card.webp" }),
      ),
    )

    expect(result.current.showProductGallery).toBe(false)
    expect(result.current.galleryItems.every((item) => item.kind !== "product-set")).toBe(
      true,
    )
    expect(result.current.imageSrc).toBe("/mat/from-card.webp")
  })

  it("hides empty in-car placeholders when real photos exist", () => {
    const { result } = renderHook(() =>
      useConfiguratorV2Preview(
        {
          ...baseConfig,
          matType: "3d-with-rims",
          pricingCategoryKey: "standard",
          variant: "",
          structure: "diamonds",
          color: "black",
          edgeColor: "black",
        },
        matImages,
        unlockedEntry,
      ),
    )

    expect(result.current.showEmptyInCarSlot).toBe(false)
    expect(result.current.showGallery).toBe(true)
  })

  it("shows dynamic mat preview after mat type is selected without variant", () => {
    const { result } = renderHook(() =>
      useConfiguratorV2Preview(
        {
          ...baseConfig,
          matType: "3d-with-rims",
          pricingCategoryKey: "standard",
          variant: "",
          structure: "diamonds",
          color: "black",
          edgeColor: "black",
        },
        matImages,
        unlockedEntry,
      ),
    )

    expect(result.current.galleryItems[0]?.kind).toBe("dynamic")
    expect(result.current.imageSrc).toContain("/dywaniki/")
    expect(result.current.activeGalleryId).toBe("dynamic")
  })

  it("resets to dynamic preview when mat type is selected", () => {
    const { result, rerender } = renderHook(
      ({ config, images, entry }) =>
        useConfiguratorV2Preview(config, images, entry),
      {
        initialProps: {
          config: baseConfig,
          images: matImages,
          entry: unlockedEntry,
        },
      },
    )

    act(() => {
      result.current.selectGalleryItem("in-car-photo-11")
    })

    rerender({
      config: {
        ...baseConfig,
        matType: "classic",
        pricingCategoryKey: "standard",
        variant: "",
        structure: "diamonds",
        color: "black",
        edgeColor: "black",
      },
      images: matImages,
      entry: unlockedEntry,
    })

    expect(result.current.activeGalleryId).toBe("dynamic")
    expect(result.current.imageSrc).toContain("/dywaniki/")
    expect(result.current.galleryItems[1]?.kind).toBe("model-template")
  })

  it("places product-set images right after dynamic preview when variant is selected", () => {
    const { result } = renderHook(() =>
      useConfiguratorV2Preview(
        {
          ...baseConfig,
          matType: "3d-with-rims",
          pricingCategoryKey: "standard",
          variant: "5os",
          structure: "diamonds",
          color: "black",
          edgeColor: "black",
        },
        matImages,
        unlockedEntry,
      ),
    )

    expect(result.current.galleryItems.map((item) => item.kind)).toEqual([
      "dynamic",
      "product-set",
      "product-set",
      "product-set",
      "product-set",
      "model-template",
      "in-car-photo",
    ])
    expect(result.current.galleryItems[1]?.imageUrl).toBe(
      "/zrantamiprodukt/5_-_1.webp",
    )
  })

  it("resets to dynamic preview when color changes while viewing product-set photo", () => {
    const configWithVariant = {
      ...baseConfig,
      matType: "3d-with-rims" as const,
      pricingCategoryKey: "standard",
      variant: "5os",
      structure: "diamonds",
      color: "black",
      edgeColor: "black",
    }

    const { result, rerender } = renderHook(
      ({ config, images, entry }) =>
        useConfiguratorV2Preview(config, images, entry),
      {
        initialProps: {
          config: configWithVariant,
          images: matImages,
          entry: unlockedEntry,
        },
      },
    )

    act(() => {
      result.current.selectGalleryItem("product-set-1")
    })

    expect(result.current.activeGalleryId).toBe("product-set-1")

    rerender({
      config: {
        ...configWithVariant,
        color: "red",
      },
      images: matImages,
      entry: unlockedEntry,
    })

    expect(result.current.activeGalleryId).toBe("dynamic")
    expect(result.current.imageSrc).toContain("/dywaniki/")
  })

  it("exposes realization caption when an in-car photo is active", () => {
    const realizationPhotos = [
      {
        id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        mat_template_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        mat_type: "3d-with-rims" as const,
        image_url: "/realization/1.png",
        alt_text: "Realizacja 1",
        caption: null,
        sort_order: 0,
        is_primary: true,
        is_active: true,
      },
    ]

    const { result } = renderHook(() =>
      useConfiguratorV2Preview(
        {
          ...baseConfig,
          brand: "Nissan",
          model: "Qashqai(J12) III gen",
          generation: "2021-2028",
          matType: "3d-with-rims",
        },
        [],
        unlockedEntry,
        realizationPhotos,
      ),
    )

    act(() => {
      result.current.selectGalleryItem(
        `in-car-photo-${realizationPhotos[0]!.id}`,
      )
    })

    expect(result.current.realizationCaption).toBe(
      "Są to realne zdjęcia realizacji dywaników 3D z rantami do Nissan Qashqai(J12) III gen 2021-2028",
    )
  })

  it("hides realization caption for non realization gallery items", () => {
    const { result } = renderHook(() =>
      useConfiguratorV2Preview(baseConfig, matImages, unlockedEntry, []),
    )

    expect(result.current.realizationCaption).toBeNull()
  })
})
