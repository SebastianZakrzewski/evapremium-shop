export type BodyScopedPreview = {
  body_type_key: string | null
  image_url: string
  is_primary?: boolean
  sort_order?: number
}

const normalize = (value: string | null | undefined): string =>
  (value ?? "").trim().toLowerCase()

/**
 * When a body type is chosen, never show another body type's photo
 * (sedan preview on a hatchback). Generic rows (null body) are the fallback.
 */
export const filterPreviewsForBodyType = <T extends BodyScopedPreview>(
  previews: readonly T[],
  bodyTypeKey: string | null | undefined,
): T[] => {
  const requested = normalize(bodyTypeKey)
  if (!requested) return [...previews]

  const exact = previews.filter(
    (preview) => normalize(preview.body_type_key) === requested,
  )
  if (exact.length > 0) return exact

  return previews.filter((preview) => !normalize(preview.body_type_key))
}
