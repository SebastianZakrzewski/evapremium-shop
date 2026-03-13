// Brand utilities - Public API

// Brand normalizer
export {
  humanizeBrandSlug,
  mapSlugToCanonicalBrand,
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
  type BrandMappingInfo,
} from './brandMapper';

// Car models API
export {
  fetchCarModelsByApiName,
  fetchCarModelsBySlug,
  resolveBrandApiName,
  buildCarModelsApiUrl,
} from './carModelsApi';




















