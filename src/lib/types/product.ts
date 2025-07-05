export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  images: string[];
  specifications: Record<string, string>;
  inStock: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductCategory = '3d-with-rims' | '3d-without-rims' | 'standard';

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  category?: ProductCategory;
  images?: string[];
  specifications?: Record<string, string>;
  inStock?: boolean;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: string;
} 