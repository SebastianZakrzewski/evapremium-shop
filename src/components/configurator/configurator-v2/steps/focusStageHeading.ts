import { isConfiguratorV2MobileViewport } from "../hooks/useConfiguratorV2InitialVehicleScroll"

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

/** Na telefonie nowy etap zaczyna się od tytułu, nie od miejsca poprzedniego scrolla. */
export const applyStageChangeScroll = (): void => {
  const heading = document.getElementById("configurator-stage-heading")
  if (!isConfiguratorV2MobileViewport()) {
    if (heading instanceof HTMLElement) focusStageHeading(heading)
    return
  }

  if (heading instanceof HTMLElement) heading.focus({ preventScroll: true })
  const reset = () => {
    const scroller = optionsScroller(heading instanceof HTMLElement ? heading : null)
    if (scroller) scroller.scrollTop = 0
  }
  reset()
  window.requestAnimationFrame(reset)
}
