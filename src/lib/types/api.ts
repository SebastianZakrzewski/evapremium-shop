// Typy dla nowych API samochodów

export interface CarModel {
  brand: string;
  model: string;
  generations: CarGeneration[];
  bodyTypes: string[];
  years: number[];
  isCurrentlyProduced: boolean;
}

export interface CarGeneration {
  brand: string;
  model: string;
  generation: string;
  yearFrom?: number;
  yearTo?: number;
  isCurrentlyProduced: boolean;
  bodyTypes: string[];
  years: number[];
}

export interface CarBrand {
  id: number;
  name: string;
  logo?: string;
  description?: string;
}

export interface BodyType {
  id: number;
  name: string;
  category: string;
  description: string;
}

// Typy dla parametrów zapytań API
export interface ModelsQueryParams {
  brand?: string;
  bodyType?: string;
  yearFrom?: number;
  yearTo?: number;
  isCurrentlyProduced?: boolean;
}

export interface GenerationsQueryParams {
  brand?: string;
  model?: string;
  bodyType?: string;
  yearFrom?: number;
  yearTo?: number;
  isCurrentlyProduced?: boolean;
}

// Typy dla odpowiedzi API
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

// Typy dla konfiguratora
export interface ConfiguratorOption {
  id: string;
  name: string;
}

export interface CarSelection {
  brand: string;
  model: string;
  year: string;
  bodyType: string;
}
