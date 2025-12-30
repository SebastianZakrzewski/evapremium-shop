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
    freeShippingVariants: ['basic', 'premium', 'complete'] as const
  };

  calculatePrice(setVariant: 'front' | 'basic' | 'premium' | 'complete'): ProductPricing {
    const basePrice = this.config.basePrice[setVariant];
    
    // Special case: classic + front should be 232 PLN after discount
    let discount: number;
    let priceAfterDiscount: number;
    
    if (setVariant === 'front') {
      discount = this.config.discountBelowThreshold;
      priceAfterDiscount = 232; // Fixed price for classic front
    } else {
      discount = basePrice >= this.config.discountThreshold 
        ? this.config.discountAboveThreshold 
        : this.config.discountBelowThreshold;
      const discountAmount = basePrice * discount;
      priceAfterDiscount = basePrice - discountAmount;
    }
    
    const discountAmount = basePrice - priceAfterDiscount;
    
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

