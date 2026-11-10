/**
 * Primary preview from mat_model_previews wins.
 * A local product card is only the fallback when the database has no preview.
 */
export const chooseGenerationModelImage = (
  previewUrl: string | null | undefined,
  localPublicPath: string | null | undefined,
): string | null => {
  const preview = previewUrl?.trim()
  if (preview) return preview
  const local = localPublicPath?.trim()
  return local ? local : null
}
