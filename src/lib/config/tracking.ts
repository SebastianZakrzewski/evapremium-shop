/**
 * Konfiguracja modułu trackingowego
 * Walidacja zmiennych środowiskowych używając Zod
 */

import { z } from 'zod';

/**
 * Schema walidacji zmiennych środowiskowych dla tracking
 */
const trackingEnvSchema = z.object({
  NEXT_PUBLIC_FB_PIXEL_ID: z.string().optional(),
  NEXT_PUBLIC_TRACKING_ENABLED: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

/**
 * Typ konfiguracji tracking
 */
export type TrackingConfig = z.infer<typeof trackingEnvSchema> & {
  enabled: boolean;
  debug: boolean;
};

/**
 * Funkcja walidująca i zwracająca konfigurację tracking
 */
export function getTrackingConfig(): TrackingConfig {
  try {
    const env = trackingEnvSchema.parse({
      NEXT_PUBLIC_FB_PIXEL_ID: process.env.NEXT_PUBLIC_FB_PIXEL_ID,
      NEXT_PUBLIC_TRACKING_ENABLED: process.env.NEXT_PUBLIC_TRACKING_ENABLED,
      NODE_ENV: process.env.NODE_ENV,
    });

    const enabled = env.NEXT_PUBLIC_TRACKING_ENABLED ?? true;
    const debug = env.NODE_ENV === 'development';

    return {
      ...env,
      enabled,
      debug,
    };
  } catch (error) {
    console.error('[Tracking Config] Invalid environment variables:', error);
    
    // Fallback do bezpiecznych wartości domyślnych
    return {
      NEXT_PUBLIC_FB_PIXEL_ID: undefined,
      NEXT_PUBLIC_TRACKING_ENABLED: false,
      NODE_ENV: 'development' as const,
      enabled: false,
      debug: false,
    };
  }
}

/**
 * Singleton instance konfiguracji
 */
let configInstance: TrackingConfig | null = null;

/**
 * Pobranie singleton instance konfiguracji
 */
export function getTrackingConfigInstance(): TrackingConfig {
  if (!configInstance) {
    configInstance = getTrackingConfig();
  }
  return configInstance;
}

/**
 * Resetowanie singleton instance (użyteczne w testach)
 */
export function resetTrackingConfig(): void {
  configInstance = null;
}

