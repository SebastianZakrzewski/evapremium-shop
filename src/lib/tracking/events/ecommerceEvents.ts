/**
 * Funkcje e-commerce events dla tracking
 * Wysokopoziomowe API do śledzenia zdarzeń e-commerce
 */

import { FacebookPixelProvider } from '../providers/FacebookPixelProvider';
import { getTrackingConfigInstance } from '@/lib/config/tracking';
import { isMarketingTrackingAllowed } from '../consent/isMarketingTrackingAllowed';
import type {
  PageViewData,
  ViewContentData,
  AddToCartData,
  InitiateCheckoutData,
  AddPaymentInfoData,
  PurchaseData,
  SearchData,
  LeadData,
  ContentItem,
  ProductData,
} from '../types';
import type { CartItem } from '@/lib/types/cart-new';
import { isMatCartConfiguration } from '@/lib/types/cart-new';
import type { OrderItem } from '@/lib/types/order-new';

/**
 * Singleton instance providera
 */
let providerInstance: FacebookPixelProvider | null = null;

export const resetTrackingProviderForTests = (): void => {
  providerInstance = null;
};

/**
 * Pobranie lub utworzenie instance providera
 */
function getProvider(): FacebookPixelProvider | null {
  if (!isMarketingTrackingAllowed()) {
    return null;
  }

  if (!providerInstance) {
    const config = getTrackingConfigInstance();
    providerInstance = new FacebookPixelProvider();
    providerInstance.init({
      enabled: config.enabled,
      debug: config.debug,
    });
  }
  return providerInstance;
}

/**
 * Hash email dla prywatności (SHA-256)
 */
function hashEmail(email: string): string {
  // W produkcji użyj crypto.subtle.digest
  // Tutaj uproszczona wersja dla przykładu
  return btoa(email).substring(0, 16);
}

/**
 * Hash telefonu dla prywatności
 */
function hashPhone(phone: string): string {
  return btoa(phone).substring(0, 16);
}

/**
 * Konwersja CartItem na ContentItem
 */
function cartItemToContentItem(item: CartItem): ContentItem {
  return {
    id: item.productId,
    quantity: item.quantity,
    item_price: item.unitPrice,
    item_name: item.productName,
    item_category: item.productType === 'mat' ? 'car_mats' : 'accessories',
    item_brand: isMatCartConfiguration(item.configuration)
      ? item.configuration.carDetails.brand
      : 'EvaPremium',
    item_variant: item.productSku,
  };
}

/**
 * Konwersja OrderItem na ContentItem
 */
function orderItemToContentItem(item: OrderItem): ContentItem {
  return {
    id: item.productId || item.id, // Fallback do item.id jeśli productId jest null
    quantity: item.quantity,
    item_price: item.unitPrice,
    item_name: item.productName,
    item_category: item.productType === 'mat' ? 'car_mats' : 'accessories',
    item_brand: isMatCartConfiguration(item.configuration)
      ? item.configuration.carDetails.brand
      : 'EvaPremium',
    item_variant: item.productSku,
  };
}

/**
 * Śledzenie PageView
 */
export function trackPageView(data: PageViewData): void {
  try {
    const provider = getProvider();
    if (!provider) {
      return;
    }
    provider.pageView(data);
  } catch (error) {
    console.error('[Tracking] Error tracking PageView:', error);
  }
}

/**
 * Śledzenie ViewContent (wyświetlenie produktu)
 */
export function trackViewContent(data: ViewContentData): void {
  try {
    const provider = getProvider();
    if (!provider) {
      return;
    }
    provider.track('ViewContent', data);
  } catch (error) {
    console.error('[Tracking] Error tracking ViewContent:', error);
  }
}

/**
 * Śledzenie AddToCart (dodanie do koszyka)
 */
export function trackAddToCart(data: AddToCartData): void {
  try {
    const provider = getProvider();
    if (!provider) {
      return;
    }
    provider.track('AddToCart', data);
  } catch (error) {
    console.error('[Tracking] Error tracking AddToCart:', error);
  }
}

/**
 * Śledzenie RemoveFromCart (usunięcie z koszyka)
 */
