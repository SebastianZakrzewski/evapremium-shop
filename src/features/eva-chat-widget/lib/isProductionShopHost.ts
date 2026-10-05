const PRODUCTION_SHOP_HOSTS = new Set(['evapremium.pl', 'www.evapremium.pl'])

export const isProductionShopHost = (hostname: string): boolean =>
  PRODUCTION_SHOP_HOSTS.has(hostname.toLowerCase())
