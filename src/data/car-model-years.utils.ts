import carModelYearsData, { CarModelYearsData, CarModelData } from './car-model-years.types';

/**
 * Pobiera dostępne lata dla danej marki i modelu
 */
export function getYearsForModel(brandName: string, modelName: string): number[] {
  const brand = carModelYearsData[brandName];
  if (!brand) return [];
  
  const model = brand[modelName];
  if (!model) return [];
  
  return model.availableYears;
}

/**
 * Pobiera dane modelu dla danej marki i modelu
 */
export function getModelData(brandName: string, modelName: string): CarModelData | null {
  const brand = carModelYearsData[brandName];
  if (!brand) return null;
  
  const model = brand[modelName];
  if (!model) return null;
  
  return model;
}

/**
 * Znajduje generację dla danego roku
 */
export function findGenerationByYear(brandName: string, modelName: string, year: number): string | null {
  const modelData = getModelData(brandName, modelName);
  if (!modelData) return null;
  
  for (const generation of modelData.generations) {
    if (generation.years.includes(year)) {
      return generation.generation;
    }
  }
  
  return null;
}

/**
 * Pobiera wszystkie dostępne marki
 */
export function getAvailableBrands(): string[] {
  return Object.keys(carModelYearsData);
}

/**
 * Pobiera wszystkie dostępne modele dla danej marki
 */
export function getAvailableModels(brandName: string): string[] {
  const brand = carModelYearsData[brandName];
  if (!brand) return [];
  
  return Object.keys(brand);
}

/**
 * Sprawdza czy dany rok jest dostępny dla modelu
 */
export function isYearAvailable(brandName: string, modelName: string, year: number): boolean {
  const years = getYearsForModel(brandName, modelName);
  return years.includes(year);
}

/**
 * Pobiera wszystkie dostępne typy nadwozia dla modelu
 */
export function getBodyTypesForModel(brandName: string, modelName: string): string[] {
  const modelData = getModelData(brandName, modelName);
  return modelData?.allBodyTypes || [];
}

/**
 * Pobiera typy nadwozia dla konkretnego rocznika
 */
export function getBodyTypesForYear(brandName: string, modelName: string, year: number): string[] {
  const modelData = getModelData(brandName, modelName);
  if (!modelData?.bodyTypes) return [];
  
  return modelData.bodyTypes[year.toString()] || [];
}

/**
 * Sprawdza czy typ nadwozia jest dostępny dla danego roku
 */
export function isBodyTypeAvailable(brandName: string, modelName: string, year: number, bodyType: string): boolean {
  const types = getBodyTypesForYear(brandName, modelName, year);
  return types.includes(bodyType);
}
