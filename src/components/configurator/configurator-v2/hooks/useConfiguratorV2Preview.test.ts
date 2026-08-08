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
  it("shows model template first after vehicle context is complete", () => {
    const { result } = renderHook(() =>
      useConfiguratorV2Preview(baseConfig, matImages, unlockedEntry),
    )

    expect(result.current.imageSrc).toBe("/mat/template.webp")
    expect(result.current.galleryItems.map((item) => item.kind)).toEqual([
      "model-template",
      "in-car-photo",
    ])
    expect(result.current.showGallery).toBe(true)
  })

  it("switches gallery selection manually", () => {
    const { result } = renderHook(() =>
      useConfiguratorV2Preview(baseConfig, matImages, unlockedEntry),
    )

    act(() => {
      result.current.selectGalleryItem("in-car-photo-11")
    })

    expect(result.current.imageSrc).toBe("/mat/in-car.webp")
    expect(result.current.activeGalleryId).toBe("in-car-photo-11")
  })

  it("shows entry preview image on locked card entry before year is selected", () => {
    const { result } = renderHook(() =>
      useConfiguratorV2Preview(
        { ...baseConfig, year: "" },
        [],
        lockedEntry({ previewImageParam: "/mat/from-card.webp" }),
      ),
    )

    expect(result.current.imageSrc).toBe("/mat/from-card.webp")
    expect(result.current.galleryItems[0]?.kind).toBe("model-template")
    expect(result.current.activeGalleryId).toBe("model-template-entry")
    expect(result.current.showGallery).toBe(true)
    expect(result.current.showEmptyInCarSlot).toBe(true)
  })

  it("shows entry preview image before mat images are loaded", () => {
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
      useConfiguratorV2Preview(baseConfig, matImages, unlockedEntry),
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
})
