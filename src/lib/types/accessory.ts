export interface AccessoryCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
  parentId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Accessory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  originalPrice?: number;
  sku: string;
  imageSrc?: string;
  imageUrl?: string; // Alias for imageSrc for compatibility
  images?: string[]; // Tablica wielu obrazów
  availableColors?: string[]; // Dostępne kolory wariantu
  colorImages?: Record<string, string>; // Mapowanie kolor -> obraz
  features: string[];
  inStock: boolean;
  stockQuantity?: number;
  isActive: boolean;
  rating?: number;
  reviewCount: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  categoryId: number;
  category?: AccessoryCategory;
  categorySlug?: string; // For easier filtering
  productType?: 'organizer' | 'podpietka'; // Typ produktu dla filtrowania
  createdAt: Date;
  updatedAt: Date;
}

export interface AccessoryFilters {
  categories?: string[];
  inStock?: boolean;
  priceRange?: [number, number];
  orderBy?: 'name' | 'price' | 'rating' | 'createdAt';
  orderDirection?: 'asc' | 'desc';
}

export interface CreateAccessoryDTO {
  name: string;
  slug: string;
  description?: string;
  price: number;
  sku: string;
  imageSrc?: string;
  features: string[];
  inStock: boolean;
  stockQuantity?: number;
  isActive: boolean;
  rating?: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  categoryId: number;
}

export interface UpdateAccessoryDTO extends Partial<CreateAccessoryDTO> {
  id: string;
}
