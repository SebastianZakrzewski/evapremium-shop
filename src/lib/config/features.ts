/**
 * Feature Flags Configuration
 * 
 * Kontroluje włączanie/wyłączanie nowych funkcjonalności.
 * Pozwala na stopniowe wdrażanie zmian i łatwe cofnięcie w razie problemów.
 */

export const FEATURES = {
  /**
   * Użyj nowej wersji backendu (V2)
   * @default false - Domyślnie wyłączone, włączymy po pełnej implementacji
   */
  USE_V2_BACKEND: false,

  /**
   * Użyj nowego hooka useCart
   * @default false
   */
  USE_V2_CART: false,

  /**
   * Użyj nowego hooka useOrder  
   * @default false
   */
  USE_V2_ORDER: false,

  /**
   * Pobieraj dywaniki z API zamiast hardcoded
   * @default false
   */
  USE_MAT_API: false,

  /**
   * Pobieraj akcesoria z API
   * @default false
   */
  USE_ACCESSORIES_API: false,

  /**
   * Włącz automatyczną migrację localStorage z V1 do V2
   * @default false
   */
  ENABLE_CART_MIGRATION: false,

  /**
   * Tryb debug - dodatkowe logi w konsoli
   * @default true w development
   */
  DEBUG_MODE: process.env.NODE_ENV === 'development',
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

