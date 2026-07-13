const DIACRITICS_REGEX = /[\u0300-\u036f]/g

export const normalizeVehicleSearchQuery = (value: string): string =>
  value
    .trim()
    .normalize("NFD")
    .replace(DIACRITICS_REGEX, "")

export const normalizeSearchToken = (value: string): string =>
  normalizeVehicleSearchQuery(value)
    .toLocaleLowerCase("pl")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()

export const toComparableSearchQuery = (value: string): string =>
  normalizeVehicleSearchQuery(value).toLocaleLowerCase("pl").replace(/\s+/g, " ").trim()
