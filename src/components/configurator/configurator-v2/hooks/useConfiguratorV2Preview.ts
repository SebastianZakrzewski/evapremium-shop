"use client"

import { useEffect, useMemo, useState } from "react"
import { getMatImagePath } from "@/lib/image-mapping"
import {
  getMatTypeForDynamicPreview,
  isMatTypeSelected,
  usesClassicOnlyDynamicPreview,
} from "@/components/configurator/configurator-simple/rugPreviewConfig"
import type { ProductEntryLock } from "@/features/car-configurator/utils/productEntryContext"
import type { MatProductImage } from "@/features/mat-product-images"
import type { MatModelPreview } from "@/features/mat-model-previews"
import type { MatRealizationPhoto } from "@/features/mat-realization-photos"
import type { ConfiguratorState } from "@/features/car-configurator/utils/configuratorState"
import { brandNameToNavigationSlug, getBrandLogo } from "@/shared/brands"
import {
  buildConfiguratorV2PreviewGallery,
  resolveDefaultGalleryItemId,
  resolveVehiclePreviewImageSrc,
  type PreviewGalleryItem,
} from "../preview/buildConfiguratorV2PreviewGallery"
import { partitionMatProductImages } from "../preview/partitionMatProductImages"
import { resolveVehiclePreviewContext } from "../preview/resolveVehiclePreviewContext"
import { buildRealizationPreviewCaption } from "../preview/buildRealizationPreviewCaption"
import { isMatRealizationMatType } from "@/features/mat-realization-photos"

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
  galleryItems: PreviewGalleryItem[]
  activeGalleryId: string | null
  showGallery: boolean
  showEmptyInCarSlot: boolean
  usesMatPreviewCanvas: boolean
  lightboxImages: string[]
  lightboxIndex: number
  realizationCaption: string | null
  selectGalleryItem: (id: string) => void
}

