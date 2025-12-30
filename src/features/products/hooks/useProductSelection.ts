/**
 * Hook do zarządzania wyborem produktów (mats) dla marki
 * 
 * Konsoliduje logikę pobierania i filtrowania produktów
 */

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api/client';
import { Mat } from '@/entities/product';

export interface UseProductSelectionParams {
  brandSlug: string;
  enabled?: boolean;
}

export interface UseProductSelectionReturn {
  mats: Mat[];
  isLoading: boolean;
  error: Error | null;
  filters: {
    bodyTypes: string[];
    yearRanges: Array<{ from: number; to: number }>;
  };
  setFilters: (filters: {
    bodyTypes: string[];
    yearRanges: Array<{ from: number; to: number }>;
  }) => void;
  filteredMats: Mat[];
}

/**
 * Fetch mats for brand
 */
async function fetchMats(brandSlug: string): Promise<Mat[]> {
  try {
    const response = await apiGet<{ success: boolean; data: Mat[] }>(
      `/api/mats?carBrandSlug=${encodeURIComponent(brandSlug)}`
    );
    return response.data ?? [];
  } catch (error) {
    console.error('Error fetching mats:', error);
    return [];
  }
}

/**
 * Hook do zarządzania wyborem produktów
 */
export function useProductSelection(
  params: UseProductSelectionParams
): UseProductSelectionReturn {
  const { brandSlug, enabled = true } = params;
  const [filters, setFilters] = useState<{
    bodyTypes: string[];
    yearRanges: Array<{ from: number; to: number }>;
  }>({
    bodyTypes: [],
    yearRanges: [],
  });

  // Pobierz produkty (dywaniki) dla marki
  const { data: mats = [], isLoading, error } = useQuery({
    queryKey: ['mats', brandSlug],
    queryFn: () => fetchMats(brandSlug),
    enabled: enabled && !!brandSlug,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
  });

  // Filtruj produkty na podstawie filtrów
  const filteredMats = useMemo(() => {
    let filtered = [...mats];

    // Filtruj po typie nadwozia
    if (filters.bodyTypes.length > 0) {
      filtered = filtered.filter((mat) =>
        filters.bodyTypes.includes(mat.bodyType || '')
      );
    }

    // Filtruj po zakresie lat
    if (filters.yearRanges.length > 0) {
      filtered = filtered.filter((mat) => {
        return filters.yearRanges.some((range) => {
          const matYearFrom = mat.yearFrom ?? 0;
          const matYearTo = mat.yearTo ?? 9999;
          return (
            (range.from >= matYearFrom && range.from <= matYearTo) ||
            (range.to >= matYearFrom && range.to <= matYearTo) ||
            (range.from <= matYearFrom && range.to >= matYearTo)
          );
        });
      });
    }

    return filtered;
  }, [mats, filters]);

  return {
    mats,
    isLoading,
    error: error as Error | null,
    filters,
    setFilters,
    filteredMats,
  };
}






