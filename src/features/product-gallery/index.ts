// Product Gallery feature - Public API
// Re-eksportuje wszystkie komponenty, hooki i typy z feature product-gallery

// Re-eksport z features/products
export { ProductGallerySection, ProductSelection } from '../products';
export { default as ImageCarousel } from '../../components/ImageCarousel';

// Types (tymczasowo z oryginalnych lokalizacji)
export type { Product, ProductConfiguration, ProductPricing, CarDetails } from '../../entities/product';

// Hooks (będą dodane po migracji)
// export { useProductGallery } from './hooks/useProductGallery';
