import { useEffect, useRef } from 'react';

type BuildPayload = () => {
  sessionId: string;
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

  useEffect(() => {
    if (!active) return;

    const send = async () => {
      try {
        const payload = buildPayload();
        if (!payload || !payload.sessionId) return;
        await fetch('/api/abandoned-carts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true,
        });
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
      try {
        const payload = buildPayload();
        if (!payload || !payload.sessionId) return;
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        navigator.sendBeacon('/api/abandoned-carts', blob);
      } catch (_) {
        // ignore
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
    };
  }, [active, buildPayload, intervalMs]);
}


