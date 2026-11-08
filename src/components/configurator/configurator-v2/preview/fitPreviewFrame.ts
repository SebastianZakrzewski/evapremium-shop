import type { CSSProperties } from "react"

/** iPhone 14 / 16 / 16 Pro zostawiają zdjęcie w pełnej wysokości. */
export const MOBILE_PREVIEW_FULL_FROM_PX = 840

/** Poniżej tej wysokości podgląd jest niskim, ściętym paskiem. */
export const MOBILE_PREVIEW_COMPACT_BELOW_PX = 700

export type MobilePreviewFit =
  | { kind: "full"; scale: 1 }
  | { kind: "scaled"; scale: number }
  | { kind: "compact"; scale: number; frameHeight: number }

/**
 * Pełna ramka na wysokich telefonach.
 * Między 700 a 840 px wysokość spada liniowo do 29%, szerokość zostaje 100%.
 * Niżej zostaje ścięty pasek, który nadal otwiera powiększenie.
 */
export const mobilePreviewFit = (viewportHeight: number): MobilePreviewFit => {
  if (viewportHeight >= MOBILE_PREVIEW_FULL_FROM_PX) {
    return { kind: "full", scale: 1 }
  }
  if (viewportHeight < MOBILE_PREVIEW_COMPACT_BELOW_PX) {
    return {
      kind: "compact",
      scale: 1,
      frameHeight: viewportHeight <= 650 ? 72 : 96,
    }
  }
  const span = MOBILE_PREVIEW_FULL_FROM_PX - MOBILE_PREVIEW_COMPACT_BELOW_PX
  const progress = (viewportHeight - MOBILE_PREVIEW_COMPACT_BELOW_PX) / span
  const scale = Math.round((0.29 + 0.71 * progress) * 1000) / 1000
  return { kind: "scaled", scale }
}

const isDynamicMatPreview = (src: string) =>
  src.startsWith("/dywaniki/") && !src.includes("/previews/")

/** Proporcje karty modelu, gdy marka nie ma własnego zdjęcia. */
export const MODEL_CARD_FRAME_SIZE = { width: 2954, height: 1620 }

export type PreviewFrameRequest = {
  src: string | null
  useModelCardFrame: boolean
}

/**
 * Okno podglądu ma wielkość zdjęcia karty modelu.
 * Bez tego zdjęcia podgląd dywanika dostaje te same proporcje.
 */
export const resolvePreviewFrame = (
  items: ReadonlyArray<{ kind: string; imageUrl: string }>,
  activeSrc: string,
): PreviewFrameRequest => {
  const modelPhoto = items.find(
    (item) => item.kind === "model-template" && item.imageUrl,
  )
  if (modelPhoto?.imageUrl) {
    return { src: modelPhoto.imageUrl, useModelCardFrame: false }
  }
  if (isDynamicMatPreview(activeSrc)) {
    return { src: null, useModelCardFrame: true }
  }
  return { src: activeSrc, useModelCardFrame: false }
}

export const resolveMobilePreviewFrameSrc = (
  items: ReadonlyArray<{ kind: string; imageUrl: string }>,
  activeSrc: string,
): string | null => resolvePreviewFrame(items, activeSrc).src

/** Okno przyjmuje proporcje zdjęcia i mieści się w dostępnej przestrzeni. */
export const previewFrameStyle = (
  size: { width: number; height: number } | null,
  mode: "mobile" | "desktop",
  viewportHeight = MOBILE_PREVIEW_FULL_FROM_PX,
): CSSProperties | undefined => {
  if (!size || size.width <= 0 || size.height <= 0) return undefined

  const ratio = `${size.width} / ${size.height}`

  if (mode === "mobile") {
    const fit = mobilePreviewFit(viewportHeight)
    if (fit.kind === "compact") {
      return {
        aspectRatio: ratio,
        width: "100%",
        height: `${fit.frameHeight}px`,
      }
    }
    if (fit.kind === "scaled") {
      return {
        aspectRatio: ratio,
        width: "100%",
        height: `calc(${fit.scale} * 100cqw * ${size.height} / ${size.width})`,
      }
    }
    return {
      aspectRatio: ratio,
      width: "100%",
      // Jawna wysokość. Safari zwija height:auto + aspect-ratio w flexie do paska.
      height: `calc(100cqw * ${size.height} / ${size.width})`,
    }
  }

  return {
    aspectRatio: ratio,
    width: `min(100cqw, calc(100cqh * ${size.width} / ${size.height}))`,
    height: "auto",
    maxWidth: "100%",
    maxHeight: "100%",
  }
}
