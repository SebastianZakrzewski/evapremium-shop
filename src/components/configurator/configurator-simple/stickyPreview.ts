export type StickyPreviewTab = "dynamic" | "product" | "mat-product"

type StickyPreviewImageArgs = {
  activePreviewTab: StickyPreviewTab
  hasFullPreview: boolean
  dynamicPreviewPath: string
  productPreviewPath: string | null
  matProductImage: string | null
  fallbackPath: string
  canShowDynamicPreview?: boolean
  /** Zdjęcie modelu z kroku 1 — tylko na kroku 1 (mobile) */
  includeMatProduct?: boolean
}

type StickyMainImageArgs = {
  hasFullPreview: boolean
  dynamicPreviewPath: string
  fallbackPath: string
  canShowDynamicPreview?: boolean
}

export const getStickyPreviewImage = ({
  activePreviewTab,
  hasFullPreview,
  dynamicPreviewPath,
  productPreviewPath,
  matProductImage,
  fallbackPath,
  canShowDynamicPreview = true,
  includeMatProduct = true,
}: StickyPreviewImageArgs): string => {
  if (includeMatProduct && activePreviewTab === "mat-product" && matProductImage) {
    return matProductImage
  }

  if (activePreviewTab === "dynamic" && canShowDynamicPreview) {
    return dynamicPreviewPath
  }

  if (activePreviewTab === "product" && productPreviewPath) {
    return productPreviewPath
  }

  if (canShowDynamicPreview && hasFullPreview) {
    return dynamicPreviewPath
  }

  if (includeMatProduct && matProductImage) {
    return matProductImage
  }

  if (productPreviewPath) {
    return productPreviewPath
  }

  return fallbackPath
}

export const getStickyMainImage = ({
  hasFullPreview,
  dynamicPreviewPath,
  fallbackPath,
  canShowDynamicPreview = true,
}: StickyMainImageArgs): string => {
  if (canShowDynamicPreview && hasFullPreview) {
    return dynamicPreviewPath
  }

  return fallbackPath
}

/** Wspólne wymiary sticky podglądu na mobile (sync z MobileStickyPreview) */
export const MOBILE_NAVBAR_PX = 64

export const MOBILE_STICKY_PREVIEW = {
  imageHeightClass:
    "h-[38vh] min-h-[240px] max-h-[320px] sm:h-[40vh] sm:min-h-[260px] sm:max-h-[340px]",
  vhRatio: { base: 0.38, sm: 0.4 },
  minPx: { base: 240, sm: 260 },
  maxPx: { base: 320, sm: 340 },
  /** Pasek miniaturek + opcjonalny przycisk powrotu do konfiguracji */
  controlsPx: 128,
  collapsedBarPx: 72,
} as const

export const getMobileStickyPreviewHeightPx = (
  viewportHeight: number,
  viewportWidth = 390
): number => {
  const isSm = viewportWidth >= 640
  const ratio = isSm
    ? MOBILE_STICKY_PREVIEW.vhRatio.sm
    : MOBILE_STICKY_PREVIEW.vhRatio.base
  const min = isSm
    ? MOBILE_STICKY_PREVIEW.minPx.sm
    : MOBILE_STICKY_PREVIEW.minPx.base
  const max = isSm
    ? MOBILE_STICKY_PREVIEW.maxPx.sm
    : MOBILE_STICKY_PREVIEW.maxPx.base

  return Math.min(max, Math.max(min, Math.round(viewportHeight * ratio)))
}

export const getMobileStickyStackHeightPx = (
  collapsed: boolean,
  viewportHeight = 800,
  viewportWidth = 390
): number => {
  if (collapsed) {
    return MOBILE_NAVBAR_PX + MOBILE_STICKY_PREVIEW.collapsedBarPx
  }

  return (
    MOBILE_NAVBAR_PX +
    getMobileStickyPreviewHeightPx(viewportHeight, viewportWidth) +
    MOBILE_STICKY_PREVIEW.controlsPx
  )
}

export const getStickyPreviewPaddingTop = (collapsed: boolean): string => {
  if (collapsed) {
    return "pt-[calc(4rem+4.75rem)]"
  }

  return "pt-[calc(4rem+38vh+8rem)] sm:pt-[calc(4rem+40vh+8rem)]"
}

export const getStickyPreviewScrollMargin = (collapsed: boolean): string => {
  if (collapsed) {
    return "scroll-mt-24"
  }

  return "scroll-mt-[calc(4rem+38vh+8rem)] sm:scroll-mt-[calc(4rem+40vh+8rem)]"
}
