import type { CSSProperties } from "react"

export const MOBILE_PREVIEW_MAX_HEIGHT_PX = 150
export const MOBILE_PREVIEW_MAX_HEIGHT_RATIO = 0.34

/** Miejsce na pasek, etapy, pierwsze pole i dolny pasek, żeby rocznik nie wchodził pod nawigację etapów. */
const MOBILE_PREVIEW_RESERVED_PX = 420

export const mobilePreviewMaxHeight = (viewportHeight: number): number => {
  const byRatio = Math.round(viewportHeight * MOBILE_PREVIEW_MAX_HEIGHT_RATIO)
  const roomForFirstField = viewportHeight - MOBILE_PREVIEW_RESERVED_PX
  return Math.min(
    MOBILE_PREVIEW_MAX_HEIGHT_PX,
    Math.max(120, byRatio),
    Math.max(120, roomForFirstField),
  )
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
): CSSProperties | undefined => {
  if (!size || size.width <= 0 || size.height <= 0) return undefined

  const ratio = `${size.width} / ${size.height}`

  if (mode === "mobile") {
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