export function trackRemoveFromCart(data: AddToCartData): void {
  try {
    const provider = getProvider();
    if (!provider) {
      return;
    }
    provider.track('RemoveFromCart', data);
  } catch (error) {
    console.error('[Tracking] Error tracking RemoveFromCart:', error);
  }
}

/**
 * Śledzenie InitiateCheckout (rozpoczęcie checkoutu)
 */
export function trackInitiateCheckout(data: InitiateCheckoutData): void {
  try {
    const provider = getProvider();
    if (!provider) {
      return;
    }
    provider.track('InitiateCheckout', data);
  } catch (error) {
    console.error('[Tracking] Error tracking InitiateCheckout:', error);
  }
}

/**
 * Śledzenie AddPaymentInfo (dodanie danych płatności)
 */
export function trackAddPaymentInfo(data: AddPaymentInfoData): void {
  try {
    const provider = getProvider();
    if (!provider) {
      return;
    }
    provider.track('AddPaymentInfo', data);
  } catch (error) {
    console.error('[Tracking] Error tracking AddPaymentInfo:', error);
  }
}

/**
 * Śledzenie Purchase (zakończenie zakupu)
 */
export function trackPurchase(data: PurchaseData): void {
  try {
    const provider = getProvider();
    if (!provider) {
      return;
    }
    provider.track('Purchase', data);
  } catch (error) {
    console.error('[Tracking] Error tracking Purchase:', error);
  }
}

/**
 * Śledzenie Search (wyszukiwanie)
 */
export function trackSearch(data: SearchData): void {
  try {
    const provider = getProvider();
    if (!provider) {
      return;
    }
    provider.track('Search', data);
  } catch (error) {
    console.error('[Tracking] Error tracking Search:', error);
  }
}

/**
 * Śledzenie Lead (lead generation)
 */
export function trackLead(data: LeadData): void {
  try {
    const provider = getProvider();
    if (!provider) {
      return;
    }
    provider.track('Lead', data);
  } catch (error) {
    console.error('[Tracking] Error tracking Lead:', error);
  }
}

/**
 * Helper: Tworzenie danych AddToCart z CartItem
 */
export function createAddToCartData(
  item: CartItem,
  cartTotal?: number
): AddToCartData {
  return {
    content_name: item.productName,
    content_ids: [item.productId],
    content_type: 'product',
    content_category: item.productType === 'mat' ? 'car_mats' : 'accessories',
    value: item.subtotal,
    currency: 'PLN',
    num_items: item.quantity,
    contents: [cartItemToContentItem(item)],
  };
}

/**
 * Helper: Tworzenie danych InitiateCheckout z koszyka
 */
export function createInitiateCheckoutData(
  items: CartItem[],
  total: number
): InitiateCheckoutData {
  return {
    content_name: 'Checkout',
    content_category: 'checkout',
    value: total,
    currency: 'PLN',
    num_items: items.reduce((sum, item) => sum + item.quantity, 0),
    contents: items.map(cartItemToContentItem),
  };
}

/**
 * Helper: Tworzenie danych Purchase z zamówienia
 */
export function createPurchaseData(
  items: OrderItem[],
  orderNumber: string,
  total: number,
  transactionId: string,
  paymentMethod?: string,
  customerEmail?: string,
  customerPhone?: string
): PurchaseData {
  return {
    content_name: 'Purchase Completed',
    content_ids: [orderNumber],
    value: total,
    currency: 'PLN',
    transaction_id: transactionId,
    payment_method: paymentMethod,
    contents: items.map(orderItemToContentItem),
    customer: {
      email_hash: customerEmail ? hashEmail(customerEmail) : undefined,
      phone_hash: customerPhone ? hashPhone(customerPhone) : undefined,
    },
  };
}

/**
 * Helper: Tworzenie danych ViewContent z produktu
 */
export function createViewContentData(
  product: ProductData,
  price: number
): ViewContentData {
  return {
    content_name: product.name,
    content_ids: [product.id],
    content_type: 'product',
    content_category: product.category || 'product',
    value: price,
    currency: 'PLN',
    product,
  };
}