export const useConfiguratorV2Preview = (
  config: ConfiguratorState,
  matProductImages: MatProductImage[],
  productEntry: ProductEntryLock,
  realizationPhotos: MatRealizationPhoto[] = [],
  modelPreviews: MatModelPreview[] = [],
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
    !usesClassicOnlyDynamicPreview(config.matType, config.pricingCategoryKey) &&
    !!config.variant

  const productGalleryImages =
    config.matType === "3d-with-rims" ? rimsProductImages : classicProductImages

  const selectedProductImage =
    config.matType === "3d-with-rims" ? RIMS_GALLERY_DEFAULT : CLASSIC_GALLERY_DEFAULT

  const orderedProductGalleryImages = useMemo(() => {
    if (!productGalleryImages.includes(selectedProductImage)) {
      return productGalleryImages
    }

    return [
      selectedProductImage,
      ...productGalleryImages.filter((imageUrl) => imageUrl !== selectedProductImage),
    ]
  }, [productGalleryImages, selectedProductImage])

  const entryPreviewImage = productEntry.previewImageParam
  const brandPlaceholderUrl = useMemo(() => {
    const slug =
      config.brandKey ||
      productEntry.brandParam ||
      (config.brand ? brandNameToNavigationSlug(config.brand) : "")
    if (!slug) return null
    return getBrandLogo(slug)
  }, [config.brand, config.brandKey, productEntry.brandParam])
  const { isVehiclePreviewReady } = resolveVehiclePreviewContext(
    config,
    productEntry,
  )

  const { modelTemplate } = useMemo(
    () => partitionMatProductImages(matProductImages),
    [matProductImages],
  )

  const primaryModelPreviewUrl = useMemo(() => {
    if (modelPreviews.length === 0) return null
    const primary =
      modelPreviews.find((preview) => preview.is_primary) ?? modelPreviews[0]
    return primary?.image_url ?? null
  }, [modelPreviews])

  const modelTemplateUrl = useMemo(() => {
    const entryImage = entryPreviewImage?.trim() ?? null
    if (productEntry.isLocked && entryImage) {
      return entryImage
    }
    return primaryModelPreviewUrl ?? modelTemplate?.image_url ?? entryImage
  }, [
    entryPreviewImage,
    modelTemplate,
    primaryModelPreviewUrl,
    productEntry.isLocked,
  ])

  const isVehicleContextComplete = !!(
    config.brand &&
    config.model &&
    config.year &&
    config.bodyType
  )

  const hasDynamicMatPreview = !!(
    isMatTypeSelected(config.matType) &&
    isVehicleContextComplete &&
    config.structure &&
    config.color &&
    config.edgeColor
  )

  const autoImageSrc = resolveVehiclePreviewImageSrc({
    hasFullDynamicPreview: hasDynamicMatPreview,
    brandPlaceholderUrl:
      isVehiclePreviewReady && !hasDynamicMatPreview
        ? null
        : brandPlaceholderUrl,
    modelTemplateUrl:
      modelTemplateUrl ??
      (realizationPhotos[0]?.image_url ?? null),
    dynamicPreviewPath,
  })

  const alt =
    config.brand && config.model
      ? `Podgląd dywaników ${config.brand} ${config.model}`
      : "Podgląd dywaników EVA"

  const galleryItems = useMemo(
    () =>
      buildConfiguratorV2PreviewGallery({
        dynamicPreviewPath,
        hasFullDynamicPreview: hasDynamicMatPreview,
        isVehiclePreviewReady,
        matProductImages,
        modelPreviews,
        realizationPhotos,
        productGalleryImages: orderedProductGalleryImages,
        showProductGallery,
        defaultAlt: alt,
        brandPlaceholderUrl,
        entryPreviewImage,
        preferEntryPreviewImage: productEntry.isLocked,
      }),
    [
      dynamicPreviewPath,
      hasDynamicMatPreview,
      isVehiclePreviewReady,
      matProductImages,
      modelPreviews,
      realizationPhotos,
      orderedProductGalleryImages,
      showProductGallery,
      alt,
      entryPreviewImage,
      productEntry.isLocked,
      brandPlaceholderUrl,
    ],
  )

  const defaultGalleryId = useMemo(
    () =>
      resolveDefaultGalleryItemId(galleryItems, autoImageSrc, {
        preferBrandPlaceholder:
          !!brandPlaceholderUrl &&
          !hasDynamicMatPreview &&
          !isVehiclePreviewReady,
        preferModelTemplate:
          productEntry.isLocked &&
          isVehiclePreviewReady &&
          !hasDynamicMatPreview &&
          !brandPlaceholderUrl,
      }),
    [
      galleryItems,
      autoImageSrc,
      productEntry.isLocked,
      isVehiclePreviewReady,
      hasDynamicMatPreview,
      brandPlaceholderUrl,
    ],
  )

  const [activeGalleryId, setActiveGalleryId] = useState<string | null>(
    defaultGalleryId,
  )

  const dynamicSelectionKey = [
    config.brand,
    config.model,
    config.year,
    config.generation,
    config.bodyType,
    productEntry.bodyTypeParam,
    productEntry.generationParam,
    productEntry.previewImageParam,
    config.variant,
    config.structure,
    config.color,
    config.edgeColor,
    config.pricingCategoryKey,
    config.matType,
    modelTemplateUrl,
    hasDynamicMatPreview,
  ].join("|")

  useEffect(() => {
    setActiveGalleryId(defaultGalleryId)
    // Reset preview only when configuration changes, not when gallery items load.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- defaultGalleryId is read from the same render as dynamicSelectionKey
  }, [dynamicSelectionKey])

  const activeGalleryItem =
    galleryItems.find((item) => item.id === activeGalleryId) ?? galleryItems[0]

  const imageSrc =
    activeGalleryItem?.kind === "dynamic"
      ? dynamicPreviewPath
      : activeGalleryItem?.imageUrl ?? autoImageSrc
  const hasInCarPhotos = galleryItems.some((item) => item.kind === "in-car-photo")
  const showEmptyInCarSlot = isVehiclePreviewReady && !hasInCarPhotos
  const showGallery =
    !!brandPlaceholderUrl ||
    isVehiclePreviewReady ||
    galleryItems.length > 1
  const lightboxImages = galleryItems.map((item) => item.imageUrl)
  const lightboxIndex = Math.max(
    0,
    galleryItems.findIndex((item) => item.id === activeGalleryItem?.id),
  )

  const realizationCaption =
    activeGalleryItem?.kind === "in-car-photo" &&
    isMatRealizationMatType(config.matType)
      ? buildRealizationPreviewCaption({
          matType: config.matType,
          brand: config.brand,
          model: config.model,
          generation: config.generation,
        })
      : null

  return {
    imageSrc,
    alt: activeGalleryItem?.altText ?? alt,
    showProductGallery,
    productGalleryImages,
    selectedProductImage,
    galleryItems,
    activeGalleryId: activeGalleryItem?.id ?? null,
    showGallery,
    showEmptyInCarSlot,
    usesMatPreviewCanvas: hasDynamicMatPreview,
    lightboxImages,
    lightboxIndex,
    realizationCaption,
    selectGalleryItem: setActiveGalleryId,
  }
}
