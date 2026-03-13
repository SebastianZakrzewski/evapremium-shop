// Typy dla nowych API samochodów

/** Odpowiedź API – pojedyncza generacja modelu (z car_models_extended) */
export interface CarGenerationApiResponse {
  generation: string;
  bodyType: string;
  yearFrom?: number | null;
  yearTo?: number | null;
  isCurrentlyProduced: boolean;
  templateAvailable?: boolean | null;
  templateLocation?: string | null;
  stoperType?: string | null;
  stoperCount?: number | null;
  notesGeneral?: string | null;
  notesFront?: string | null;
  notesRear?: string | null;
  notesTrunk?: string | null;
  hasHookMount?: boolean | null;
  matFormat?: string | null;
  completeness?: string | null;
  hasTunnelMat?: boolean | null;
  velcroNotes?: string | null;
}

/** Odpowiedź API – model auta z zgrupowanymi generacjami */
export interface CarModelApiResponse {
  brand: string;
  model: string;
  brandImage?: string | null;
  modelImage?: string | null;
  vehicleCategory?: string | null;
  bodyTypes: string[];
  years: number[];
  isCurrentlyProduced: boolean;
  generations: CarGenerationApiResponse[];
}

/** @deprecated Użyj CarModelApiResponse */
export interface CarModel {
  brand: string;
  model: string;
  generations: CarGeneration[];
  bodyTypes: string[];
  years: number[];
  isCurrentlyProduced: boolean;
}

/** @deprecated Użyj CarGenerationApiResponse */
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
