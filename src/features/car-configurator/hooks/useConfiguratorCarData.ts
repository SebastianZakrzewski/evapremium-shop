/**
 * Hook do pobierania danych samochodowych dla konfiguratora z car_models_extended (API)
 *
 * Zastępuje statyczne dane z car-model-years.json danymi dynamicznymi z bazy.
 */

import { useMemo } from 'react';
import { useCarModels } from '@/features/brands/hooks/useCarModels';
import type { CarModelApiResponse, CarGenerationApiResponse } from '@/lib/types/api';
import { getYearsFromGenerations } from '../utils/generationYears';

export interface UseConfiguratorCarDataParams {
  brandApiName: string;
  enabled?: boolean;
}

export interface UseConfiguratorCarDataReturn {
  /** Lista nazw modeli dla wybranej marki */
  models: string[];
  /** Pobierz dostępne lata dla modelu */
  getYearsForModel: (modelName: string) => number[];
  /** Pobierz lata dla konkretnej generacji (lub wszystkie, gdy brak etykiety) */
  getYearsForGeneration: (modelName: string, generationLabel?: string | null) => number[];
  /** Pobierz wszystkie typy nadwozia dla modelu */
  getBodyTypesForModel: (modelName: string) => string[];
  /** Pobierz typy nadwozia dla konkretnego rocznika */
  getBodyTypesForYear: (modelName: string, year: number) => string[];
  /** Znajdź generację dla danego roku */
  findGenerationByYear: (modelName: string, year: number) => string | null;
  /** Dopasuj rok i nadwozie po etykiecie generacji z karty produktu */
  findCarDetailsByGeneration: (
    modelName: string,
    generationLabel: string
  ) => { year: number; bodyType: string | null } | null;
  isLoading: boolean;
  error: Error | null;
}

function yearInRange(year: number, yearFrom?: number | null, yearTo?: number | null): boolean {
  if (yearFrom != null && yearTo != null) return year >= yearFrom && year <= yearTo;
  if (yearFrom != null) return year >= yearFrom;
  if (yearTo != null) return year <= yearTo;
  return false;
}

/**
 * Hook dostarczający dane samochodowe (modele, lata, generacje, typy nadwozia)
 * z tabeli car_models_extended przez API /api/models
 */
export function useConfiguratorCarData(
  params: UseConfiguratorCarDataParams
): UseConfiguratorCarDataReturn {
  const { brandApiName, enabled = true } = params;
  const { models: apiModels, isLoading, error } = useCarModels({
    brandApiName,
    enabled: enabled && !!brandApiName,
  });

  const modelMap = useMemo(() => {
    const map = new Map<string, CarModelApiResponse>();
    for (const m of apiModels) {
      map.set(m.model, m);
    }
    return map;
  }, [apiModels]);

  /** Znajdź model po nazwie (case-insensitive – URL może mieć lowercase) */
  const findModelByName = useMemo(
    () => (modelName: string): CarModelApiResponse | undefined => {
      const exact = modelMap.get(modelName);
      if (exact) return exact;
      const lower = modelName.toLowerCase();
      for (const m of apiModels) {
        if (m.model.toLowerCase() === lower) return m;
      }
      return undefined;
    },
    [modelMap, apiModels]
  );

  const models = useMemo(() => apiModels.map((m) => m.model), [apiModels]);

  const getYearsForModel = useMemo(
    () => (modelName: string): number[] => {
      const model = findModelByName(modelName);
      return model?.years ?? [];
    },
    [findModelByName]
  );

  const getYearsForGeneration = useMemo(
    () =>
      (modelName: string, generationLabel?: string | null): number[] => {
        const model = findModelByName(modelName);
        if (!model?.generations) return [];
        return getYearsFromGenerations(
          model.generations as CarGenerationApiResponse[],
          generationLabel
        );
      },
    [findModelByName]
  );

  const getBodyTypesForModel = useMemo(
    () => (modelName: string): string[] => {
      const model = findModelByName(modelName);
      return model?.bodyTypes ?? [];
    },
    [findModelByName]
  );

  const getBodyTypesForYear = useMemo(
    () => (modelName: string, year: number): string[] => {
      const model = findModelByName(modelName);
      if (!model?.generations) return [];

      const bodyTypes = new Set<string>();
      for (const gen of model.generations as CarGenerationApiResponse[]) {
        if (yearInRange(year, gen.yearFrom, gen.yearTo) && gen.bodyType) {
          bodyTypes.add(gen.bodyType);
        }
      }
      return bodyTypes.size > 0 ? Array.from(bodyTypes).sort() : (model?.bodyTypes ?? []);
    },
    [findModelByName]
  );

  const findGenerationByYear = useMemo(
    () => (modelName: string, year: number): string | null => {
      const model = findModelByName(modelName);
      if (!model?.generations) return null;

      for (const gen of model.generations as CarGenerationApiResponse[]) {
        if (yearInRange(year, gen.yearFrom, gen.yearTo) && gen.generation) {
          return gen.generation;
        }
      }
      return null;
    },
    [findModelByName]
  );

  const findCarDetailsByGeneration = useMemo(
    () =>
      (
        modelName: string,
        generationLabel: string
      ): { year: number; bodyType: string | null } | null => {
        const model = findModelByName(modelName);
        if (!model?.generations) return null;

        const normalized = generationLabel.trim().toLowerCase();
        const match = (model.generations as CarGenerationApiResponse[]).find(
          (gen) => gen.generation?.trim().toLowerCase() === normalized
        );

        if (!match || match.yearFrom == null) return null;

        return {
          year: match.yearFrom,
          bodyType: match.bodyType ?? null,
        };
      },
    [findModelByName]
  );

  return {
    models,
    getYearsForModel,
    getYearsForGeneration,
    getBodyTypesForModel,
    getBodyTypesForYear,
    findGenerationByYear,
    findCarDetailsByGeneration,
    isLoading,
    error: error as Error | null,
  };
}
