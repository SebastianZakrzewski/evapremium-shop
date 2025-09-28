export interface AccessoryCategory {
  id: number;
  name: string;
  description: string;
  icon: string;
}

export interface Accessory {
  id: number;
  name: string;
  category: string;
  price: string;
  imageSrc: string;
  description: string;
  features: string[];
  inStock: boolean;
  rating: number;
}

export interface AccessoryFilterState {
  categories: string[];
  priceRange: [number, number];
  inStock: boolean;
  rating: number;
}
