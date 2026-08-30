export type EvaPageType = 'home' | 'product' | 'cart' | 'checkout' | 'other'

export type ShopRouteParams = Record<string, string | string[] | undefined> | null

const firstParamValue = (value: string | string[] | undefined): string | undefined => {
  if (typeof value === 'string' && value.length > 0) {
    return value
  }

  if (Array.isArray(value) && typeof value[0] === 'string' && value[0].length > 0) {
    return value[0]
  }

  return undefined
}

export const pageTypeFromPath = (pathname: string): EvaPageType => {
  if (pathname === '/' || pathname === '') {
    return 'home'
  }

  if (pathname.startsWith('/cart') || pathname.startsWith('/koszyk')) {
    return 'cart'
  }

  if (pathname.startsWith('/checkout')) {
    return 'checkout'
  }

  if (
    pathname.startsWith('/product') ||
    pathname.startsWith('/p/') ||
    pathname.startsWith('/dywaniki') ||
    pathname.startsWith('/akcesoria') ||
    pathname.startsWith('/konfigurator')
  ) {
    return 'product'
  }

  return 'other'
}

export const productIdFromShopParams = (
  pathname: string,
  params: ShopRouteParams,
  searchParams: URLSearchParams,
): string | undefined => {
  const fromQuery = searchParams.get('productId') ?? searchParams.get('id')
  if (fromQuery) {
    return fromQuery
  }

  const pathMatch = pathname.match(/^\/(?:product|p)\/([^/]+)/)
  if (pathMatch?.[1]) {
    return pathMatch[1]
  }

  if (!params) {
    return undefined
  }

  return (
    firstParamValue(params.productId) ??
    firstParamValue(params.id) ??
    firstParamValue(params.slug)
  )
}
