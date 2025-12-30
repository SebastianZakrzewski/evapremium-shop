/**
 * Hook do pobierania modeli samochodów dla danej marki
 * 
 * Używa React Query do cache'owania i zarządzania stanem
 */

import { useQuery } from '@tanstack/react-query';
import { fetchCarModels } from '@/lib/api/models';
import { Model } from '@/entities/car';

export interface UseCarModelsReturn {
  models: CarModel[];
  isLoading: boolean;
  error: Error | null;
}

export interface UseCarModelsParams {
  brandApiName: string;
  enabled?: boolean;
}

/**
 * Hook do pobierania modeli samochodów dla danej marki
 * 
 * @param params - Parametry hooka (brandApiName, enabled)
 * @returns Obiekt z modelami, stanem ładowania i błędem
 */
export function useCarModels(params: UseCarModelsParams): UseCarModelsReturn {
  const { brandApiName, enabled = true } = params;

  const { data, isLoading, error } = useQuery({
    queryKey: ['car-models', brandApiName],
    queryFn: () => fetchCarModels(brandApiName),
    enabled: enabled && !!brandApiName,
    staleTime: 5 * 60 * 1000, // 5 minut
    gcTime: 10 * 60 * 1000, // 10 minut cache
    retry: false, // Nie próbuj ponownie przy błędzie - użyj fallback
  });

  return {
    models: data ?? [],
    isLoading,
    error: error as Error | null,
  };
}

