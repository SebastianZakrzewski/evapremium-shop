export const EDGE_COLOR_ICON_BASE = "/konfigurator/kolor-obszycia"

export const edgeColorIconMap = {
  beige: `${EDGE_COLOR_ICON_BASE}/beige.png`,
  black: `${EDGE_COLOR_ICON_BASE}/black.png`,
  blue: `${EDGE_COLOR_ICON_BASE}/blue.png`,
  brown: `${EDGE_COLOR_ICON_BASE}/brown.png`,
  darkblue: `${EDGE_COLOR_ICON_BASE}/darkblue.png`,
  darkgrey: `${EDGE_COLOR_ICON_BASE}/darkgrey.png`,
  green: `${EDGE_COLOR_ICON_BASE}/green.png`,
  lightgrey: `${EDGE_COLOR_ICON_BASE}/lightgrey.png`,
  maroon: `${EDGE_COLOR_ICON_BASE}/maroon.png`,
  orange: `${EDGE_COLOR_ICON_BASE}/orange.png`,
  pink: `${EDGE_COLOR_ICON_BASE}/pink.png`,
  purple: `${EDGE_COLOR_ICON_BASE}/purple.png`,
  red: `${EDGE_COLOR_ICON_BASE}/red.png`,
  yellow: `${EDGE_COLOR_ICON_BASE}/yellow.png`,
} as const

export type EdgeColorIconKey = keyof typeof edgeColorIconMap

export const getEdgeColorIconSrc = (colorKey: string): string | undefined =>
  colorKey in edgeColorIconMap
    ? edgeColorIconMap[colorKey as EdgeColorIconKey]
    : undefined
