import { ConfigurationData, Product } from '@/entities/product';
import { ProductFactory } from '../factories/ProductFactory';

/**
 * Configurator Service
 * 
 * Service for configurator operations.
 * Delegates product creation to ProductFactory (Factory Pattern).
 */
export class ConfiguratorService {
  /**
   * Create product from configuration data
   * Delegates to ProductFactory
   */
  static createProductFromConfiguration(configData: ConfigurationData): Product {
    return ProductFactory.createProductFromConfiguration(configData);
  }

  /**
   * Validate configuration data
   * Delegates to ProductFactory
   */
  static validateConfiguration(configData: ConfigurationData): boolean {
    return ProductFactory.validateConfiguration(configData);
  }
}
