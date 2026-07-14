// Car Configurator feature - Public API
// Re-eksportuje wszystkie komponenty, hooki, serwisy i typy z feature car-configurator

// Tymczasowo importujemy z oryginalnych lokalizacji, aby zachować kompatybilność
export { default as Configurator } from '../../components/configurator/Configurator';
export { default as CarMatPreview } from '../../components/configurator/CarMatPreview';

// Services (tymczasowo z oryginalnych lokalizacji)
export { ConfiguratorService } from '../../lib/services/ConfiguratorService';
export { CarMatService } from '../../lib/services/carmat-service';

// Types (tymczasowo z oryginalnych lokalizacji)
export type { Product, ProductConfiguration, ProductPricing, CarDetails, ConfigurationData } from '../../entities/product';
export type { SetType, CellType, SetVariant } from '../../lib/types/configurator';

// Hooks (będą dodane po migracji)
export { useConfiguratorState } from "./hooks/useConfiguratorState";
export { useConfiguratorCarData } from "./hooks/useConfiguratorCarData";
export type { ConfiguratorState } from "./utils/configuratorState";
export { buildConfiguratorEntryUrl } from "./utils/buildConfiguratorEntryUrl";
export type { ConfiguratorEntryParams } from "./utils/buildConfiguratorEntryUrl";
export type { UseConfiguratorCarDataReturn, UseConfiguratorCarDataParams } from "./hooks/useConfiguratorCarData";

// Domain
export * from "./domain/pricing";

// V2 adapters
export { mapConfiguratorV2Sections } from "./adapters/configuratorV2SectionMapper";
export type {
  ConfiguratorV2SectionId,
  ConfiguratorV2Metric,
  SectionReadiness,
} from "./adapters/configuratorV2SectionMapper";
