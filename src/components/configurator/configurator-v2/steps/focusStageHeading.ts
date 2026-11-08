import { isConfiguratorV2MobileViewport } from "../hooks/useConfiguratorV2InitialVehicleScroll"

const STAGE_SCROLL_KEY = "evapremium-mobile-stage-scroll"
const STAGE_SCROLL_WINDOW_MS = 2000

const optionsScroller = (heading: HTMLElement | null): HTMLElement | null => {
  const fromHeading =
    heading?.closest("[data-configurator-options]") ??
    document.querySelector("[data-configurator-options]")
  return fromHeading instanceof HTMLElement ? fromHeading : null
}

export const focusStageHeading = (heading: HTMLElement): void => {
  heading.focus({ preventScroll: true })
  const scroller = heading.closest("[data-configurator-options]")
  if (!(scroller instanceof HTMLElement)) return
  const delta =
    heading.getBoundingClientRect().top - scroller.getBoundingClientRect().top
  scroller.scrollTop += delta
}

export const rememberMobileStageScroll = (): void => {
  if (!isConfiguratorV2MobileViewport()) return
  try {
    sessionStorage.setItem(STAGE_SCROLL_KEY, String(Date.now()))
  } catch {
    // tryb prywatny bez storage
  }
}

export const mobileStageScrollIsFresh = (): boolean => {
  try {
    const raw = sessionStorage.getItem(STAGE_SCROLL_KEY)
    if (!raw) return false
    return Date.now() - Number(raw) < STAGE_SCROLL_WINDOW_MS
  } catch {
    return false
  }
}

/** Na telefonie nowy etap zaczyna się od tytułu, nie od miejsca poprzedniego scrolla. */
export const applyStageChangeScroll = (): void => {
  const heading = document.getElementById("configurator-stage-heading")
  const mobile = isConfiguratorV2MobileViewport() || mobileStageScrollIsFresh()
  if (!mobile) {
    if (heading instanceof HTMLElement) focusStageHeading(heading)
    return
  }

  if (heading instanceof HTMLElement) heading.focus({ preventScroll: true })
  const reset = () => {
    const scroller = optionsScroller(heading instanceof HTMLElement ? heading : null)
    if (!scroller) return
    scroller.style.overflowAnchor = "none"
    scroller.scrollTop = 0
    const panel = scroller.querySelector("[data-configurator-panel]")
    if (panel instanceof HTMLElement) {
      panel.style.overflowAnchor = "none"
      panel.scrollTop = 0
    }
  }
  reset()
  window.requestAnimationFrame(reset)
  window.setTimeout(reset, 0)
}
