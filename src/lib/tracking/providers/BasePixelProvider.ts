/**
 * Abstrakcyjna klasa bazowa dla tracking providerów
 * Umożliwia łatwe dodanie kolejnych pixelów (TikTok, Snapchat, etc.)
 */

import type {
  ITrackingProvider,
  TrackingEvent,
  EcommerceEventData,
  PageViewData,
  TrackingProviderOptions,
} from '../types';

export abstract class BasePixelProvider implements ITrackingProvider {
  protected initialized = false;
  protected enabled = true;
  protected debug = false;

  /**
   * Inicjalizacja providera
   */
  abstract init(options?: TrackingProviderOptions): void;

  /**
   * Wysyłanie zdarzenia trackingowego
   */
  abstract track(event: TrackingEvent, data: EcommerceEventData): void;

  /**
   * Wysyłanie zdarzenia PageView
   */
  abstract pageView(data: PageViewData): void;

  /**
   * Sprawdzenie czy provider jest zainicjalizowany
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Sprawdzenie czy tracking jest włączony
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Włączenie/wyłączenie tracking
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Włączenie/wyłączenie trybu debug
   */
  setDebug(debug: boolean): void {
    this.debug = debug;
  }

  /**
   * Logowanie w trybie debug
   */
  protected log(message: string, data?: unknown): void {
    if (this.debug) {
      console.log(`[Tracking:${this.constructor.name}]`, message, data || '');
    }
  }

  /**
   * Obsługa błędów
   */
  protected handleError(error: unknown, context: string): void {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Tracking:${this.constructor.name}] Error in ${context}:`, errorMessage);
    
    if (this.debug) {
      console.error('Full error:', error);
    }
  }

  /**
   * Walidacja danych przed wysłaniem
   */
  protected validateEventData(data: EcommerceEventData): boolean {
    if (!this.enabled) {
      this.log('Tracking disabled, skipping event');
      return false;
    }

    if (!this.initialized) {
      this.log('Provider not initialized, skipping event');
      return false;
    }

    return true;
  }
}

