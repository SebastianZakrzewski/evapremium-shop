/**
 * Opens the global cart drawer via the navbar listener.
 * Deferred one tick so cart state can sync via cartUpdated first.
 */
export const openCartModal = (): void => {
  if (typeof window === "undefined") return

  window.setTimeout(() => {
    window.dispatchEvent(new CustomEvent("openCartModal"))
  }, 0)
}
