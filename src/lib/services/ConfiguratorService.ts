import { ConfigurationData, Product, ProductPricing } from '../types/product';

export class ConfiguratorService {
  private static readonly PRICING_CONFIG = {
    basePrice: {
      'classic': { front: 290, basic: 510, premium: 710, complete: 350 },
      '3d-with-rims': { front: 550, basic: 910, premium: 1210, complete: 350 }
    },
    // Rabat zależny od wartości: -30% dla ≥910 zł, -20% dla <910 zł
    getDiscount: (basePrice: number) => {
      return basePrice >= 910 ? 0.30 : 0.20;
    },
    shipping: {
      cost: 27,
      freeForVariants: ['basic', 'premium', 'complete'] as const
    }
  };

  /**
   * Tworzy obiekt Product z danych konfiguracji
   */
  static createProductFromConfiguration(configData: ConfigurationData): Product {
    if (!this.validateConfiguration(configData)) {
      throw new Error('Invalid configuration data');
    }

    const pricing = this.calculatePricing(configData);
    const productId = this.generateProductId();

    const product = {
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

    console.log('🏭 ConfiguratorService: Product created', {
      id: product.id,
      sessionId: product.sessionId,
      configuration: product.configuration,
      pricing: product.pricing,
      carDetails: product.carDetails
    });

    return product;
  }

  /**
   * Waliduje dane konfiguracji
   */
  static validateConfiguration(configData: ConfigurationData): boolean {
    const requiredFields = [
      'setType',
      'cellType', 
      'setVariant',
      'materialColor',
      'edgeColor',
      'heelPad'
    ];

    for (const field of requiredFields) {
      if (!configData[field as keyof ConfigurationData] || 
          configData[field as keyof ConfigurationData] === '') {
        return false;
      }
    }

    return true;
  }

  /**
   * Oblicza cenę na podstawie konfiguracji
   */
  static calculatePricing(configData: ConfigurationData): ProductPricing {
    const setType = configData.setType;
    const setVariant = configData.setVariant;
    
    // Bazowa cena kompletu
    const basePrice = this.PRICING_CONFIG.basePrice[setType as keyof typeof this.PRICING_CONFIG.basePrice]?.[setVariant as 'front' | 'basic' | 'premium' | 'complete'] || 0;
    
    // Rabat zależny od wartości
    const discount = this.PRICING_CONFIG.getDiscount(basePrice);
    const discountAmount = basePrice * discount;
    const priceAfterDiscount = basePrice - discountAmount;
    
    // Koszt wysyłki
    const shippingCost = this.PRICING_CONFIG.shipping.freeForVariants.includes(setVariant as any)
      ? 0
      : this.PRICING_CONFIG.shipping.cost;
    
    const totalPrice = Math.round(priceAfterDiscount + shippingCost);

    return {
      basePrice,
      discount: discountAmount,
      shippingCost,
      totalPrice
    };
  }

  /**
   * Generuje unikalny ID produktu
   */
  private static generateProductId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `product-${timestamp}-${random}`;
  }

  /**
   * Pobiera aktualny session ID
   */
  private static getCurrentSessionId(): string {
    if (typeof window !== 'undefined') {
      // W przeglądarce - użyj HybridSessionManager
      const { HybridSessionManager } = require('../utils/hybrid-session-manager');
      return HybridSessionManager.getSessionId();
    }
    
    // Na serwerze - wygeneruj tymczasowy ID
    return `temp-session-${Date.now()}`;
  }

  /**
   * Generuje nazwę produktu na podstawie konfiguracji
   */
  private static generateProductName(configData: ConfigurationData): string {
    const carInfo = configData.carDetails ? 
      `${configData.carDetails.brand} ${configData.carDetails.model}` : 
      'Samochód';
    
    return `Dywaniki EVA ${carInfo} - ${configData.setType} ${configData.materialColor}`;
  }

  /**
   * Generuje ścieżkę do obrazu produktu na podstawie konfiguracji
   */
  private static generateProductImage(configData: ConfigurationData): string {
    // Domyślny obraz - można rozszerzyć o logikę wyboru obrazu na podstawie konfiguracji
    return '/images/konfigurator/dywaniki/3d/romby/czarne/5os-3d-diamonds-white-black.webp';
  }
}
