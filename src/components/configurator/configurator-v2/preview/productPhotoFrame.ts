import type { PreviewGalleryItemKind } from "./buildConfiguratorV2PreviewGallery"

/** Zdjęcia produktu mają wejść w okno podglądu w całości, bez kadrowania i rozciągania. */
export const isProductPhotoFramedToWindowWidth = (
  kind: PreviewGalleryItemKind | null | undefined,
): boolean => kind === "model-template" || kind === "product-set"

export const CONTAINED_PREVIEW_IMAGE_CLASS =
  "absolute inset-0 h-full w-full object-contain object-center select-none pointer-events-none"
