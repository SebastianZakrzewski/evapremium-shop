export interface CarBrand {
  id: number;
  name: string;
  displayName?: string;
  logo?: string;
  description?: string;
  website?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCarBrandRequest {
  name: string;
  displayName?: string;
  logo?: string;
  description?: string;
  website?: string;
  isActive?: boolean;
}

export interface UpdateCarBrandRequest extends Partial<CreateCarBrandRequest> {
  id: number;
} 