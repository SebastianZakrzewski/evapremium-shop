export const VARIANT_TRUNK_MAT_RIM_NOTICE_ICON_SRC =
  "/konfigurator/zestaw/mata-bagaznika-produkt.jpg"

export const VARIANT_TRUNK_MAT_RIM_NOTICE_LABEL =
  "Mata do bagażnika bez wysokich rantów"

export const VARIANT_TRUNK_MAT_RIM_NOTICE_BODY =
  "Wysokie ranty dotyczą dywaników kabinowych. Mata — sama i w komplecie — ma standardowy profil."

export const VARIANT_TRUNK_MAT_RIM_NOTICE_ALT =
  "Mata do bagażnika bez wysokich rantów"

const TRUNK_MAT_SET_KEYS = new Set(["complete", "premium"])

export const variantIncludesTrunkMat = (variantKey?: string): boolean => {
  if (!variantKey) return false
  if (TRUNK_MAT_SET_KEYS.has(variantKey)) return true
  return variantKey.includes("trunk")
}

export const shouldShowVariantTrunkMatRimNotice = ({
  matType,
  variantKey,
}: {
  matType?: string
  variantKey?: string
}): boolean =>
  matType === "3d-with-rims" && variantIncludesTrunkMat(variantKey)
