/**
 * API Client - Public API
 */

// Core client
export {
  apiClient,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  ApiError,
  type ApiClientOptions,
  type ApiClientResponse,
} from './client';

// Brand API
export {
  fetchBrands,
  getFallbackBrands,
} from './brands';

// Models API
export {
  fetchCarModels,
  fetchCarModelsBySlug,
} from './models';

