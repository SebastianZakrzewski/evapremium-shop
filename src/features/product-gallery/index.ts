// Product Gallery feature - Public API
// Re-eksportuje wszystkie komponenty, hooki i typy z feature product-gallery

// Tymczasowo importujemy z oryginalnych lokalizacji, aby zachować kompatybilność
export { default as ProductGallerySection } from '../../components/products/product-gallery-section';
export { default as ProductSelection } from '../../components/products/product-selection';
export { default as ImageCarousel } from '../../components/ImageCarousel';

// Types (tymczasowo z oryginalnych lokalizacji)
export type { Product, ProductConfiguration, ProductPricing, CarDetails } from '../../entities/product';

// Hooks (będą dodane po migracji)
// export { useProductGallery } from './hooks/useProductGallery';
