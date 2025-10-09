// Car Configurator feature - Public API
// Re-eksportuje wszystkie komponenty, hooki, serwisy i typy z feature car-configurator

// Tymczasowo importujemy z oryginalnych lokalizacji, aby zachować kompatybilność
export { default as Configurator } from '../../components/Configurator';
export { default as CarMatPreview } from '../../components/CarMatPreview';

// Services (tymczasowo z oryginalnych lokalizacji)
export { ConfiguratorService } from '../../lib/services/ConfiguratorService';
export { CarMatService } from '../../lib/services/carmat-service';

// Types (tymczasowo z oryginalnych lokalizacji)
export type { Product, ProductConfiguration, ProductPricing, CarDetails, ConfigurationData } from '../../lib/types/product';
export type { ConfiguratorState, SetType, CellType, SetVariant } from '../../lib/types/configurator';

// Hooks (będą dodane po migracji)
// export { useConfigurator } from './hooks/useConfigurator';
