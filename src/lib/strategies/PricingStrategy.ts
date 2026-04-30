import { ProductPricing } from '@/entities/product';

/**
 * Pricing Strategy Interface
 * 
 * Defines the contract for different pricing strategies.
 * Allows easy addition of new pricing strategies without modifying existing code.
 */
export interface PricingStrategy {
  /**
   * Calculate price for a given variant
   */
  calculatePrice(setVariant: 'front' | 'basic' | 'premium' | 'complete'): ProductPricing;
}

/**
 * Base pricing configuration
 */
export interface BasePricingConfig {
  basePrice: {
    front: number;
    basic: number;
    premium: number;
    complete: number;
  };
  discountThreshold: number;
  discountAboveThreshold: number;
  discountBelowThreshold: number;
  shippingCost: number;
  freeShippingVariants: readonly ('front' | 'basic' | 'premium' | 'complete')[];
}




