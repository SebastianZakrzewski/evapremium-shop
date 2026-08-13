export const CELL_STRUCTURE_DIAMONDS_ICON_SRC =
  "/konfigurator/struktura-komorek/romby.png"

export const CELL_STRUCTURE_HONEY_ICON_SRC =
  "/konfigurator/struktura-komorek/plaster-miodu.png"

export const cellStructureOptions = [
  {
    id: "diamonds" as const,
    name: "Romby",
    description: "Klasyczny wygląd",
    iconSrc: CELL_STRUCTURE_DIAMONDS_ICON_SRC,
    iconAlt: "Struktura komórek — romby",
  },
  {
    id: "honey" as const,
    name: "Plaster miodu",
    description: "Nowoczesny design",
    iconSrc: CELL_STRUCTURE_HONEY_ICON_SRC,
    iconAlt: "Struktura komórek — plaster miodu",
  },
] as const

export type CellStructureId = (typeof cellStructureOptions)[number]["id"]

export const getCellStructureIconSrc = (structureId: CellStructureId): string =>
  cellStructureOptions.find((option) => option.id === structureId)?.iconSrc ?? ""
