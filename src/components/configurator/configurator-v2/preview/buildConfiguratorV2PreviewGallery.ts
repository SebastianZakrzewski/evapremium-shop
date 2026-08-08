import type { MatProductImage } from "@/features/mat-product-images"
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
  productGalleryImages,
  showProductGallery,
  defaultAlt,
  brandPlaceholderUrl = null,
  entryPreviewImage = null,
  preferEntryPreviewImage = false,
}: BuildConfiguratorV2PreviewGalleryParams): PreviewGalleryItem[] => {
  const items: PreviewGalleryItem[] = []

  if (brandPlaceholderUrl && !hasFullDynamicPreview) {
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

  if (isVehiclePreviewReady) {
    const { modelTemplate, inCarPhotos } =
      partitionMatProductImages(matProductImages)
    const entryImage = entryPreviewImage?.trim() ?? null
    const templateUrl =
      preferEntryPreviewImage && entryImage
        ? entryImage
        : modelTemplate?.image_url ?? entryImage

    if (templateUrl) {
      items.push({
        id: modelTemplate
          ? `model-template-${modelTemplate.id}`
          : "model-template-entry",
        imageUrl: templateUrl,
        altText: modelTemplate?.alt_text ?? defaultAlt,
        kind: "model-template",
      })
    }

    inCarPhotos
      .filter((image) => image.image_url !== templateUrl)
      .forEach((image) => {
        items.push({
          id: `in-car-photo-${image.id}`,
          imageUrl: image.image_url,
          altText: image.alt_text ?? `Dywaniki w aucie — ${defaultAlt}`,
          kind: "in-car-photo",
        })
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
