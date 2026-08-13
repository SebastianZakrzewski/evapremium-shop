export type PrimaryModelPreviewRow = {
  matTemplateId: string
  bodyTypeKey: string | null
  imageUrl: string
}

const normalizeBodyTypeKey = (value: string | null | undefined): string =>
  (value ?? "").trim().toLowerCase()

/**
 * Wybiera URL podglądu: dokładne body_type_key, potem rekord bez typu (NULL).
 * Bez dopasowania nie bierze zdjęcia innego typu nadwozia.
 */
export const resolvePrimaryPreviewImageUrl = (
  previews: PrimaryModelPreviewRow[],
  matTemplateId: string | null | undefined,
  bodyTypeKey: string | null | undefined,
): string | null => {
  if (!matTemplateId) return null

  const forTemplate = previews.filter(
    (preview) => preview.matTemplateId === matTemplateId,
  )
  if (forTemplate.length === 0) return null

  const requested = normalizeBodyTypeKey(bodyTypeKey)
  if (requested) {
    const exact = forTemplate.find(
      (preview) => normalizeBodyTypeKey(preview.bodyTypeKey) === requested,
    )
    if (exact) return exact.imageUrl

    const generic = forTemplate.find((preview) => !preview.bodyTypeKey)
    return generic?.imageUrl ?? null
  }

  const generic = forTemplate.find((preview) => !preview.bodyTypeKey)
  if (generic) return generic.imageUrl

  return forTemplate[0]?.imageUrl ?? null
}
