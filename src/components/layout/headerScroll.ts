/** Scroll up this far before the configurator header comes back. */
export const HEADER_SHOW_AFTER_PX = 36
/** Scroll down this far before the header hides. */
export const HEADER_HIDE_AFTER_PX = 12

export type HeaderScrollState = {
  hidden: boolean
  upAccum: number
  downAccum: number
  lastY: number
}

export const initialHeaderScroll = (y: number): HeaderScrollState => ({
  hidden: false,
  upAccum: 0,
  downAccum: 0,
  lastY: y,
})

/**
 * Header visibility from scroll, with hysteresis. Positions outside the
 * document (iOS rubber-band) are ignored so they cannot flip the header.
 */
export const nextHeaderScroll = (
  state: HeaderScrollState,
  y: number,
  maxY: number,
  navHeight: number,
): HeaderScrollState => {
  if (y < 0 || y > maxY) return state
  if (y <= 8) {
    return { hidden: false, upAccum: 0, downAccum: 0, lastY: y }
  }
  const delta = y - state.lastY
  if (delta > 0) {
    const downAccum = state.downAccum + delta
    if (downAccum >= HEADER_HIDE_AFTER_PX && y > navHeight) {
      return { hidden: true, upAccum: 0, downAccum: 0, lastY: y }
    }
    return { ...state, upAccum: 0, downAccum, lastY: y }
  }
  if (delta < 0) {
    const upAccum = state.upAccum + -delta
    if (upAccum >= HEADER_SHOW_AFTER_PX) {
      return { hidden: false, upAccum: 0, downAccum: 0, lastY: y }
    }
    return { ...state, downAccum: 0, upAccum, lastY: y }
  }
  return { ...state, lastY: y }
}
