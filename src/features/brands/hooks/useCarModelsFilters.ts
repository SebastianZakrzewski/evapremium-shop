"use client";

import { useMemo } from "react";
import { formatBodyTypeLabel, formatGenerationLabel, normalizeBodyTypeKey, getDoorsCount } from "@/shared";

type CarModelItem = {
  id?: string | number;
  name: string;
  nameDisplay?: string;
  modelFamilyKey?: string;
  brand?: string;
  imageSrc?: string;
  bodyType?: string | null;
  bodyTypeDisplay?: string | null;
  generation?: string | null;
  generationDisplay?: string | null;
  yearFrom?: number;
  yearTo?: number;
};

export interface CarModelsFilterState {
  bodyTypes: string[];
  generations: string[];
}

export interface AvailableBodyType {
  key: string;
  label: string;
}

export function useCarModelsFilters({
  brandParam,
  displayModels,
  modelsWithImages,
  filters,
  selectedModel,
}: {
  brandParam: string | null;
  displayModels: CarModelItem[];
  modelsWithImages: CarModelItem[];
  filters: CarModelsFilterState;
  selectedModel: string | null;
}) {
  const availableBodyTypes = useMemo<AvailableBodyType[]>(() => {
    if (brandParam && displayModels.length > 0) {
      const types = new Map<string, string>();
      displayModels.forEach((model) => {
        if (model.bodyType) {
          const key = normalizeBodyTypeKey(model.bodyType);
          if (key) {
            types.set(key, formatBodyTypeLabel(key));
          }
        }
      });
      return Array.from(types.entries())
        .map(([key, label]) => ({ key, label }))
        .sort((a, b) => a.label.localeCompare(b.label));
    }
    return [];
  }, [displayModels, brandParam]);

  const availableGenerations = useMemo(() => {
    if (brandParam && displayModels.length > 0) {
      const generations = new Map<string, string>();
      displayModels.forEach((model) => {
        if (model.generation) {
          generations.set(
            model.generation,
            model.generationDisplay ?? model.generation,
          );
        }
      });
      return [...generations.entries()]
        .sort(([left], [right]) => left.localeCompare(right, "pl"))
        .map(([value, label]) => ({ value, label }));
    }
    return [];
  }, [displayModels, brandParam]);

  const filteredModels = useMemo(() => {
    if (!brandParam || modelsWithImages.length === 0) {
      return [];
    }

    return modelsWithImages.filter((model) => {
      if (selectedModel) {
        const familyKey = model.modelFamilyKey ?? model.name;
        if (familyKey.toLowerCase() !== selectedModel.toLowerCase()) {
          return false;
        }
      }

      if (filters.bodyTypes.length > 0) {
        if (!model.bodyType) return false;
        const normalizedModelType = normalizeBodyTypeKey(model.bodyType);
        if (!filters.bodyTypes.includes(normalizedModelType)) {
          return false;
        }
      }

      if (filters.generations.length > 0) {
        if (!model.generation || !filters.generations.includes(model.generation)) {
          return false;
        }
      }

      return true;
    });
  }, [modelsWithImages, filters, brandParam, selectedModel]);

  const activeFiltersCount = filters.bodyTypes.length + filters.generations.length + (selectedModel ? 1 : 0);

  return {
    availableBodyTypes,
    availableGenerations,
    filteredModels,
    activeFiltersCount,
    formatGenerationLabel,
    getDoorsCount,
    normalizeBodyTypeKey,
  };
}

