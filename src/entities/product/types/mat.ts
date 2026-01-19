export interface Mat {
  id: string;
  carBrandSlug: string;
  carModelSlug: string;
  generation?: string;
  bodyType?: string;
  yearFrom?: number;
  yearTo?: number;
  basePrice: number;
  availableSetTypes: string[];
  availableCellTypes: string[];
  availableColors: string[];
  availableEdgeColors: string[];
  hasHeelPad: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MatConfiguration {
  carDetails: {
    brand: string;
    model: string;
    generation?: string;
    bodyType?: string;
    year: number;
  };
  setType: string;
  cellType: string;
  materialColor: string;
  edgeColor: string;
  heelPad: 'yes' | 'no';
}

export interface MatFilters {
  carBrandSlug?: string;
  carModelSlug?: string;
  generation?: string;
  bodyType?: string;
  yearFrom?: number;
  yearTo?: number;
  isActive?: boolean;
  orderBy?: 'basePrice' | 'createdAt';
  orderDirection?: 'asc' | 'desc';
}

export interface CreateMatDTO {
  carBrandSlug: string;
  carModelSlug: string;
  generation?: string;
  bodyType?: string;
  yearFrom?: number;
  yearTo?: number;
  basePrice: number;
  availableSetTypes: string[];
  availableCellTypes: string[];
  availableColors: string[];
  availableEdgeColors: string[];
  hasHeelPad: boolean;
  isActive: boolean;
}

export interface UpdateMatDTO extends Partial<CreateMatDTO> {
  id: string;
}

















