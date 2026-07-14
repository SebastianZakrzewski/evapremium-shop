// Brand utilities - Public API

// Brand normalizer
export {
  humanizeBrandSlug,
  mapSlugToCanonicalBrand,
  mapApiNameToDbName,
  getBrandMetaBySlug,
  supportedBrands,
  MODELE_IMAGE_MAP,
  type BrandMeta,
} from './brandNormalizer';

// Brand mapper
export {
  getBrandInfo,
  normalizeBrandName,
  getBrandDisplayName,
  getBrandLogo,
  getBrandApiName,
  resolveBrandLogo,
  resolveBrandDisplayNameFromDbName,
  resolveBrandSlugFromDbName,
  normalizeBrandForClient,
  type BrandMappingInfo,
} from './brandMapper';

export {
  shouldServeBrandImageUnoptimized,
  BRAND_GRID_SIZES_COMPACT,
  BRAND_GRID_SIZES_STANDARD,
  BRAND_CAROUSEL_SIZES,
  isBrandPhotoFile,
  isModeleBrandPhoto,
} from './brandImage';

// Car models API
export {
  fetchCarModelsByApiName,
  fetchCarModelsBySlug,
  resolveBrandApiName,
  buildCarModelsApiUrl,
} from './carModelsApi';

// Brand URL params
export {
  parseBrandFromUrl,
  resolveBrandFromUrlParam,
  brandNameToNavigationSlug,
  type ResolvedBrandParam,
} from './brandParam';

// Brand popularity sorting
export {
  POPULAR_BRAND_SLUGS,
  getBrandPopularityRank,
  sortBrandsByPopularity,
} from './brandPopularity';




















