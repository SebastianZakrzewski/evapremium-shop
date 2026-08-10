import type { PreviewGalleryItem } from "./buildConfiguratorV2PreviewGallery"

export const getAdjacentGalleryItemId = (
  items: PreviewGalleryItem[],
  activeId: string | null,
  direction: "previous" | "next",
): string | null => {
  if (items.length === 0) return null

  const activeIndex = items.findIndex((item) => item.id === activeId)
  const currentIndex = activeIndex >= 0 ? activeIndex : 0
  const offset = direction === "next" ? 1 : -1
  const nextIndex = (currentIndex + offset + items.length) % items.length
  return items[nextIndex]?.id ?? null
}
