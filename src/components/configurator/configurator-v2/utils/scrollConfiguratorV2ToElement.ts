const MAX_SCROLL_ATTEMPTS = 8
const DEFAULT_SCROLL_OFFSET = 12

const resolveConfiguratorV2ScrollOffset = (
  scrollContainer: HTMLElement,
  options?: { offset?: number; alignToContentStart?: boolean },
): number => {
  const extraOffset = options?.offset ?? DEFAULT_SCROLL_OFFSET

  if (!options?.alignToContentStart) return extraOffset

  const paddingTop =
    Number.parseFloat(window.getComputedStyle(scrollContainer).paddingTop) || 0

  return paddingTop + extraOffset
}

export const getConfiguratorV2ScrollContainer = (
  element: HTMLElement | null,
): HTMLElement | null => element?.closest("main") ?? null

export const scrollConfiguratorV2ToElement = (
  elementId: string,
  options?: {
    offset?: number
    behavior?: ScrollBehavior
    alignToContentStart?: boolean
  },
): boolean => {
  const element = document.getElementById(elementId)
  const scrollContainer = getConfiguratorV2ScrollContainer(element)
  if (!element || !scrollContainer) return false

  const offset = resolveConfiguratorV2ScrollOffset(scrollContainer, options)
  const behavior = options?.behavior ?? "smooth"
  const targetTop =
    scrollContainer.scrollTop +
    element.getBoundingClientRect().top -
    scrollContainer.getBoundingClientRect().top -
    offset

  scrollContainer.scrollTo({
    top: Math.max(0, targetTop),
    behavior,
  })

  return true
}

export const scrollConfiguratorV2ToElementWhenReady = (
  elementId: string,
  options?: {
    offset?: number
    behavior?: ScrollBehavior
    alignToContentStart?: boolean
  },
): (() => void) => {
  let cancelled = false
  let attempt = 0

  const tryScroll = () => {
    if (cancelled) return

    const didScroll = scrollConfiguratorV2ToElement(elementId, options)
    if (didScroll || attempt >= MAX_SCROLL_ATTEMPTS) return

    attempt += 1
    window.requestAnimationFrame(tryScroll)
  }

  window.requestAnimationFrame(tryScroll)

  return () => {
    cancelled = true
  }
}
