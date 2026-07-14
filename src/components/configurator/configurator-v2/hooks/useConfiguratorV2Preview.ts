"use client"

import { useMemo } from "react"
import { getMatImagePath } from "@/lib/image-mapping"
import {
  getMatTypeForDynamicPreview,
  isMatTypeSelected,
  usesClassicOnlyDynamicPreview,
} from "@/components/configurator/configurator-simple/rugPreviewConfig"
import type { ConfiguratorState } from "@/features/car-configurator/utils/configuratorState"

const CLASSIC_GALLERY_DEFAULT = "/bezrantowprodukt/5-_4_red.webp"
const RIMS_GALLERY_DEFAULT = "/zrantamiprodukt/5_-_1.webp"
const FALLBACK_PREVIEW =
  "/dywaniki/3d/diamonds/black/5os-3d-diamonds-black-black.webp"

export type ConfiguratorV2PreviewState = {
  imageSrc: string
  alt: string
  showProductGallery: boolean
  productGalleryImages: string[]
  selectedProductImage: string
}

export const useConfiguratorV2Preview = (
  config: ConfiguratorState,
  matProductImage: string | null,
): ConfiguratorV2PreviewState => {
  const classicProductImages = useMemo(
    () => [
      "/bezrantowprodukt/5-_4_red.webp",
      "/bezrantowprodukt/5-_5_red.webp",
      "/bezrantowprodukt/6_-_1.webp",
      "/bezrantowprodukt/4_-_2_1.webp",
    ],
    [],
  )

  const rimsProductImages = useMemo(
    () => [
      "/zrantamiprodukt/5_-_1.webp",
      "/zrantamiprodukt/5_-_2.webp",
      "/zrantamiprodukt/5_-_4.webp",
      "/zrantamiprodukt/5_-_5.webp",
    ],
    [],
  )

  const dynamicPreviewPath = useMemo(() => {
    if (!config.structure || !config.color || !config.edgeColor) {
      return FALLBACK_PREVIEW
    }
    const matType = getMatTypeForDynamicPreview(
      config.matType,
      config.pricingCategoryKey,
    )
    return getMatImagePath(
      matType,
      config.structure,
      config.color,
      config.edgeColor,
    )
  }, [
    config.matType,
    config.pricingCategoryKey,
    config.structure,
    config.color,
    config.edgeColor,
  ])

  const showProductGallery =
    isMatTypeSelected(config.matType) &&
    !usesClassicOnlyDynamicPreview(config.matType, config.pricingCategoryKey)

  const productGalleryImages =
    config.matType === "3d-with-rims" ? rimsProductImages : classicProductImages

  const selectedProductImage =
    config.matType === "3d-with-rims" ? RIMS_GALLERY_DEFAULT : CLASSIC_GALLERY_DEFAULT

  const hasVehicleOnly = !!(config.brand && config.model) && !config.variant

  const imageSrc = config.variant
    ? dynamicPreviewPath
    : hasVehicleOnly && matProductImage
      ? matProductImage
      : matProductImage || dynamicPreviewPath

  const alt = config.brand && config.model
    ? `Podgląd dywaników ${config.brand} ${config.model}`
    : "Podgląd dywaników EVA"

  return {
    imageSrc,
    alt,
    showProductGallery,
    productGalleryImages,
    selectedProductImage,
  }
}
