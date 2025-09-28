import { ConfigurationData, Product, ProductPricing } from '../types/product';

export class ConfiguratorService {
  private static readonly BASE_PRICE = 219;
  private static readonly HEEL_PAD_PRICE = 29;
  private static readonly RED_EDGE_PRICE = 10;

  private static readonly PRICE_MODIFIERS = {
    setType: {
      '3d-with-rims': 0,
      'classic': -40
    },
    cellType: {
      'diamonds': 0,
      'honey': 10
    },
    setVariant: {
      'front': -30,
      'basic': 0,
      'premium': 0
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
    const basePrice = this.BASE_PRICE;
    let modifiers = 0;

    // Modyfikatory dla rodzaju zestawu
    const setTypeModifier = this.PRICE_MODIFIERS.setType[configData.setType as keyof typeof this.PRICE_MODIFIERS.setType] || 0;
    modifiers += setTypeModifier;

    // Modyfikatory dla struktury komórek
    const cellTypeModifier = this.PRICE_MODIFIERS.cellType[configData.cellType as keyof typeof this.PRICE_MODIFIERS.cellType] || 0;
    modifiers += cellTypeModifier;

    // Modyfikatory dla wariantu zestawu
    const setVariantModifier = this.PRICE_MODIFIERS.setVariant[configData.setVariant as keyof typeof this.PRICE_MODIFIERS.setVariant] || 0;
    modifiers += setVariantModifier;

    // Dodatkowa opłata za podkładkę pod piętę
    if (configData.heelPad === 'tak') {
      modifiers += this.HEEL_PAD_PRICE;
    }

    // Dodatkowa opłata za czerwone obszycie
    if (configData.edgeColor === 'red') {
      modifiers += this.RED_EDGE_PRICE;
    }

    const totalPrice = Math.max(basePrice + modifiers, 99); // Minimalna cena 99 zł

    return {
      basePrice,
      modifiers,
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
}
