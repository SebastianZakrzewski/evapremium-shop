/**
 * Abandoned Carts API Service
 * 
 * Centralized API calls for abandoned cart endpoints
 * Supports navigator.sendBeacon for pagehide events
 */

export interface AbandonedCartPayload {
  sessionId: string;
  stage?: string;
  cartHasItems?: boolean;
  utm?: Record<string, unknown>;
  contact?: Record<string, unknown>;
  car?: Record<string, unknown>;
  configuration?: Record<string, unknown>;
  items?: Array<Record<string, unknown>>;
  currency?: string;
  totalAmount?: number;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

export interface AbandonedCartWebhookPayload extends AbandonedCartPayload {
  event: 'pagehide';
}

/**
 * Send abandoned cart heartbeat
 */
export async function sendHeartbeat(payload: AbandonedCartPayload): Promise<void> {
  try {
    // Use fetch with keepalive for heartbeat
    const response = await fetch('/api/abandoned-carts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    });
    
    if (!response.ok) {
      // Don't throw - heartbeat failures should be silent
      console.warn('[AbandonedCart] Heartbeat failed:', response.status);
    }
  } catch (error) {
    // Don't throw - heartbeat failures should be silent
    console.warn('[AbandonedCart] Heartbeat error:', error);
  }
}

/**
 * Send abandoned cart webhook (for pagehide events)
 * Tries sendBeacon first, falls back to fetch with keepalive
 */
export async function sendWebhook(payload: AbandonedCartWebhookPayload): Promise<void> {
  try {
    // Try sendBeacon first (more reliable for pagehide)
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      const sent = navigator.sendBeacon('/api/abandoned-carts/webhook', blob);
      
      if (sent) {
        return;
      }
      
      // Fallback to fetch if sendBeacon failed
      console.warn('[AbandonedCart] sendBeacon failed, using fetch fallback');
    }
    
    // Fallback to fetch with keepalive
    const response = await fetch('/api/abandoned-carts/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    });
    
    if (!response.ok) {
      // Don't throw - webhook failures should be silent
      console.warn('[AbandonedCart] Webhook failed:', response.status);
    }
  } catch (error) {
    // Don't throw - webhook failures should be silent (page is unloading)
    console.warn('[AbandonedCart] Webhook error:', error);
  }
}

/**
 * Abandoned Carts API object with all methods
 */
export const abandonedCartsApi = {
  sendHeartbeat,
  sendWebhook,
};

