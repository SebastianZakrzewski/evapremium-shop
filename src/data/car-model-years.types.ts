// Auto-generated types for car model years data
export interface CarModelGeneration {
  id: number;
  generation: string;
  years: number[];
  yearRange: {
    min: number;
    max: number;
  };
}

export interface CarModelData {
  generations: CarModelGeneration[];
  availableYears: number[];
  yearRange: {
    min: number;
    max: number;
  };
  bodyTypes?: { [year: string]: string[] };
  allBodyTypes?: string[];
}

export interface CarModelYearsData {
  [brandName: string]: {
    [modelName: string]: CarModelData;
  };
}

// Import the actual data
import carModelYearsData from './car-model-years.json';
export default carModelYearsData as CarModelYearsData;
