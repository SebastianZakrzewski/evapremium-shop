"use client";

import { useMemo } from "react";
import { normalizeBodyTypeKey, formatBodyTypeLabel } from "@/shared";

export interface ProductSelectionFilterState {
  bodyTypes: string[];
  yearRanges: string[];
}

export interface ProductSelectionItem {
  model: string;
  bodyType?: string;
  yearFrom?: number;
  yearTo?: number;
  generation?: string;
}

export function useProductSelectionFilters<T extends ProductSelectionItem>({
  products,
  filters,
  selectedModel,
  selectedBodyType,
}: {
  products: T[];
  filters: ProductSelectionFilterState;
  selectedModel: string | null;
  selectedBodyType: string | null;
}) {
  const availableBodyTypes = useMemo(() => {
    const counts = new Map<string, number>();

    products.forEach((product) => {
      if (product.bodyType) {
        const key = normalizeBodyTypeKey(product.bodyType);
        if (key) {
          counts.set(key, (counts.get(key) || 0) + 1);
        }
      }
    });

    const order = ['sedan', 'hatchback', 'kombi', 'suv', 'minivan', 'van', 'coupe', 'kabriolet', 'roadster', 'fastback', 'liftback', 'shooting brake'];
    return Array.from(counts.entries())
      .map(([key, count]) => ({ key, label: formatBodyTypeLabel(key), count }))
      .sort((a, b) => {
        const indexA = order.indexOf(a.key);
        const indexB = order.indexOf(b.key);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.label.localeCompare(b.label);
      });
  }, [products]);

  const availableYearRanges = useMemo(() => {
    const yearRangeCounts = new Map<string, number>();

    products.forEach((product) => {
      if (product.yearFrom && product.yearTo) {
        const range = `${product.yearFrom}-${product.yearTo}`;
        yearRangeCounts.set(range, (yearRangeCounts.get(range) || 0) + 1);
      }
    });

    return Array.from(yearRangeCounts.entries())
      .map(([range, count]) => ({ range, count }))
      .sort((a, b) => {
        const aStart = parseInt(a.range.split("-")[0], 10);
        const bStart = parseInt(b.range.split("-")[0], 10);
        return bStart - aStart;
      });
  }, [products]);

  const availableModels = useMemo(() => {
    const modelBodyTypeMap = new Map<string, { model: string; bodyType: string; count: number }>();
    products.forEach((product) => {
      const key = `${product.model}-${normalizeBodyTypeKey(product.bodyType || 'universal')}`;
      if (!modelBodyTypeMap.has(key)) {
        modelBodyTypeMap.set(key, {
          model: product.model,
          bodyType: normalizeBodyTypeKey(product.bodyType || 'universal'),
          count: 1,
        });
      } else {
        const existing = modelBodyTypeMap.get(key)!;
        existing.count += 1;
      }
    });

    return Array.from(modelBodyTypeMap.values()).sort((a, b) => {
      if (a.model !== b.model) {
        return a.model.localeCompare(b.model);
      }
      return a.bodyType.localeCompare(b.bodyType);
    });
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (selectedModel && selectedBodyType) {
      filtered = filtered.filter((product) => {
        if (product.model !== selectedModel) return false;
        if (!product.bodyType) return false;
        const normalizedProductType = normalizeBodyTypeKey(product.bodyType);
        const normalizedSelectedType = normalizeBodyTypeKey(selectedBodyType);
        return normalizedProductType === normalizedSelectedType;
      });
    } else if (selectedModel) {
      filtered = filtered.filter((product) => product.model === selectedModel);
    }

    if (filters.bodyTypes.length > 0) {
      filtered = filtered.filter((product) => {
        if (!product.bodyType) return false;
        const normalizedType = normalizeBodyTypeKey(product.bodyType);
        return filters.bodyTypes.includes(normalizedType);
      });
    }

    if (filters.yearRanges.length > 0) {
      filtered = filtered.filter((product) => {
        if (!product.yearFrom || !product.yearTo) return false;
        const productRange = `${product.yearFrom}-${product.yearTo}`;
        return filters.yearRanges.includes(productRange);
      });
    }

    return filtered;
  }, [products, selectedModel, selectedBodyType, filters]);

  const activeFiltersCount = filters.bodyTypes.length + filters.yearRanges.length + (selectedModel ? 1 : 0);

  return {
    availableBodyTypes,
    availableYearRanges,
    availableModels,
    filteredProducts,
    activeFiltersCount,
    normalizeBodyTypeKey,
  };
}






