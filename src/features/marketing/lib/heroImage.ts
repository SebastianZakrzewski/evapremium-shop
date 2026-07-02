/** Ścieżka banera hero desktop (public/hero_4.png). */
export const HERO_PROMO_IMAGE_SRC = '/hero_4.png'

/** Ścieżka banera hero mobile (public/hero4_mobile.png). */
export const HERO_PROMO_MOBILE_IMAGE_SRC = '/hero4_mobile.png'

/** Natywna rozdzielczość banera hero desktop. */
export const HERO_PROMO_NATIVE_WIDTH = 1024

export const HERO_PROMO_NATIVE_HEIGHT = 413

/** Natywna rozdzielczość banera hero mobile. */
export const HERO_PROMO_MOBILE_NATIVE_WIDTH = 941

export const HERO_PROMO_MOBILE_NATIVE_HEIGHT = 1672

/** Maks. szerokość wyświetlania = natywna rozdzielczość desktop. */
export const HERO_PROMO_DISPLAY_MAX_WIDTH = HERO_PROMO_NATIVE_WIDTH

/** Serwuj baner hero bez ponownej kompresji Next.js Image Optimizer. */
export const heroPromoImageProps = {
  quality: 100 as const,
  unoptimized: true,
}

export const HERO_PROMO_IMAGE_SIZES = `(max-width: ${HERO_PROMO_DISPLAY_MAX_WIDTH}px) 100vw, ${HERO_PROMO_DISPLAY_MAX_WIDTH}px`

export const HERO_PROMO_MOBILE_IMAGE_SIZES = `(max-width: ${HERO_PROMO_MOBILE_NATIVE_WIDTH}px) 100vw, ${HERO_PROMO_MOBILE_NATIVE_WIDTH}px`

export const HERO_PROMO_ASPECT_CLASS = 'aspect-[941/1672] md:aspect-[1024/413]'
