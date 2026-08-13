import type { MatProductImage } from "@/features/mat-product-images"
import type { MatModelPreview } from "@/features/mat-model-previews"
import type { MatRealizationPhoto } from "@/features/mat-realization-photos"
import { partitionMatProductImages } from "./partitionMatProductImages"

export type PreviewGalleryItemKind =
  | "dynamic"
  | "brand-placeholder"
  | "model-template"
  | "in-car-photo"
  | "product-set"

export type PreviewGalleryItem = {
  id: string
  imageUrl: string
  altText: string
  kind: PreviewGalleryItemKind
}

type BuildConfiguratorV2PreviewGalleryParams = {
  dynamicPreviewPath: string
  hasFullDynamicPreview: boolean
  isVehiclePreviewReady: boolean
  matProductImages: MatProductImage[]
  modelPreviews?: MatModelPreview[]
  realizationPhotos?: MatRealizationPhoto[]
  productGalleryImages: string[]
  showProductGallery: boolean
  defaultAlt: string
  brandPlaceholderUrl?: string | null
  entryPreviewImage?: string | null
  preferEntryPreviewImage?: boolean
}

export const buildConfiguratorV2PreviewGallery = ({
  dynamicPreviewPath,
  hasFullDynamicPreview,
  isVehiclePreviewReady,
  matProductImages,
  modelPreviews = [],
  realizationPhotos = [],
  productGalleryImages,
  showProductGallery,
  defaultAlt,
  brandPlaceholderUrl = null,
  entryPreviewImage = null,
  preferEntryPreviewImage = false,
}: BuildConfiguratorV2PreviewGalleryParams): PreviewGalleryItem[] => {
  const items: PreviewGalleryItem[] = []

  // Logo marki tylko przed kompletnym wyborem pojazdu (etap 1 częściowo)
  if (brandPlaceholderUrl && !hasFullDynamicPreview && !isVehiclePreviewReady) {
    items.push({
      id: "brand-placeholder",
      imageUrl: brandPlaceholderUrl,
      altText: defaultAlt,
      kind: "brand-placeholder",
    })
    return items
  }

  if (hasFullDynamicPreview) {
    items.push({
      id: "dynamic",
      imageUrl: dynamicPreviewPath,
      altText: defaultAlt,
      kind: "dynamic",
    })
  }

  if (showProductGallery) {
    productGalleryImages.forEach((imageUrl, index) => {
      items.push({
        id: `product-set-${index}`,
        imageUrl,
        altText: `Zdjęcie produktu ${index + 1}`,
        kind: "product-set",
      })
    })
  }

  if (isVehiclePreviewReady) {
    const { modelTemplate, inCarPhotos } =
      partitionMatProductImages(matProductImages)
    const entryImage = entryPreviewImage?.trim() ?? null
    const seenTemplateUrls = new Set<string>()

    const pushModelTemplate = (
      id: string,
      imageUrl: string,
      altText: string,
    ) => {
      if (seenTemplateUrls.has(imageUrl)) return
      seenTemplateUrls.add(imageUrl)
      items.push({
        id,
        imageUrl,
        altText,
        kind: "model-template",
      })
    }

    if (modelPreviews.length > 0) {
      const orderedPreviews = [...modelPreviews].sort((left, right) => {
        if (left.is_primary !== right.is_primary) {
          return left.is_primary ? -1 : 1
        }
        return left.sort_order - right.sort_order
      })

      orderedPreviews.forEach((preview) => {
        pushModelTemplate(
          `model-template-${preview.id}`,
          preview.image_url,
          preview.alt_text ?? defaultAlt,
        )
      })
    } else {
      const templateUrl =
        preferEntryPreviewImage && entryImage
          ? entryImage
          : modelTemplate?.image_url ?? entryImage

      if (templateUrl) {
        pushModelTemplate(
          modelTemplate
            ? `model-template-${modelTemplate.id}`
            : "model-template-entry",
          templateUrl,
          modelTemplate?.alt_text ?? defaultAlt,
        )
      }
    }

    if (
      preferEntryPreviewImage &&
      entryImage &&
      !seenTemplateUrls.has(entryImage)
    ) {
      pushModelTemplate("model-template-entry", entryImage, defaultAlt)
    }

    const templateUrls = seenTemplateUrls
    const realizationItems = realizationPhotos
      .filter((photo) => !templateUrls.has(photo.image_url))
      .map((photo) => ({
        id: `in-car-photo-${photo.id}`,
        imageUrl: photo.image_url,
        altText:
          photo.alt_text ?? `Realizacja w aucie — ${defaultAlt}`,
        kind: "in-car-photo" as const,
      }))

    if (realizationItems.length > 0) {
      items.push(...realizationItems)
    } else {
      inCarPhotos
        .filter((image) => !templateUrls.has(image.image_url))
        .forEach((image) => {
          items.push({
            id: `in-car-photo-${image.id}`,
            imageUrl: image.image_url,
            altText: image.alt_text ?? `Dywaniki w aucie — ${defaultAlt}`,
            kind: "in-car-photo",
          })
        })
    }
  }

  return items
}

export const resolveDefaultGalleryItemId = (
  galleryItems: PreviewGalleryItem[],
  autoImageSrc: string,
  options?: { preferBrandPlaceholder?: boolean; preferModelTemplate?: boolean },
): string | null => {
  if (galleryItems.length === 0) return null

  if (options?.preferBrandPlaceholder) {
    const brandPlaceholderItem = galleryItems.find(
      (item) => item.kind === "brand-placeholder",
    )
    if (brandPlaceholderItem) return brandPlaceholderItem.id
  }

  if (options?.preferModelTemplate) {
    const modelTemplateItem = galleryItems.find(
      (item) => item.kind === "model-template",
    )
    if (modelTemplateItem) return modelTemplateItem.id
  }

  const matched = galleryItems.find((item) => item.imageUrl === autoImageSrc)
  return matched?.id ?? galleryItems[0]?.id ?? null
}

export const resolveVehiclePreviewImageSrc = ({
  hasFullDynamicPreview,
  brandPlaceholderUrl = null,
  modelTemplateUrl,
  dynamicPreviewPath,
}: {
  hasFullDynamicPreview: boolean
  brandPlaceholderUrl?: string | null
  modelTemplateUrl: string | null
  dynamicPreviewPath: string
}): string => {
  if (hasFullDynamicPreview) {
    return dynamicPreviewPath
  }

  if (brandPlaceholderUrl) {
    return brandPlaceholderUrl
  }

  return modelTemplateUrl || dynamicPreviewPath
}
