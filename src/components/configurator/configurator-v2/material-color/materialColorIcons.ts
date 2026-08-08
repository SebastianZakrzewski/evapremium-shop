export const MATERIAL_COLOR_ICON_BASE = "/konfigurator/kolor-materialu"

export const materialColorIconMap = {
  beige: `${MATERIAL_COLOR_ICON_BASE}/beige.png`,
  black: `${MATERIAL_COLOR_ICON_BASE}/black.png`,
  blue: `${MATERIAL_COLOR_ICON_BASE}/blue.png`,
  brown: `${MATERIAL_COLOR_ICON_BASE}/brown.png`,
  darkblue: `${MATERIAL_COLOR_ICON_BASE}/darkblue.png`,
  darkgreen: `${MATERIAL_COLOR_ICON_BASE}/darkgreen.png`,
  darkgrey: `${MATERIAL_COLOR_ICON_BASE}/darkgrey.png`,
  ivory: `${MATERIAL_COLOR_ICON_BASE}/ivory.png`,
  lightbeige: `${MATERIAL_COLOR_ICON_BASE}/lightbeige.png`,
  lime: `${MATERIAL_COLOR_ICON_BASE}/lime.png`,
  maroon: `${MATERIAL_COLOR_ICON_BASE}/maroon.png`,
  orange: `${MATERIAL_COLOR_ICON_BASE}/orange.png`,
  pink: `${MATERIAL_COLOR_ICON_BASE}/pink.png`,
  purple: `${MATERIAL_COLOR_ICON_BASE}/purple.png`,
  red: `${MATERIAL_COLOR_ICON_BASE}/red.png`,
  white: `${MATERIAL_COLOR_ICON_BASE}/white.png`,
  yellow: `${MATERIAL_COLOR_ICON_BASE}/yellow.png`,
} as const

export type MaterialColorIconKey = keyof typeof materialColorIconMap

export const getMaterialColorIconSrc = (
  colorKey: string,
): string | undefined =>
  colorKey in materialColorIconMap
    ? materialColorIconMap[colorKey as MaterialColorIconKey]
    : undefined
