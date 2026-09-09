/** Ścieżka banera hero desktop (public/jesien_hero.png) — oryginał PNG, bez kompresji. */
export const HERO_PROMO_IMAGE_SRC = '/jesien_hero.png?v=2168'

/** Ścieżka banera hero mobile (public/jesien_mobile_hero.png) — oryginał PNG, bez kompresji. */
export const HERO_PROMO_MOBILE_IMAGE_SRC = '/jesien_mobile_hero.png?v=941'

/** Natywna rozdzielczość banera hero desktop. */
export const HERO_PROMO_NATIVE_WIDTH = 2168

export const HERO_PROMO_NATIVE_HEIGHT = 725

/** Natywna rozdzielczość banera hero mobile. */
export const HERO_PROMO_MOBILE_NATIVE_WIDTH = 941

export const HERO_PROMO_MOBILE_NATIVE_HEIGHT = 1672

/** Maks. szerokość wyświetlania desktop (jak wcześniejszy baner 1234×413). */
export const HERO_PROMO_DISPLAY_MAX_WIDTH = 1234

/** Desktop: oryginalny PNG, bez Next Image Optimizer. */
export const heroPromoDesktopImageProps = {
  unoptimized: true as const,
}

/** Mobile: oryginalny PNG, bez Next Image Optimizer. */
export const heroPromoImageProps = {
  unoptimized: true as const,
}

export const HERO_PROMO_IMAGE_SIZES = `(max-width: ${HERO_PROMO_DISPLAY_MAX_WIDTH}px) 100vw, ${HERO_PROMO_DISPLAY_MAX_WIDTH}px`

export const HERO_PROMO_MOBILE_IMAGE_SIZES = `(max-width: ${HERO_PROMO_MOBILE_NATIVE_WIDTH}px) 100vw, ${HERO_PROMO_MOBILE_NATIVE_WIDTH}px`

export const HERO_PROMO_ASPECT_CLASS = 'aspect-[941/1672] md:aspect-[1234/413]'
