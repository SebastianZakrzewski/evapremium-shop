// Shared utilities and components - Public API
// Re-eksportuje wszystkie wspólne komponenty, hooki, serwisy i typy

// Tymczasowo importujemy z oryginalnych lokalizacji, aby zachować kompatybilność
export { default as Navbar } from '../components/navbar';
export { default as Footer } from '../components/footer';

// UI Components (tymczasowo z oryginalnych lokalizacji)
export { Button, buttonVariants } from '../components/ui/button';
export { Card } from '../components/ui/card';
export { Input } from '../components/ui/input';
export { Checkbox } from '../components/ui/checkbox';
export { Label } from '../components/ui/label';
export { RadioGroup } from '../components/ui/radio-group';
export { Separator } from '../components/ui/separator';
export { default as BrandCard } from '../components/ui/BrandCard';
export { default as WindowCard } from '../components/ui/WindowCard';

// Utils (tymczasowo z oryginalnych lokalizacji)
export { cn } from '../lib/utils';

// Brand helpers
export {
  getBrandMetaBySlug,
  mapSlugToCanonicalBrand,
  humanizeBrandSlug,
  supportedBrands,
} from './brands/brandNormalizer';
export {
  fetchCarModelsByApiName,
  fetchCarModelsBySlug,
  resolveBrandApiName,
  buildCarModelsApiUrl,
} from './brands/carModelsApi';

// Hooks (będą dodane po migracji)
// export { useLocalStorage } from './hooks/useLocalStorage';
// export { useDebounce } from './hooks/useDebounce';

// Services (będą dodane po migracji)
// export { ApiClient } from './services/api/client';

// Types (będą dodane po migracji)
// export type { ApiResponse, CommonTypes } from './types/common';
