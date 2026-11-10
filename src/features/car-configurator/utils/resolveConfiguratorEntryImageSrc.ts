import { getBrandLogo } from "@/shared/brands"

const isLocalImagePath = (value: string): boolean =>
  value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")

export const resolveConfiguratorEntryImageSrc = (
  brand: string | undefined,
  previewImage: string | undefined,
): string | null => {
  const preview = previewImage?.trim() ?? ""
  if (isLocalImagePath(preview)) {
    return preview
  }

  const brandSlug = brand?.trim() ?? ""
  if (!brandSlug) {
    return null
  }

  return getBrandLogo(brandSlug)
}
