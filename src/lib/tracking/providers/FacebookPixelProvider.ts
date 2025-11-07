/**
 * Facebook Pixel Provider
 * Implementacja Facebook Pixel SDK dla śledzenia zdarzeń e-commerce
 */

import { BasePixelProvider } from './BasePixelProvider';
import type {
  TrackingEvent,
  EcommerceEventData,
  PageViewData,
  TrackingProviderOptions,
} from '../types';

declare global {
  interface Window {
    fbq?: (
      command: 'init' | 'track' | 'trackCustom',
      eventName: string,
      params?: Record<string, unknown>
    ) => void;
    _fbq?: typeof window.fbq;
  }
}

/**
 * Mapowanie zdarzeń trackingowych na standardy Facebook Pixel
 */
const FACEBOOK_EVENT_MAP: Record<TrackingEvent, string> = {
  PageView: 'PageView',
  ViewContent: 'ViewContent',
  AddToCart: 'AddToCart',
  RemoveFromCart: 'RemoveFromCart',
  InitiateCheckout: 'InitiateCheckout',
  AddPaymentInfo: 'AddPaymentInfo',
  Purchase: 'Purchase',
  Search: 'Search',
  Lead: 'Lead',
  Contact: 'Contact',
};

export class FacebookPixelProvider extends BasePixelProvider {
  private pixelId: string | null = null;

  /**
   * Inicjalizacja Facebook Pixel
   */
  init(options?: TrackingProviderOptions): void {
    try {
      if (typeof window === 'undefined') {
        this.log('Window not available, skipping initialization');
        return;
      }

      this.enabled = options?.enabled ?? true;
      this.debug = options?.debug ?? false;

      if (!this.enabled) {
        this.log('Facebook Pixel disabled');
        return;
      }

      // Pixel ID powinien być przekazany przez konfigurację
      const pixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
      
      if (!pixelId) {
        this.log('Facebook Pixel ID not configured');
        return;
      }

      this.pixelId = pixelId;

      // Inicjalizacja fbq jeśli jeszcze nie istnieje
      if (!window.fbq) {
        // eslint-disable-next-line prefer-rest-params, prefer-spread
        (function (f: Window, b: Document, e: string, v: string, n?: string, t?: string, s?: HTMLScriptElement) {
          if (f.fbq) return;
          // eslint-disable-next-line prefer-rest-params, prefer-spread
          n = f.fbq = function () {
            // eslint-disable-next-line prefer-rest-params, prefer-spread
            n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
          };
          if (!f._fbq) f._fbq = n;
          n.push = n;
          n.loaded = !0;
          n.version = '2.0';
          n.queue = [];
          t = b.createElement(e);
          t.async = !0;
          t.src = v;
          s = b.getElementsByTagName(e)[0];
          if (s?.parentNode) {
            s.parentNode.insertBefore(t, s);
          }
        })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      }

      // Inicjalizacja pixela
      if (window.fbq) {
        window.fbq('init', this.pixelId, {
          autoConfig: true,
          debug: this.debug,
        });

        // Test Event Code dla testów
        if (options?.testEventCode) {
          window.fbq('init', this.pixelId, {
            testEventCode: options.testEventCode,
          });
        }

        this.initialized = true;
        this.log('Facebook Pixel initialized', { pixelId: this.pixelId });
      }
    } catch (error) {
      this.handleError(error, 'init');
    }
  }

  /**
   * Wysyłanie zdarzenia trackingowego
   */
  track(event: TrackingEvent, data: EcommerceEventData): void {
    if (!this.validateEventData(data)) {
      return;
    }

    try {
      const facebookEvent = FACEBOOK_EVENT_MAP[event];
      
      if (!facebookEvent) {
        this.log(`Unknown event type: ${event}`);
        return;
      }

      if (!window.fbq) {
        this.log('fbq not available');
        return;
      }

      // Przygotowanie parametrów dla Facebook Pixel
      const params = this.prepareFacebookParams(data);

      this.log(`Tracking event: ${facebookEvent}`, params);

      // Wysyłanie zdarzenia
      window.fbq('track', facebookEvent, params);

      // Dla Purchase, również wysyłamy PurchaseComplete
      if (event === 'Purchase') {
        window.fbq('track', 'PurchaseComplete', params);
      }
    } catch (error) {
      this.handleError(error, `track:${event}`);
    }
  }

  /**
   * Wysyłanie zdarzenia PageView
   */
  pageView(data: PageViewData): void {
    if (!this.validateEventData(data)) {
      return;
    }

    try {
      if (!window.fbq) {
        this.log('fbq not available');
        return;
      }

      const params = {
        content_name: data.content_name,
        content_category: data.content_category,
        page_path: data.page_path,
        page_title: data.page_title,
      };

      this.log('Tracking PageView', params);

      window.fbq('track', 'PageView', params);
    } catch (error) {
      this.handleError(error, 'pageView');
    }
  }

  /**
   * Przygotowanie parametrów zgodnie ze standardami Facebook Pixel
   */
  private prepareFacebookParams(data: EcommerceEventData): Record<string, unknown> {
    const params: Record<string, unknown> = {};

    // Podstawowe parametry
    if (data.content_name) {
      params.content_name = data.content_name;
    }

    if (data.content_ids && data.content_ids.length > 0) {
      params.content_ids = data.content_ids;
    }

    if (data.content_type) {
      params.content_type = data.content_type;
    }

    if (data.content_category) {
      params.content_category = data.content_category;
    }

    // Wartość i waluta
    if (data.value !== undefined) {
      params.value = data.value;
    }

    if (data.currency) {
      params.currency = data.currency;
    }

    // Liczba produktów
    if (data.num_items !== undefined) {
      params.num_items = data.num_items;
    }

    // Zawartość (contents) - wymagane dla niektórych eventów
    if (data.contents && data.contents.length > 0) {
      params.contents = data.contents.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        item_price: item.item_price,
        item_name: item.item_name,
        item_category: item.item_category,
        item_brand: item.item_brand,
        item_variant: item.item_variant,
      }));
    }

    // Dane produktu
    if (data.product) {
      params.product = {
        id: data.product.id,
        name: data.product.name,
        sku: data.product.sku,
        price: data.product.price,
        brand: data.product.brand,
        category: data.product.category,
        quantity: data.product.quantity,
        variant: data.product.variant,
      };
    }

    // ID transakcji (dla Purchase)
    if (data.transaction_id) {
      params.transaction_id = data.transaction_id;
    }

    // Metoda płatności
    if (data.payment_method) {
      params.payment_method = data.payment_method;
    }

    // Wyszukiwanie
    if (data.search_string) {
      params.search_string = data.search_string;
    }

    // Dane klienta (hashed)
    if (data.customer) {
      if (data.customer.email_hash) {
        params.email_hash = data.customer.email_hash;
      }
      if (data.customer.phone_hash) {
        params.phone_hash = data.customer.phone_hash;
      }
    }

    return params;
  }
}

