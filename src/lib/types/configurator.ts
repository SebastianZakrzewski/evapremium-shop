import { ConfigurationData, ProductConfiguration } from './product';

export interface ConfiguratorState {
  currentSection: number;
  selectedSetType: string;
  selectedCellType: string;
  selectedSetVariant: string;
  selectedMat: string;
  selectedEdge: string;
  selectedHeelPad: string;
}

export interface ConfiguratorService {
  createProductFromConfiguration(configData: ConfigurationData): import('./product').Product;
  validateConfiguration(configData: ConfigurationData): boolean;
  calculatePricing(configData: ConfigurationData): import('./product').ProductPricing;
}

export interface SetType {
  id: string;
  name: string;
  description: string;
  priceModifier: number;
}

export interface CellType {
  id: string;
  name: string;
  description: string;
  priceModifier: number;
}

export interface SetVariant {
  id: string;
  name: string;
  description: string;
  priceModifier: number;
}
