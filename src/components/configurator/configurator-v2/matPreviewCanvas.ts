/** Tło renderów dynamicznych (/dywaniki/*) — próbka z narożników assetów */
export const MAT_DYNAMIC_PREVIEW_CANVAS_BG = "#dcdcdc"

/** Tło zdjęć zestawów produktowych */
export const MAT_PRODUCT_GALLERY_CANVAS_BG = "#ffffff"

export const getMatPreviewCanvasClass = (imageSrc: string): string => {
  if (imageSrc.startsWith("/dywaniki/")) {
    return "bg-[#dcdcdc]"
  }

  if (
    imageSrc.startsWith("/bezrantowprodukt/") ||
    imageSrc.startsWith("/zrantamiprodukt/")
  ) {
    return "bg-white"
  }

  return "bg-[#111]"
}

export const getMatPreviewCanvasColor = (imageSrc: string): string => {
  if (imageSrc.startsWith("/dywaniki/")) {
    return MAT_DYNAMIC_PREVIEW_CANVAS_BG
  }

  if (
    imageSrc.startsWith("/bezrantowprodukt/") ||
    imageSrc.startsWith("/zrantamiprodukt/")
  ) {
    return MAT_PRODUCT_GALLERY_CANVAS_BG
  }

  return "#111111"
}
