/**
 * Typy dla modułu śledzenia ruchu (tracking)
 */

/**
 * Uniwersalny typ zdarzenia trackingowego
 */
export type TrackingEvent =
  | 'PageView'
  | 'ViewContent'
  | 'AddToCart'
  | 'RemoveFromCart'
  | 'InitiateCheckout'
  | 'AddPaymentInfo'
  | 'Purchase'
  | 'Search'
  | 'Lead'
  | 'Contact';

/**
 * Dane produktu dla tracking
 */
export interface ProductData {
  id: string;
  name: string;
  sku?: string;
  price: number;
  brand?: string;
  category?: string;
  quantity?: number;
  variant?: string;
  image?: string;
  configuration?: Record<string, unknown>;
}

/**
 * Dane zawartości (contents) dla Facebook Pixel
 */
export interface ContentItem {
  id: string;
  quantity: number;
  item_price: number;
  item_name: string;
  item_category?: string;
  item_brand?: string;
  item_variant?: string;
}

/**
 * Dane klienta (hashed dla prywatności)
 */
export interface CustomerTrackingData {
  email_hash?: string;
  phone_hash?: string;
}

/**
 * Uniwersalne dane zdarzenia e-commerce
 */
export interface EcommerceEventData {
  content_name?: string;
  content_ids?: string[];
  content_type?: string;
  content_category?: string;
  value?: number;
  currency?: string;
  num_items?: number;
  contents?: ContentItem[];
  product?: ProductData;
  transaction_id?: string;
  payment_method?: string;
  customer?: CustomerTrackingData;
  page_path?: string;
  search_string?: string;
}

/**
 * Dane dla zdarzenia PageView
 */
export interface PageViewData {
  content_name: string;
  content_category: string;
  page_path: string;
  page_title?: string;
}

/**
 * Dane dla zdarzenia ViewContent
 */
export interface ViewContentData extends EcommerceEventData {
  content_name: string;
  content_ids: string[];
  content_type: 'product';
  content_category: string;
  value: number;
  currency: string;
  product: ProductData;
}

/**
 * Dane dla zdarzenia AddToCart
 */
export interface AddToCartData extends EcommerceEventData {
  content_name: string;
  content_ids: string[];
  content_type: 'product';
  content_category: string;
  value: number;
  currency: string;
  num_items: number;
  contents: ContentItem[];
}

/**
 * Dane dla zdarzenia InitiateCheckout
 */
export interface InitiateCheckoutData extends EcommerceEventData {
  content_name: string;
  content_category: 'checkout';
  value: number;
  currency: string;
  num_items: number;
  contents: ContentItem[];
}

/**
 * Dane dla zdarzenia AddPaymentInfo
 */
export interface AddPaymentInfoData extends EcommerceEventData {
  content_name: string;
  content_category: 'checkout';
  value: number;
  currency: string;
  payment_method: string;
  contents: ContentItem[];
}

/**
 * Dane dla zdarzenia Purchase
 */
export interface PurchaseData extends EcommerceEventData {
  content_name: string;
  content_ids: string[];
  value: number;
  currency: string;
  transaction_id: string;
  payment_method?: string;
  contents: ContentItem[];
  customer?: CustomerTrackingData;
}

/**
 * Dane dla zdarzenia Search
 */
export interface SearchData {
  content_name: string;
  content_category: 'search';
  search_string: string;
}

/**
 * Dane dla zdarzenia Lead
 */
export interface LeadData {
  content_name: string;
  content_category: 'lead';
  value?: number;
  currency?: string;
}

/**
 * Opcje konfiguracji tracking providera
 */
export interface TrackingProviderOptions {
  enabled?: boolean;
  debug?: boolean;
  testEventCode?: string;
}

/**
 * Interfejs dla tracking providera
 */
export interface ITrackingProvider {
  init(options?: TrackingProviderOptions): void;
  track(event: TrackingEvent, data: EcommerceEventData): void;
  pageView(data: PageViewData): void;
  isInitialized(): boolean;
}

