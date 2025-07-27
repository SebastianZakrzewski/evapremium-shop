export interface CarModel {
  id: number;
  name: string;
  displayName?: string;
  yearFrom?: number;
  yearTo?: number;
  generation?: string;
  bodyType?: string;
  engineType?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  carBrandId: number;
  carBrand?: CarBrand;
}

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

export interface CreateCarModelRequest {
  name: string;
  displayName?: string;
  yearFrom?: number;
  yearTo?: number;
  generation?: string;
  bodyType?: string;
  engineType?: string;
  carBrandId: number;
}

export interface UpdateCarModelRequest {
  name?: string;
  displayName?: string;
  yearFrom?: number;
  yearTo?: number;
  generation?: string;
  bodyType?: string;
  engineType?: string;
  carBrandId?: number;
}

export interface CarModelFilters {
  brandId?: number;
  bodyType?: string;
  engineType?: string;
  yearFrom?: number;
  yearTo?: number;
}

export type BodyType = 'sedan' | 'suv' | 'hatchback' | 'coupe' | 'wagon' | 'convertible' | 'pickup' | 'van';
export type EngineType = 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'plug-in-hybrid'; 