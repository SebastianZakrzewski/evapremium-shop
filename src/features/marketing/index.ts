// Marketing feature - Public API
// Re-eksportuje wszystkie komponenty, hooki, typy i dane z feature marketing

// Marketing components
export * from './components';

// Marketing sections (standalone components)
export { default as ThreeDMatsSection } from '../../components/3d-mats-section';
export { default as CustomFitSection } from '../../components/custom-fit-section';
export { default as RoznorodnaKolorystykaSection } from '../../components/roznorodna-kolorystyka-section';
export { default as GlebokaStrukturaKomorekSection } from '../../components/gleboka-struktura-komorek-section';
export { default as CustomerReviews } from '../../components/CustomerReviews';
export { default as FAQSection } from '../../components/FAQSection';

// Hooks (będą dodane po migracji)
// export { useBenefitsSection } from './hooks/useBenefitsSection';

// Types (będą dodane po migracji)
// export type { Benefit, TechnicalFeature } from './types/marketing';

// Data (będą dodane po migracji)
// export { benefits3D, features3D } from './data/benefits-data';
