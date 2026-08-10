export type PodpietkaMounting = "professional" | "self"

export const PODPIETKA_MOUNTING_PRICE = 10

export const isPodpietkaMounting = (
  value: unknown,
): value is PodpietkaMounting =>
  value === "professional" || value === "self"

export const getPodpietkaMountingFee = (
  mounting?: PodpietkaMounting | null,
): number => (mounting === "professional" ? PODPIETKA_MOUNTING_PRICE : 0)

export const getPodpietkaTotalPrice = (
  basePrice: number,
  mounting?: PodpietkaMounting | null,
): number => basePrice + getPodpietkaMountingFee(mounting)

export const getPodpietkaMountingLabel = (
  mounting?: PodpietkaMounting | null,
): string => {
  if (mounting === "professional") {
    return `Montaż przez nas (+${PODPIETKA_MOUNTING_PRICE} zł)`
  }
  if (mounting === "self") {
    return "Montaż indywidualny (0 zł)"
  }
  return ""
}

export const getPodpietkaMountingBitrixLabel = (
  mounting?: PodpietkaMounting | null,
): string => {
  if (mounting === "professional") {
    return `Montaż podpiętki: przez nas (+${PODPIETKA_MOUNTING_PRICE} zł)`
  }
  if (mounting === "self") {
    return "Montaż podpiętki: indywidualny"
  }
  return ""
}
