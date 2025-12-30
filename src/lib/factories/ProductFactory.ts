import { ConfigurationData, Product, ProductPricing } from '@/entities/product';
import { HybridSessionManager } from '../utils/hybrid-session-manager';
import { PricingStrategy } from '../strategies/PricingStrategy';
import { ClassicPricingStrategy } from '../strategies/ClassicPricingStrategy';
import { ThreeDPricingStrategy } from '../strategies/ThreeDPricingStrategy';

/**
 * Product Factory
 * 
 * Centralizes product creation logic using Factory Pattern.
 * Supports different product types (mat, accessory) and configurations.
 */
export class ProductFactory {
  /**
   * Create product from configuration data
   */
  static createProductFromConfiguration(configData: ConfigurationData): Product {
    if (!this.validateConfiguration(configData)) {
      throw new Error('Invalid configuration data');
    }

    const pricing = this.calculatePricing(configData);
    const productId = this.generateProductId();

    const product: Product = {
      id: productId,
      sessionId: this.getCurrentSessionId(),
      name: this.generateProductName(configData),
      image: this.generateProductImage(configData),
      configuration: {
        setType: configData.setType,
        cellType: configData.cellType,
        setVariant: configData.setVariant,
        materialColor: configData.materialColor,
        edgeColor: configData.edgeColor,
        heelPad: configData.heelPad
      },
      pricing,
      carDetails: configData.carDetails,
      status: 'cached' as const,
      createdAt: new Date()
    };

    console.log('🏭 ProductFactory: Product created', {
      id: product.id,
      sessionId: product.sessionId,
      configuration: product.configuration,
      pricing: product.pricing,
      carDetails: product.carDetails
    });

    return product;
  }

  /**
   * Validate configuration data
   */
  static validateConfiguration(configData: ConfigurationData): boolean {
    const requiredFields: (keyof ConfigurationData)[] = [
      'setType',
      'cellType', 
      'setVariant',
      'materialColor',
      'edgeColor',
      'heelPad'
    ];

    for (const field of requiredFields) {
      const value = configData[field];
      if (!value || value === '') {
        return false;
      }
    }

    return true;
  }

  /**
   * Calculate pricing using Strategy Pattern
   */
  static calculatePricing(configData: ConfigurationData): ProductPricing {
    const strategy = this.getPricingStrategy(configData.setType as 'classic' | '3d-with-rims');
    return strategy.calculatePrice(configData.setVariant as 'front' | 'basic' | 'premium' | 'complete');
  }

  /**
   * Get appropriate pricing strategy based on set type
   */
  private static getPricingStrategy(setType: 'classic' | '3d-with-rims'): PricingStrategy {
    switch (setType) {
      case 'classic':
        return new ClassicPricingStrategy();
      case '3d-with-rims':
        return new ThreeDPricingStrategy();
      default:
        throw new Error(`Unknown set type: ${setType}`);
    }
  }

  /**
   * Generate unique product ID
   */
  private static generateProductId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 11);
    return `product-${timestamp}-${random}`;
  }

  /**
   * Get current session ID
   */
  private static getCurrentSessionId(): string {
    if (typeof window !== 'undefined') {
      return HybridSessionManager.getSessionId();
    }
    
    // Server-side: generate temporary ID
    return `temp-session-${Date.now()}`;
  }

  /**
   * Generate product name from configuration
   */
  private static generateProductName(configData: ConfigurationData): string {
    const carInfo = configData.carDetails ? 
      `${configData.carDetails.brand} ${configData.carDetails.model}` : 
      'Samochód';
    
    return `Dywaniki EVA ${carInfo} - ${configData.setType} ${configData.materialColor}`;
  }

  /**
   * Generate product image path from configuration
   */
  private static generateProductImage(configData: ConfigurationData): string {
    // Default image - can be extended with logic to select image based on configuration
    return '/images/konfigurator/dywaniki/3d/romby/czarne/5os-3d-diamonds-white-black.webp';
  }
}

