// Brand utilities - Public API

// Brand normalizer
export {
  humanizeBrandSlug,
  mapSlugToCanonicalBrand,
  getBrandMetaBySlug,
  supportedBrands,
  type BrandMeta,
} from './brandNormalizer';

// Brand mapper
export {
  getBrandInfo,
  normalizeBrandName,
  getBrandDisplayName,
  getBrandLogo,
  getBrandApiName,
  type BrandMappingInfo,
} from './brandMapper';

// Car models API
export {
  fetchCarModelsByApiName,
  fetchCarModelsBySlug,
  resolveBrandApiName,
  buildCarModelsApiUrl,
} from './carModelsApi';


















