/** Po zjechaniu karuzela chowa się i zostaje schowana, aż użytkownik wróci na górę. */
const DOCK_AFTER_SCROLL_PX = 40
const UNDOCK_BEFORE_SCROLL_PX = 8

export const resolveMobilePreviewDocked = (
  scrollTop: number,
  currentlyDocked: boolean,
): boolean => {
  if (currentlyDocked) return scrollTop > UNDOCK_BEFORE_SCROLL_PX
  return scrollTop > DOCK_AFTER_SCROLL_PX
}
