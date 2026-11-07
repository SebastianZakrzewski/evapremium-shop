export const focusStageHeading = (heading: HTMLElement): void => {
  heading.focus({ preventScroll: true })
  const scroller = heading.closest("[data-configurator-options]")
  if (!(scroller instanceof HTMLElement)) return
  const delta =
    heading.getBoundingClientRect().top - scroller.getBoundingClientRect().top
  scroller.scrollTop += delta
}
