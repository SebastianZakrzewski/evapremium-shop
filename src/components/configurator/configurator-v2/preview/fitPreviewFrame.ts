import type { CSSProperties } from "react"

/** iPhone 14 / 16 / 16 Pro zostawiają zdjęcie w pełnej wysokości. */
export const MOBILE_PREVIEW_FULL_FROM_PX = 840

/** Każdy telefon dostaje to samo, mniejsze okno. Wysokość schodzi razem z szerokością. */
export const MOBILE_PREVIEW_FRAME_SCALE = 0.5

/** Węższy bok ekranu nadal uznajemy za telefon, nie za okno desktopu. */
const PHONE_SCREEN_MAX_SHORT_SIDE_PX = 500

export type MobilePreviewViewportMetrics = {
  innerWidth: number
  innerHeight: number
  screenWidth: number
  screenHeight: number
}

/**
 * Safari zmniejsza innerHeight o paski przeglądarki. Progi pełnego zdjęcia
 * są liczone od wysokości ekranu telefonu w pionie.
 */
export const mobilePreviewViewportHeight = ({
  innerWidth,
  innerHeight,
  screenWidth,
  screenHeight,
}: MobilePreviewViewportMetrics): number => {
  const shortSide = Math.min(screenWidth, screenHeight)
  const longSide = Math.max(screenWidth, screenHeight)
  const isPhone = shortSide > 0 && shortSide <= PHONE_SCREEN_MAX_SHORT_SIDE_PX
  const isPortrait = innerHeight >= innerWidth
  if (!isPhone || !isPortrait || longSide <= 0) return innerHeight
  return Math.max(innerHeight, longSide)
}

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

/** Proporcje karty modelu, gdy marka nie ma własnego zdjęcia. */
export const MODEL_CARD_FRAME_SIZE = { width: 2954, height: 1620 }

export type PreviewFrameRequest = {
  src: string | null
  useModelCardFrame: boolean
}

/**
 * Każdy slajd dostaje to samo okno: zdjęcie podglądu modelu,
 * a gdy go nie ma — proporcje karty modelu używane przez podgląd dywanika.
 */
export const resolvePreviewFrame = (
  items: ReadonlyArray<{ kind: string; imageUrl: string }>,
  _activeSrc: string,
): PreviewFrameRequest => {
  const modelPhoto = items.find(
    (item) => item.kind === "model-template" && item.imageUrl,
  )
  if (modelPhoto?.imageUrl) {
    return { src: modelPhoto.imageUrl, useModelCardFrame: false }
  }
  return { src: null, useModelCardFrame: true }
}

export const resolveMobilePreviewFrameSrc = (
  items: ReadonlyArray<{ kind: string; imageUrl: string }>,
  activeSrc: string,
): string | null => resolvePreviewFrame(items, activeSrc).src

/**
 * Skraca zbyt wysokie okno do proporcji podglądu dywanika.
 * Na telefonie całe okno jest dodatkowo węższe o MOBILE_PREVIEW_FRAME_SCALE.
 */
export const shrinkMobilePreviewFrame = (size: {
  width: number
  height: number
}): { width: number; height: number } => {
  const matPreviewHeight =
    (size.width * MODEL_CARD_FRAME_SIZE.height) / MODEL_CARD_FRAME_SIZE.width
  if (size.height <= matPreviewHeight) return size

  let height = size.height
  const step = Math.max(1, Math.round(size.width * 0.02))
  while (height - step >= matPreviewHeight) {
    height -= step
  }
  return {
    width: MODEL_CARD_FRAME_SIZE.width,
    height: MODEL_CARD_FRAME_SIZE.height,
  }
}

/** Okno przyjmuje proporcje zdjęcia i mieści się w dostępnej przestrzeni. */
export const previewFrameStyle = (
  size: { width: number; height: number } | null,
  mode: "mobile" | "desktop",
  _viewportHeight = MOBILE_PREVIEW_FULL_FROM_PX,
): CSSProperties | undefined => {
  if (!size || size.width <= 0 || size.height <= 0) return undefined

  const ratio = `${size.width} / ${size.height}`

  if (mode === "mobile") {
    const frame = shrinkMobilePreviewFrame(size)
    const frameWidth = `${MOBILE_PREVIEW_FRAME_SCALE * 100}%`
    return {
      aspectRatio: `${frame.width} / ${frame.height}`,
      width: frameWidth,
      // Jawna wysokość. Safari zwija height:auto + aspect-ratio w flexie do paska.
      height: `calc(${MOBILE_PREVIEW_FRAME_SCALE * 100}cqw * ${frame.height} / ${frame.width})`,
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
