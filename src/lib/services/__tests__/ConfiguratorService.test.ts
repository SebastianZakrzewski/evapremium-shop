import { describe, it, expect, beforeEach } from 'vitest';
import { ConfiguratorService } from '../ConfiguratorService';
import { ProductFactory } from '../../factories/ProductFactory';
import { PricingService } from '../PricingService';
import { ConfigurationData, ProductConfiguration } from '../../types/product';

describe('ConfiguratorService', () => {
  let mockConfigData: ConfigurationData;

  beforeEach(() => {
    mockConfigData = {
      setType: '3d-with-rims',
      cellType: 'diamonds',
      setVariant: 'basic',
      materialColor: 'black',
      edgeColor: 'red',
      heelPad: 'tak',
      carDetails: {
        brand: 'BMW',
        model: 'X5',
        year: '2023'
      }
    };
  });

  describe('createProductFromConfiguration', () => {
    it('should create a valid product from configuration data', () => {
      const product = ConfiguratorService.createProductFromConfiguration(mockConfigData);

      expect(product).toBeDefined();
      expect(product.id).toBeDefined();
      expect(product.sessionId).toBeDefined();
      expect(product.configuration).toEqual({
        setType: '3d-with-rims',
        cellType: 'diamonds',
        setVariant: 'basic',
        materialColor: 'black',
        edgeColor: 'red',
        heelPad: 'tak'
      });
      expect(product.carDetails).toEqual(mockConfigData.carDetails);
      expect(product.status).toBe('cached');
      expect(product.createdAt).toBeInstanceOf(Date);
    });

    it('should generate unique IDs for different products', () => {
      const product1 = ConfiguratorService.createProductFromConfiguration(mockConfigData);
      const product2 = ConfiguratorService.createProductFromConfiguration(mockConfigData);

      expect(product1.id).not.toBe(product2.id);
    });

    it('should handle configuration without car details', () => {
      const configWithoutCar = { ...mockConfigData };
      delete configWithoutCar.carDetails;

      const product = ConfiguratorService.createProductFromConfiguration(configWithoutCar);

      expect(product.carDetails).toBeUndefined();
    });
  });

  describe('validateConfiguration', () => {
    it('should return true for valid configuration', () => {
      const isValid = ConfiguratorService.validateConfiguration(mockConfigData);
      expect(isValid).toBe(true);
    });

    it('should return false for configuration with missing required fields', () => {
      const invalidConfig = { ...mockConfigData };
      delete (invalidConfig as any).setType;

      const isValid = ConfiguratorService.validateConfiguration(invalidConfig);
      expect(isValid).toBe(false);
    });

    it('should return false for configuration with empty strings', () => {
      const invalidConfig = { ...mockConfigData, setType: '' };

      const isValid = ConfiguratorService.validateConfiguration(invalidConfig);
      expect(isValid).toBe(false);
    });
  });

  describe('calculatePricing', () => {
    it('prices a basic 3D set from the factory strategy used by product creation', () => {
      const pricing = ProductFactory.calculatePricing(mockConfigData);
      const created = ConfiguratorService.createProductFromConfiguration(mockConfigData);

      expect(pricing.basePrice).toBe(910);
      expect(pricing.totalPrice).toBe(637);
      expect(created.pricing).toEqual(pricing);
    });

    it('prices classic below 3D for the same basic variant', () => {
      const classicPricing = ProductFactory.calculatePricing({ ...mockConfigData, setType: 'classic' });
      const premiumPricing = ProductFactory.calculatePricing({ ...mockConfigData, setType: '3d-with-rims' });

      expect(classicPricing.basePrice).toBe(510);
      expect(classicPricing.totalPrice).toBe(408);
      expect(classicPricing.totalPrice).toBeLessThan(premiumPricing.totalPrice);
    });

    it('does not add a heel-pad surcharge in the legacy mat calculator', () => {
      const withHeelPad = PricingService.calculateMatPrice(219, { ...mockConfigData, heelPad: 'yes' });
      const withoutHeelPad = PricingService.calculateMatPrice(219, { ...mockConfigData, heelPad: 'brak' });

      expect(withHeelPad).toBe(withoutHeelPad);
      expect(withHeelPad).toBe(219);
    });

    it('does not change the factory total when only the edge color changes', () => {
      const redEdgePricing = ProductFactory.calculatePricing({ ...mockConfigData, edgeColor: 'red' });
      const blackEdgePricing = ProductFactory.calculatePricing({ ...mockConfigData, edgeColor: 'black' });

      expect(redEdgePricing).toEqual(blackEdgePricing);
    });
  });
});
