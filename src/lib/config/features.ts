/**
 * Feature Flags Configuration
 * 
 * Kontroluje włączanie/wyłączanie nowych funkcjonalności.
 * Pozwala na stopniowe wdrażanie zmian i łatwe cofnięcie w razie problemów.
 */
import { clientEnv } from '@/config/env.client';

export const FEATURES = {
  /**
   * Użyj nowej wersji backendu (V2)
   * @default true - Włączone po pełnej implementacji
   */
  USE_V2_BACKEND: true,

  /**
   * Użyj nowego hooka useCart
   * @default true
   */
  USE_V2_CART: true,

  /**
   * Użyj nowego hooka useOrder  
   * @default true
   */
  USE_V2_ORDER: true,

  /**
   * Pobieraj dywaniki z API zamiast hardcoded
   * @default true
   */
  USE_MAT_API: true,

  /**
   * Pobieraj akcesoria z API
   * @default true
   */
  USE_ACCESSORIES_API: true,

  /**
   * Włącz automatyczną migrację localStorage z V1 do V2
   * @default false
   */
  ENABLE_CART_MIGRATION: false,

  /**
   * Katalog pojazdów i cennik oparte o mat_templates (zamiast car_models_extended)
   * @default true — wyłącz ustawiając NEXT_PUBLIC_MAT_TEMPLATES_CATALOG_ENABLED=false
   */
  MAT_TEMPLATES_CATALOG_ENABLED: clientEnv.features.matTemplatesCatalogEnabled,

  /**
   * Tryb debug - dodatkowe logi w konsoli
   * @default true w development
   */
  DEBUG_MODE: clientEnv.nodeEnv === 'development',
} as const;

/**
 * Helper do sprawdzania czy feature jest włączone
 */
export function isFeatureEnabled(feature: keyof typeof FEATURES): boolean {
  return FEATURES[feature] === true;
}

/**
 * Helper do logowania debug tylko gdy DEBUG_MODE jest włączony
 */
export function debugLog(message: string, ...args: any[]): void {
  if (FEATURES.DEBUG_MODE) {
    console.log(`[DEBUG] ${message}`, ...args);
  }
}

/**
 * Sprawdź czy używamy nowego backendu
 */
export function useV2Backend(): boolean {
  return FEATURES.USE_V2_BACKEND;
}

export function useMatTemplatesCatalog(): boolean {
  return FEATURES.MAT_TEMPLATES_CATALOG_ENABLED;
}

