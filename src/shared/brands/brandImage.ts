/**
 * Zdjęcia marek w public/modele/ są już zoptymalizowane — serwuj bez ponownej kompresji Next.js.
 */
export const shouldServeBrandImageUnoptimized = (logo: string): boolean =>
  logo.includes('/modele/')

/** Rozmiary dla siatki 3-kolumnowej (/dywaniki) */
export const BRAND_GRID_SIZES_COMPACT =
  '(max-width: 640px) 33vw, (max-width: 1024px) 30vw, 360px'

/** Rozmiary dla siatki responsywnej (/modele) */
export const BRAND_GRID_SIZES_STANDARD =
  '(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 360px'

/** Rozmiary dla karuzeli marek */
export const BRAND_CAROUSEL_SIZES =
  '(max-width: 640px) 224px, (max-width: 1024px) 288px, 320px'

export const isBrandPhotoFile = (logo: string): boolean =>
  /\.(jpg|jpeg|png|avif|webp)(\?|$)/i.test(logo)

export const isModeleBrandPhoto = (logo: string): boolean =>
  logo.includes('/modele/')
