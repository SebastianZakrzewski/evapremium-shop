export const VARIANT_UNAVAILABLE_NOTICE =
  "Ten wariant nie jest dostępny dla wybranego typu dywanika. Wybierz wariant zestawu."

export const reconcileVariantWithOfferedKeys = (
  variant: string,
  offeredKeys: readonly string[],
): { variant: string; cleared: boolean } => {
  if (!variant) return { variant: "", cleared: false }
  if (offeredKeys.includes(variant)) return { variant, cleared: false }
  return { variant: "", cleared: true }
}
