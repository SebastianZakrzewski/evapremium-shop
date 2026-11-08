export type MenuAnchor = {
  top: number
  bottom: number
  left: number
  width: number
}

export type MenuBounds = {
  top: number
  bottom: number
}

export type MenuPlacement = {
  top: number
  left: number
  width: number
  maxHeight: number
}

const MENU_GAP = 8
const OPTION_ROW = 44

export const placeDarkSelectMenu = (
  anchor: MenuAnchor,
  bounds: MenuBounds,
  optionCount: number,
): MenuPlacement => {
  const desired = Math.min(240, Math.max(OPTION_ROW, optionCount * OPTION_ROW + 8))
  const spaceBelow = bounds.bottom - anchor.bottom - MENU_GAP
  const spaceAbove = anchor.top - bounds.top - MENU_GAP
  const openAbove = spaceBelow < Math.min(desired, 160) && spaceAbove > spaceBelow
  const available = openAbove ? spaceAbove : spaceBelow
  const maxHeight = Math.max(OPTION_ROW, Math.floor(Math.min(desired, Math.max(available, OPTION_ROW))))
  const top = openAbove
    ? Math.max(bounds.top, anchor.top - MENU_GAP - maxHeight)
    : anchor.bottom + MENU_GAP

  return {
    top,
    left: anchor.left,
    width: anchor.width,
    maxHeight,
  }
}
