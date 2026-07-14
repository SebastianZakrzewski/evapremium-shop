import { resolveBrandSlugFromDbName } from "./brandMapper"

/**
 * Kolejność marek wg ogólnych statystyk rynku motoryzacyjnego
 * (rejestracje w Polsce i globalna sprzedaż nowych aut, 2024–2025).
 * Niższy indeks = wyższa popularność.
 */
export const POPULAR_BRAND_SLUGS = [
  "toyota",
  "skoda",
  "volkswagen",
  "kia",
  "bmw",
  "mercedes",
  "opel",
  "audi",
  "ford",
  "renault",
  "hyundai",
  "peugeot",
  "dacia",
  "citroen",
  "fiat",
  "nissan",
  "mazda",
  "volvo",
  "seat",
  "suzuki",
  "tesla",
  "cupra",
  "jeep",
  "land-rover",
  "mini",
  "honda",
  "mitsubishi",
  "mg",
  "byd",
  "lexus",
  "porsche",
  "subaru",
  "ds",
  "alfa-romeo",
  "smart",
  "chevrolet",
  "dodge",
  "genesis",
  "infiniti",
  "jaguar",
  "lancia",
  "maserati",
  "ssangyong",
  "omoda",
  "jaecoo",
  "maxus",
  "baic",
  "xpeng",
  "xiaomi",
  "forthing",
  "acura",
  "cadillac",
  "chrysler",
  "buick",
  "bentley",
  "ferrari",
  "lamborghini",
  "aston-martin",
  "mclaren",
] as const

const POPULARITY_INDEX = new Map<string, number>(
  POPULAR_BRAND_SLUGS.map((slug, index) => [slug, index]),
)

const catalogKeyToSlug = (key: string): string =>
  key.trim().toLowerCase().replace(/_/g, "-")

export const getBrandPopularityRank = (
  brandName: string,
  brandKey?: string,
): number => {
  const slug = resolveBrandSlugFromDbName(brandName)
  const slugRank = POPULARITY_INDEX.get(slug)
  if (slugRank !== undefined) {
    return slugRank
  }

  if (brandKey) {
    const keyRank = POPULARITY_INDEX.get(catalogKeyToSlug(brandKey))
    if (keyRank !== undefined) {
      return keyRank
    }
  }

  return Number.POSITIVE_INFINITY
}

export const sortBrandsByPopularity = <T extends { name: string; key?: string }>(
  brands: T[],
): T[] =>
  [...brands].sort((left, right) => {
    const rankDiff =
      getBrandPopularityRank(left.name, left.key) -
      getBrandPopularityRank(right.name, right.key)

    if (rankDiff !== 0) {
      return rankDiff
    }

    return left.name.localeCompare(right.name, "pl")
  })
