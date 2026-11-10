/**
 * Layout sizes measured from Tesla mobile screenshots at a 390×844 CSS viewport.
 * Colors and type stay Eva (Montserrat, red CTA). Tesla blue, logo and fonts are not copied.
 *
 * Sources: tesla-02 (sticky bar), tesla-03 (40px swatches, 16px gap), tesla-08 (2px selected
 * card border), tesla-17 (option rows). Image block is 236/844 ≈ 28% of the viewport.
 */
export const TESLA_LAYOUT = {
  viewportWidth: 390,
  viewportHeight: 844,
  imageAspectWidth: 390,
  imageAspectHeight: 236,
  swatchSize: 40,
  swatchGap: 16,
  cardRadius: 4,
  cardPaddingX: 16,
  cardPaddingY: 14,
  buttonHeight: 40,
  buttonRadius: 4,
  stickyBarMinHeight: 70,
  stickyBarPaddingX: 24,
  stickyBarPaddingTop: 12,
  priceFontSize: 17,
  priceLineHeight: 22,
  sectionTitleSize: 20,
  sectionTitleLine: 24,
  bodySize: 14,
  bodyLine: 20,
  captionSize: 13,
  captionLine: 18,
  sectionGap: 32,
  cardGap: 8,
  pagePaddingX: 24,
  crossfadeMs: 300,
  sectionViewThreshold: 0.35,
  text: "#171a20",
  muted: "#5c5e62",
  border: "#d0d1d2",
  pageBackground: "#ffffff",
  selectedBorder: "#171a20",
  cta: "#e10600",
  ctaText: "#ffffff",
} as const

export const teslaImageAspectRatio = `${TESLA_LAYOUT.imageAspectWidth} / ${TESLA_LAYOUT.imageAspectHeight}`
