import { PricingStrategy, BasePricingConfig } from './PricingStrategy';
import { ProductPricing } from '@/entities/product';

/**
 * Classic Pricing Strategy
 * 
 * Pricing strategy for classic car mats
 */
export class ClassicPricingStrategy implements PricingStrategy {
  private readonly config: BasePricingConfig = {
    basePrice: {
      front: 290,
      basic: 510,
      premium: 710,
      complete: 350
    },
    discountThreshold: 910,
    discountAboveThreshold: 0.30,
    discountBelowThreshold: 0.20,
    shippingCost: 27,
    freeShippingThreshold: 637
  };

  calculatePrice(setVariant: 'front' | 'basic' | 'premium' | 'complete'): ProductPricing {
    const basePrice = this.config.basePrice[setVariant];
    
    const discount = basePrice >= this.config.discountThreshold
      ? this.config.discountAboveThreshold
      : this.config.discountBelowThreshold;

    const discountAmount = basePrice * discount;
    const priceAfterDiscount = basePrice - discountAmount;
    
    // Shipping cost
    const shippingCost = 0
    const totalPrice = Math.round(priceAfterDiscount * 100) / 100;

    return {
      basePrice,
      discount: discountAmount,
      shippingCost,
      totalPrice
    };
  }
}

