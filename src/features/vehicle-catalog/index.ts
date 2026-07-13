export {
  CatalogQuerySchema,
  PricingResolveSchema,
  SELLABLE_PRICING_CATEGORIES,
} from "./model/schemas"
export {
  CatalogMatConfigurationSchema,
  MatConfigurationSchema,
  MatCarDetailsSchema,
  isCatalogMatConfiguration,
  parseMatConfiguration,
  parseCatalogMatConfiguration,
} from "./model/matConfiguration"
export type {
  MatConfiguration,
  CatalogMatConfiguration,
  MatPricingSnapshot,
  MatBitrixSnapshot,
} from "./model/matConfiguration"
export type {
  CatalogQuery,
  PricingResolveInput,
  PricingVariantOption,
  VehicleCatalogBrand,
  VehicleModelFamily,
  VehicleTemplateOption,
} from "./model/schemas"
export { getVehicleCatalog } from "./server/catalogService"
export { resolveVehiclePricing } from "./server/pricingService"
export {
  getSellableBrands,
  getBrandModelsCatalog,
  searchVehicleCatalog,
} from "./server/brandCatalogService"
export type {
  SellableBrand,
  CatalogSearchResult,
} from "./server/brandCatalogService"
export { useVehicleCatalog } from "./hooks/useVehicleCatalog"
export { useResolvedPricing } from "./hooks/useResolvedPricing"
export { useQuickSearchCatalog } from "./hooks/useQuickSearchCatalog"
export { enrichCarContextFromTemplates } from "./utils/enrichCarContextFromTemplates"
export { resolveBitrixVariantEnumId } from "./domain/bitrixEnumIds"
export { resolveBitrixPolishLabel } from "./domain/bitrixEnumIds"
export {
  getLegacyGenerations,
  getLegacyBodyTypes,
} from "./server/legacyCatalogService"
export {
  fetchCatalogBrands,
  fetchCatalogModels,
  fetchCatalogTemplates,
  fetchResolvedPricing,
} from "./api/client"
export type { PricingResponse } from "./api/client"
