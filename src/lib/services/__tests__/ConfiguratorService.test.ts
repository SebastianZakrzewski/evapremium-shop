import { describe, it, expect, beforeEach } from 'vitest';
import { ConfiguratorService } from '../ConfiguratorService';
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
    it('should calculate correct pricing for basic configuration', () => {
      const pricing = ConfiguratorService.calculatePricing(mockConfigData);

      expect(pricing).toBeDefined();
      expect(pricing.basePrice).toBeGreaterThan(0);
      expect(pricing.modifiers).toBeDefined();
      expect(pricing.totalPrice).toBe(pricing.basePrice + pricing.modifiers);
    });

    it('should apply correct modifiers for different set types', () => {
      const classicConfig = { ...mockConfigData, setType: 'classic' };
      const classicPricing = ConfiguratorService.calculatePricing(classicConfig);

      const premiumConfig = { ...mockConfigData, setType: '3d-with-rims' };
      const premiumPricing = ConfiguratorService.calculatePricing(premiumConfig);

      expect(classicPricing.totalPrice).toBeLessThan(premiumPricing.totalPrice);
    });

    it('should apply heel pad modifier when selected', () => {
      const withHeelPad = { ...mockConfigData, heelPad: 'tak' };
      const withoutHeelPad = { ...mockConfigData, heelPad: 'brak' };

      const withHeelPadPricing = ConfiguratorService.calculatePricing(withHeelPad);
      const withoutHeelPadPricing = ConfiguratorService.calculatePricing(withoutHeelPad);

      expect(withHeelPadPricing.totalPrice).toBeGreaterThan(withoutHeelPadPricing.totalPrice);
    });

    it('should apply edge color modifier for red edge', () => {
      const redEdgeConfig = { ...mockConfigData, edgeColor: 'red' };
      const blackEdgeConfig = { ...mockConfigData, edgeColor: 'black' };

      const redEdgePricing = ConfiguratorService.calculatePricing(redEdgeConfig);
      const blackEdgePricing = ConfiguratorService.calculatePricing(blackEdgeConfig);

      expect(redEdgePricing.totalPrice).toBeGreaterThan(blackEdgePricing.totalPrice);
    });
  });
});
