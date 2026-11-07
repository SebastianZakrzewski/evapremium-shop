export const GEARBOX_AUTOMATIC = "Automatyczna"
export const GEARBOX_MANUAL = "Manualna"

export const GEARBOX_VALUES = [GEARBOX_AUTOMATIC, GEARBOX_MANUAL] as const

export type Gearbox = (typeof GEARBOX_VALUES)[number]

export const GEARBOX_OPTIONS: ReadonlyArray<{ value: Gearbox; label: string }> = [
  { value: GEARBOX_AUTOMATIC, label: GEARBOX_AUTOMATIC },
  { value: GEARBOX_MANUAL, label: GEARBOX_MANUAL },
]

export const isGearbox = (value: unknown): value is Gearbox =>
  value === GEARBOX_AUTOMATIC || value === GEARBOX_MANUAL

export const GEARBOX_BITRIX_ENUM_IDS: Record<Gearbox, number> = {
  [GEARBOX_MANUAL]: 886,
  [GEARBOX_AUTOMATIC]: 888,
}

export const getGearboxLabel = (value?: string | null): string =>
  isGearbox(value) ? value : ""

export const getGearboxBitrixEnumId = (value?: string | null): number | undefined =>
  isGearbox(value) ? GEARBOX_BITRIX_ENUM_IDS[value] : undefined
