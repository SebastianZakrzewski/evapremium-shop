import { useEffect, useRef } from 'react';
import { abandonedCartsApi, type AbandonedCartPayload, type AbandonedCartWebhookPayload } from '@/lib/api';

type BuildPayload = () => {
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
};

interface Options {
  intervalMs?: number;
}

export function useAbandonedCartHeartbeat(active: boolean, buildPayload: BuildPayload, options: Options = {}) {
  const { intervalMs = 30000 } = options;
  const timerRef = useRef<number | null>(null);
  const webhookSentRef = useRef<boolean>(false); // Flag to prevent duplicate webhook calls
  
  // Store buildPayload in ref to avoid recreating effect on every render
  const buildPayloadRef = useRef<BuildPayload>(buildPayload);
  useEffect(() => {
    buildPayloadRef.current = buildPayload;
  }, [buildPayload]);

  useEffect(() => {
    if (!active) {
      // Reset flag when hook is deactivated
      webhookSentRef.current = false;
      return;
    }

    // Reset flag when hook becomes active
    webhookSentRef.current = false;

    const send = async () => {
      try {
        const payload = buildPayloadRef.current();
        if (!payload || !payload.sessionId) return;
        await abandonedCartsApi.sendHeartbeat(payload as AbandonedCartPayload);
      } catch (_) {
        // swallow
      }
    };

    // initial ping
    send();

    // heartbeat interval
    timerRef.current = window.setInterval(send, intervalMs);

    // pagehide/beforeunload via beacon
    const onPageHide = () => {
      // Prevent duplicate webhook calls if already sent
      if (webhookSentRef.current) {
        console.log('[AbandonedCart:Heartbeat] Webhook already sent, skipping duplicate call');
        return;
      }

      try {
        const payload = buildPayloadRef.current();
        if (!payload || !payload.sessionId) {
          console.warn('[AbandonedCart:Heartbeat] Cannot send beacon: missing payload or sessionId');
          return;
        }
        
        // Mark as sent immediately to prevent duplicate calls
        webhookSentRef.current = true;
        
        const webhookPayload: AbandonedCartWebhookPayload = { ...payload, event: 'pagehide' };
        console.log('[AbandonedCart:Heartbeat] Sending beacon on pagehide', { 
          sessionId: payload.sessionId?.substring(0, 8) + '...',
          stage: payload.stage,
          cartHasItems: payload.cartHasItems,
          itemsCount: payload.items?.length || 0
        });
        
        // sendWebhook handles async internally and doesn't throw
        abandonedCartsApi.sendWebhook(webhookPayload).catch(() => {
          // Ignore errors - page is unloading
        });
      } catch (error) {
        console.error('[AbandonedCart:Heartbeat] Error in onPageHide', error);
        // Reset flag on error so it can be retried if needed
        webhookSentRef.current = false;
      }
    };

    window.addEventListener('pagehide', onPageHide);
    window.addEventListener('beforeunload', onPageHide);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('beforeunload', onPageHide);
      // Reset flag when cleaning up
      webhookSentRef.current = false;
    };
  }, [active, intervalMs]); // Removed buildPayload from dependencies
}

