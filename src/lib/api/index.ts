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

// Orders API
export {
  ordersApi,
  createOrder,
  getOrder,
  getCustomerOrders,
  updateOrderStatus,
} from './orders';

// Mats API
export {
  matsApi,
  findMat,
  getMats,
  getBodyTypes,
} from './mats';

// Search API
export {
  searchApi,
  search,
  type SearchResults,
  type SearchBrand,
  type SearchModel,
  type SearchProduct,
} from './search';

// Payments API
export {
  paymentsApi,
  registerP24Payment,
  type P24PaymentResponse,
} from './payments';

// Abandoned Carts API
export {
  abandonedCartsApi,
  sendHeartbeat,
  sendWebhook,
  persistPaymentRedirectSnapshot,
  type AbandonedCartPayload,
  type AbandonedCartWebhookPayload,
} from './abandonedCarts';

// Bitrix24 API
export {
  bitrix24Api,
  sendChatMessage,
  type ChatMessageData,
  type ChatResponse,
} from './bitrix24';

