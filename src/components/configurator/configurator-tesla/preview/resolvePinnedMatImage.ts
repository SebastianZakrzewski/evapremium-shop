export type PinnedMatFocus = "variant" | "type" | "color"

export type PinnedMatSource =
  | "in-car"
  | "per-color"
  | "variant-preview"
  | "type-preview"
  | "default"

export type PinnedMatImageInput = {
  /** Real in-car photo for this color/angle, when one exists. */
  inCarUrl?: string | null
  /**
   * Future per-color render. Return null until that asset is supplied.
   * It outranks the variant diagram and loses to an in-car photo.
   */
  perColorUrl?: string | null
  /** Set diagram: which mats are in the variant. */
  variantImage?: string | null
  /** 3D with edges vs without edges, and other per-type product photos. */
  typeImage?: string | null
  defaultImage: string
  focus: PinnedMatFocus
}

export type PinnedMatImage = {
  url: string
  source: PinnedMatSource
}

const clean = (value: string | null | undefined): string | null => {
  const trimmed = value?.trim() ?? ""
  return trimmed.length > 0 ? trimmed : null
}

/**
 * in-car per color/angle > per-color asset > the preview for the last
 * selected set or type > the other preview > default mat.
 * Variant and type previews stay available as the main image and as fallback.
 */
export const resolvePinnedMatImage = (
  input: PinnedMatImageInput,
): PinnedMatImage => {
  const inCarUrl = clean(input.inCarUrl)
  if (inCarUrl) return { url: inCarUrl, source: "in-car" }

  const perColorUrl = clean(input.perColorUrl)
  const variantImage = clean(input.variantImage)
  const typeImage = clean(input.typeImage)

  if (input.focus === "color" && perColorUrl) {
    return { url: perColorUrl, source: "per-color" }
  }
  if (input.focus === "variant" && variantImage) {
    return { url: variantImage, source: "variant-preview" }
  }
  if (input.focus === "type" && typeImage) {
    return { url: typeImage, source: "type-preview" }
  }
  if (perColorUrl) return { url: perColorUrl, source: "per-color" }
  if (variantImage) return { url: variantImage, source: "variant-preview" }
  if (typeImage) return { url: typeImage, source: "type-preview" }
  return { url: input.defaultImage, source: "default" }
}

export const DEFAULT_MAT_IMAGE =
  "/dywaniki/3d/diamonds/black/5os-3d-diamonds-black-black.webp"

/**
 * Plug-in point for per-color mat photos. Empty until those files are supplied.
 * Keys are `${matType}|${structure}|${color}|${edgeColor}`.
 */
export const perColorMatImageMap: Record<string, string> = {}

export const resolvePerColorMatImage = (input: {
  matType: string
  structure: string
  color: string
  edgeColor: string
}): string | null => {
  const key = `${input.matType}|${input.structure}|${input.color}|${input.edgeColor}`
  return perColorMatImageMap[key] ?? null
}
