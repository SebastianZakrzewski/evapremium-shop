import type { MatCarDetails, MatConfiguration } from "@/features/vehicle-catalog/model/matConfiguration"
import {
  formatBodyTypeDisplayPl,
  formatBrandDisplayName,
} from "@/shared/vehicle/displayLabels"
import {
  getMatConfigurationLabelContext,
  getMatSetVariantLabel,
  getMatTypeLabel,
  isSinglePriceSetType,
} from "@/shared/mat-set-labels"

export type MatConfigurationDisplayRow = {
  label: string
  value: string
}

const CELL_TYPE_LABELS_PL: Record<string, string> = {
  diamonds: "Romby",
  honey: "Plaster miodu",
  squares: "Kwadraty",
  hexagons: "Sześciokąty",
  circles: "Koła",
  waves: "Fale",
  dots: "Kropki",
  rombs: "Romby",
}

const COLOR_LABELS_PL: Record<string, string> = {
  black: "Czarny",
  white: "Biały",
  grey: "Szary",
  gray: "Szary",
  brown: "Brązowy",
  beige: "Beżowy",
  red: "Czerwony",
  blue: "Niebieski",
  green: "Zielony",
  yellow: "Żółty",
  pink: "Różowy",
  purple: "Fioletowy",
  orange: "Pomarańczowy",
  lime: "Limonkowy",
  niebieski: "Niebieski",
  czerwony: "Czerwony",
  żółty: "Żółty",
  "kość słoniowa": "Kość słoniowa",
  ciemnoniebieski: "Ciemnoniebieski",
  bordowy: "Bordowy",
  pomarańczowy: "Pomarańczowy",
  jasnobeżowy: "Jasnobeżowy",
  ciemnoszary: "Ciemnoszary",
  fioletowy: "Fioletowy",
  limonkowy: "Limonkowy",
  beżowy: "Beżowy",
  różowy: "Różowy",
  czarny: "Czarny",
  ciemnozielony: "Ciemnozielony",
  brązowy: "Brązowy",
  biały: "Biały",
  jasnoszary: "Jasnoszary",
  zielony: "Zielony",
  ivory: "Kość słoniowa",
  darkblue: "Ciemnoniebieski",
  maroon: "Bordowy",
  lightbeige: "Jasnobeżowy",
  darkgrey: "Ciemnoszary",
  lightgrey: "Jasnoszary",
  darkgreen: "Ciemnozielony",
}

export const getPolishCellTypeLabel = (cellType: string): string =>
  CELL_TYPE_LABELS_PL[cellType] ?? cellType

export const getPolishColorLabel = (color: string): string =>
  COLOR_LABELS_PL[color] ?? color

export const formatMatCarDetailsTitle = (carDetails: MatCarDetails): string => {
  const brand = formatBrandDisplayName(carDetails.brandKey ?? carDetails.brand)
  const model = carDetails.model.trim()
  const generation = carDetails.generation?.trim()
  const year = carDetails.year?.trim()

  const vehicle = [brand, model, generation].filter(Boolean).join(" ")
  if (!year) return vehicle
  return `${vehicle} (${year})`
}

export const formatMatCarBodyTypeLabel = (carDetails: MatCarDetails): string =>
  formatBodyTypeDisplayPl(carDetails.bodyTypeKey ?? carDetails.bodyType)

export const getMatConfigurationDisplayRows = (
  config: MatConfiguration,
): MatConfigurationDisplayRow[] => {
  const rows: MatConfigurationDisplayRow[] = []
  const labelContext = getMatConfigurationLabelContext(config)

  const variantLabel = getMatSetVariantLabel(labelContext)
  if (variantLabel) {
    rows.push({ label: "Zestaw", value: variantLabel })
  }

  if (!isSinglePriceSetType(config.setType)) {
    const typeLabel = getMatTypeLabel(config.setType)
    if (typeLabel) {
      rows.push({ label: "Typ", value: typeLabel })
    }
  }

  rows.push({
    label: "Struktura",
    value: getPolishCellTypeLabel(config.cellType),
  })

  rows.push({
    label: "Kolor",
    value: `${getPolishColorLabel(config.materialColor)} + ${getPolishColorLabel(config.edgeColor)} obszycie`,
  })

  if (config.heelPad === "yes" || config.heelPad === true) {
    rows.push({ label: "Dodatki", value: "Ochraniacze pod piętę" })
  }

  return rows
}
