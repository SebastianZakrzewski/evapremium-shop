import type { PreviewGalleryItemKind } from "./buildConfiguratorV2PreviewGallery"

/** Zdjęcia produktu wypełniają szerokość okna podglądu, bez rozciągania grafiki. */
export const isProductPhotoFramedToWindowWidth = (
  kind: PreviewGalleryItemKind | null | undefined,
): boolean => kind === "model-template" || kind === "product-set"

export const CONTAINED_PREVIEW_IMAGE_CLASS =
  "absolute inset-0 h-full w-full object-contain object-center select-none pointer-events-none"

export const WINDOW_WIDTH_PREVIEW_IMAGE_CLASS =
  "absolute inset-x-0 top-1/2 h-auto w-full max-w-none -translate-y-1/2 object-center select-none pointer-events-none"
