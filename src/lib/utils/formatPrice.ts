const priceFormatter = new Intl.NumberFormat("pl-PL", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export const formatPriceValue = (price: number | null | undefined): string => {
  if (price === null || price === undefined || Number.isNaN(price)) {
    return "0,00"
  }

  return priceFormatter.format(price)
}

export const formatPricePln = (price: number | null | undefined): string =>
  `${formatPriceValue(price)} zł`

export const formatPriceCurrency = (
  price: number | null | undefined,
  currency = "PLN"
): string => `${formatPriceValue(price)} ${currency}`
