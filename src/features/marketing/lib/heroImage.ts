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

const desktopSrc = (width: number, ext: 'avif' | 'webp') =>
  `/images/hero/responsive/jesien-hero-${width}.${ext}`

const mobileSrc = (width: number, ext: 'avif' | 'webp') =>
  `/images/hero/responsive/jesien-mobile-${width}.${ext}`

export const HERO_PROMO_DESKTOP_SRCSET_AVIF = `${desktopSrc(768, 'avif')} 768w, ${desktopSrc(1234, 'avif')} 1234w, ${desktopSrc(2168, 'avif')} 2168w`

export const HERO_PROMO_DESKTOP_SRCSET_WEBP = `${desktopSrc(768, 'webp')} 768w, ${desktopSrc(1234, 'webp')} 1234w, ${desktopSrc(2168, 'webp')} 2168w`

export const HERO_PROMO_MOBILE_SRCSET_AVIF = `${mobileSrc(480, 'avif')} 480w, ${mobileSrc(768, 'avif')} 768w, ${mobileSrc(941, 'avif')} 941w`

export const HERO_PROMO_MOBILE_SRCSET_WEBP = `${mobileSrc(480, 'webp')} 480w, ${mobileSrc(768, 'webp')} 768w, ${mobileSrc(941, 'webp')} 941w`
