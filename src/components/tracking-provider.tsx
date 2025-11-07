/**
 * TrackingProvider - komponent inicjalizujący tracking i automatyczne PageView
 */

'use client';

import { useEffect } from 'react';
import { usePageView } from '@/lib/tracking/hooks/usePageView';
import { getTrackingConfigInstance } from '@/lib/config/tracking';
import { FacebookPixelProvider } from '@/lib/tracking/providers/FacebookPixelProvider';

let providerInstance: FacebookPixelProvider | null = null;

export function TrackingProvider({ children }: { children: React.ReactNode }) {
  const config = getTrackingConfigInstance();
  
  // Inicjalizacja providera przy pierwszym renderze
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!config.enabled) {
      return;
    }

    if (!providerInstance) {
      providerInstance = new FacebookPixelProvider();
      providerInstance.init({
        enabled: config.enabled,
        debug: config.debug,
      });
    }
  }, [config.enabled, config.debug]);

  // Automatyczne śledzenie PageView przy zmianie route
  usePageView();

  return <>{children}</>;
}

