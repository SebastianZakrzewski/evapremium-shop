/**
 * The model-on-mats photo stays up when a car is already chosen.
 * The generic product photo replaces it only after the visitor scrolls
 * to the product, picks a mat type, or changes colour. A section that is
 * merely beside the image on a wide screen does not count.
 */
export const shouldShowProductPreview = ({
  productSectionInView,
  productSectionPinned,
  appearanceTouched,
  scrolled,
}: {
  productSectionInView: boolean
  productSectionPinned: boolean
  appearanceTouched: boolean
  scrolled: boolean
}): boolean => {
  if (appearanceTouched || productSectionPinned) return true
  return productSectionInView && scrolled
}
