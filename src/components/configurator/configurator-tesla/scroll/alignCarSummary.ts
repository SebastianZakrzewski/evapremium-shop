import { TESLA_LAYOUT } from "../tokens"

/** Scroll offset that places the car summary `pinOffset` px below the scroller's top. */
export const summaryScrollTop = (
  summaryViewportTop: number,
  containerViewportTop: number,
  containerScrollTop: number,
  pinOffset: number,
): number =>
  Math.max(0, summaryViewportTop - containerViewportTop + containerScrollTop - pinOffset)

const scrollableAncestor = (element: HTMLElement): HTMLElement | null => {
  let parent = element.parentElement
  while (parent) {
    const overflow = getComputedStyle(parent).overflowY
    if (
      (overflow === "auto" || overflow === "scroll") &&
      parent.scrollHeight > parent.clientHeight + 1
    ) {
      return parent
    }
    parent = parent.parentElement
  }
  return null
}

const pinnedOffset = (): number => {
  const header = Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue("--configurator-header-offset"),
  )
  return (Number.isFinite(header) ? header : 0) + TESLA_LAYOUT.imageAspectHeight
}

/** Puts the car summary, and the Zestaw heading under it, at the top of the visible options. */
export const alignCarSummary = (behavior: ScrollBehavior): void => {
  const summary = document.getElementById("configurator-car-summary")
  if (!summary) return
  const scroller = scrollableAncestor(summary)
  const scrollsTheDocument =
    !scroller || scroller === document.documentElement || scroller === document.body
  if (!scrollsTheDocument && scroller) {
    scroller.scrollTo({
      top: summaryScrollTop(
        summary.getBoundingClientRect().top,
        scroller.getBoundingClientRect().top,
        scroller.scrollTop,
        0,
      ),
      behavior,
    })
    return
  }
  window.scrollTo({
    top: summaryScrollTop(summary.getBoundingClientRect().top, 0, window.scrollY, pinnedOffset()),
    behavior,
  })
}

export const scrollBehaviorForMotion = (): ScrollBehavior =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
