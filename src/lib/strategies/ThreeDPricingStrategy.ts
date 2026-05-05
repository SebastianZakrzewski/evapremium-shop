import { PricingStrategy, BasePricingConfig } from './PricingStrategy';
import { ProductPricing } from '@/entities/product';

/**
 * 3D Pricing Strategy
 * 
 * Pricing strategy for 3D car mats with rims
 */
export class ThreeDPricingStrategy implements PricingStrategy {
  private readonly config: BasePricingConfig = {
    basePrice: {
      front: 550,
      basic: 910,
      premium: 1210,
      complete: 350
    },
    discountThreshold: 910,
    discountAboveThreshold: 0.30,
    discountBelowThreshold: 0.20,
    shippingCost: 27,
    freeShippingVariants: ['front', 'basic', 'premium', 'complete'] as const
  };

  calculatePrice(setVariant: 'front' | 'basic' | 'premium' | 'complete'): ProductPricing {
    const basePrice = this.config.basePrice[setVariant];
    
    // Discount based on threshold
    const discount = basePrice >= this.config.discountThreshold 
      ? this.config.discountAboveThreshold 
      : this.config.discountBelowThreshold;
    
    const discountAmount = basePrice * discount;
    const priceAfterDiscount = basePrice - discountAmount;
    
    // Shipping cost
    const shippingCost = (this.config.freeShippingVariants as readonly string[]).includes(setVariant)
      ? 0
      : this.config.shippingCost;
    
    const totalPrice = Math.round((priceAfterDiscount + shippingCost) * 100) / 100;

    return {
      basePrice,
      discount: discountAmount,
      shippingCost,
      totalPrice
    };
  }
}

