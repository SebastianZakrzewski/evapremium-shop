import {
  brandNameToNavigationSlug,
  getBrandLogo,
  resolveBrandLogo,
} from "@/shared/brands"

type ResolveConfiguratorBrandImageInput = {
  brand: string
  brandKey?: string
  brandParam?: string | null
}

export const resolveConfiguratorBrandImage = ({
  brand,
  brandKey,
  brandParam,
}: ResolveConfiguratorBrandImageInput): string | null => {
  const normalizedBrand = brand.trim()
  if (!normalizedBrand) return null

  const slug =
    brandKey?.trim() ||
    brandParam?.trim() ||
    brandNameToNavigationSlug(normalizedBrand)

  return getBrandLogo(slug) ?? resolveBrandLogo(normalizedBrand)
}
