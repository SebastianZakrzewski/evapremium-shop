// Components - Main Public API
// Re-exports all component modules for easy importing

// Layout components
export * from './layout';

// UI components (shadcn/ui primitives)
export * from './ui';

// Marketing components
export * from './marketing';

// Product components
export * from './products';

// Product accessories
export * from './products/accessories';

// Brand components
export * from './brands';

// Configurator components
export * from './configurator';

// Checkout components
export * from './checkout';

// Standalone components (will be organized later)
export { default as ThreeDMatsSection } from './3d-mats-section';
export { default as QuickSearchBar } from './quick-search-bar';
export { default as CarModelsSection } from './car-models-section';
export { default as CustomFitSection } from './custom-fit-section';
export { default as RoznorodnaKolorystykaSection } from './roznorodna-kolorystyka-section';
export { default as GlebokaStrukturaKomorekSection } from './gleboka-struktura-komorek-section';
export { default as CustomerReviews } from './CustomerReviews';
export { default as FAQSection } from './FAQSection';
export { default as PartnersSection } from './PartnersSection';
export { default as CallToActionSection } from './CallToActionSection';
export { default as ContactSection } from './contact-section';
export { default as GallerySection } from './gallery-section';
export { default as ImageCarousel } from './ImageCarousel';
export { default as PageHeroBanner } from './page-hero-banner';
export { default as ModelNavigationBar } from './model-navigation-bar';
export { default as SearchDropdown } from './search-dropdown';
export { default as TrackingProvider } from './tracking-provider';
export { default as Chatbot } from './Chatbot';

// Re-exports from features (for backward compatibility)
export { CartModal, CartModalWrapper, CartItem } from '@/features/shopping-cart';
export { CheckoutSection, PaymentSuccess } from '@/features/checkout';
export { HeroSection, AdvantagesSection, AboutUsSection } from '@/features/marketing';
export { ProductGallerySection, ProductSelection, ProductCardV2, ProductSelectionSection } from '@/features/products';

// Legacy exports (will be moved to features)
export { default as AccessoriesSection } from './accessories-section';
export { default as AccessoryCard } from './accessory-card';
export { default as AccessoryDetailsSheet } from './accessory-details-sheet';

